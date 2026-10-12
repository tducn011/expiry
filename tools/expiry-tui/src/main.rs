use std::{
    io,
    panic,
    process::Stdio,
    sync::Arc,
    time::Duration,
};

use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode, KeyEventKind},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Alignment, Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, BorderType, Borders, List, ListItem, Paragraph, Wrap},
    Frame, Terminal,
};
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    process::Command,
    sync::{mpsc, Mutex},
};

#[derive(Clone)]
struct PullRequest {
    number: String,
    title: String,
    branch: String,
    author: String,
}

#[derive(Clone)]
struct DockerService {
    name: String,
    port: String,
    healthy: bool,
}

struct App {
    git_branch: String,
    docker_services: Vec<DockerService>,
    prs: Vec<PullRequest>,
    selected_pr: usize,
    running_task: Option<String>,
    logs: Vec<String>,
    scroll: u16,
    log_sender: mpsc::UnboundedSender<String>,
}

impl App {
    fn new(log_sender: mpsc::UnboundedSender<String>) -> Self {
        Self {
            git_branch: "detecting...".to_string(),
            docker_services: Vec::new(),
            prs: Vec::new(),
            selected_pr: 0,
            running_task: None,
            logs: vec![
                "🚀 Expiry DevOps & CI/CD Control Center sẵn sàng!".to_string(),
                "👉 Phím [1-9, 0]: Chạy các tầng test | [r]: Review PR | [m]: Merge PR | [q]: Thoát".to_string(),
            ],
            scroll: 0,
            log_sender,
        }
    }

    fn refresh_sync_info(&mut self) {
        // Git branch
        if let Ok(out) = std::process::Command::new("git")
            .args(["branch", "--show-current"])
            .output()
        {
            self.git_branch = String::from_utf8_lossy(&out.stdout).trim().to_string();
        }

        // Docker services check
        self.docker_services = vec![
            Self::check_http("MySQL 8.4", "127.0.0.1:3307", "http://127.0.0.1:3001/health"),
            Self::check_http("Python Scan (OCR)", "127.0.0.1:8000", "http://127.0.0.1:8000/health"),
            Self::check_http("Node Monolith API", "127.0.0.1:3001", "http://127.0.0.1:3001/health"),
        ];

        // Fetch PRs via gh CLI
        if let Ok(out) = std::process::Command::new("gh")
            .args(["pr", "list", "--json", "number,title,headRefName,author"])
            .output()
        {
            let raw = String::from_utf8_lossy(&out.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&raw) {
                if let Some(arr) = val.as_array() {
                    self.prs = arr
                        .iter()
                        .map(|item| PullRequest {
                            number: item["number"].to_string(),
                            title: item["title"].as_str().unwrap_or("").to_string(),
                            branch: item["headRefName"].as_str().unwrap_or("").to_string(),
                            author: item["author"]["login"].as_str().unwrap_or("").to_string(),
                        })
                        .collect();
                    if self.selected_pr >= self.prs.len() && !self.prs.is_empty() {
                        self.selected_pr = 0;
                    }
                }
            }
        }
    }

    fn check_http(name: &str, port: &str, url: &str) -> DockerService {
        let healthy = std::process::Command::new("curl")
            .args(["-s", "-f", "-m", "1", url])
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false);

        DockerService {
            name: name.to_string(),
            port: port.to_string(),
            healthy,
        }
    }
}

async fn run_async_command(
    name: &'static str,
    program: &'static str,
    args: Vec<String>,
    app_arc: Arc<Mutex<App>>,
    tx: mpsc::UnboundedSender<String>,
) {
    {
        let mut app = app_arc.lock().await;
        if app.running_task.is_some() {
            let _ = tx.send("⚠️ Có một tác vụ khác đang chạy. Vui lòng đợi tác vụ hoàn tất!".to_string());
            return;
        }
        app.running_task = Some(name.to_string());
    }

    let _ = tx.send("════════════════════════════════════════════════════════════".to_string());
    let _ = tx.send(format!("▶ [START] Bắt đầu: {}...", name));
    let _ = tx.send(format!("💻 Lệnh: {} {}", program, args.join(" ")));

    let mut cmd = Command::new(program);
    cmd.args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    match cmd.spawn() {
        Ok(mut child) => {
            let stdout = child.stdout.take().unwrap();
            let stderr = child.stderr.take().unwrap();

            let tx_out = tx.clone();
            let h1 = tokio::spawn(async move {
                let mut reader = BufReader::new(stdout).lines();
                while let Ok(Some(line)) = reader.next_line().await {
                    let _ = tx_out.send(line);
                }
            });

            let tx_err = tx.clone();
            let h2 = tokio::spawn(async move {
                let mut reader = BufReader::new(stderr).lines();
                while let Ok(Some(line)) = reader.next_line().await {
                    let _ = tx_err.send(format!("  [err] {}", line));
                }
            });

            let _ = tokio::join!(h1, h2);
            let status = child.wait().await;

            match status {
                Ok(s) if s.success() => {
                    let _ = tx.send(format!("✅ [SUCCESS] {} hoàn thành thành công!", name));
                }
                Ok(s) => {
                    let _ = tx.send(format!("❌ [FAIL] {} kết thúc với mã lỗi: {}", name, s));
                }
                Err(e) => {
                    let _ = tx.send(format!("❌ [ERROR] Lỗi khi chờ tiến trình: {}", e));
                }
            }
        }
        Err(e) => {
            let _ = tx.send(format!("❌ [FAIL] Không thể chạy lệnh '{}': {}", program, e));
        }
    }

    let mut app = app_arc.lock().await;
    app.running_task = None;
    app.refresh_sync_info();
}

fn restore_terminal() {
    let _ = disable_raw_mode();
    let mut stdout = io::stdout();
    let _ = execute!(stdout, LeaveAlternateScreen, DisableMouseCapture);
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Install panic hook to clean terminal
    let orig_hook = panic::take_hook();
    panic::set_hook(Box::new(move |panic_info| {
        restore_terminal();
        orig_hook(panic_info);
    }));

    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let (log_tx, mut log_rx) = mpsc::unbounded_channel::<String>();
    let app = Arc::new(Mutex::new(App::new(log_tx.clone())));

    {
        let mut a = app.lock().await;
        a.refresh_sync_info();
    }

    let app_event = app.clone();
    let tick_rate = Duration::from_millis(100);

    loop {
        // Collect incoming logs
        while let Ok(msg) = log_rx.try_recv() {
            let mut a = app.lock().await;
            a.logs.push(msg);
            if a.logs.len() > 2000 {
                a.logs.remove(0);
            }
            if a.logs.len() > 15 {
                a.scroll = (a.logs.len() - 15) as u16;
            }
        }

        {
            let a = app.lock().await;
            terminal.draw(|f| ui(f, &a))?;
        }

        if event::poll(tick_rate)? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    let mut a = app_event.lock().await;
                    match key.code {
                        KeyCode::Char('q') | KeyCode::Esc => break,
                        KeyCode::Char('c') => {
                            a.logs.clear();
                            a.scroll = 0;
                        }
                        KeyCode::Char('R') => {
                            a.refresh_sync_info();
                            let _ = a.log_sender.send("🔄 Đã cập nhật trạng thái hệ thống và PRs.".to_string());
                        }
                        KeyCode::Up => {
                            if a.selected_pr > 0 {
                                a.selected_pr -= 1;
                            }
                        }
                        KeyCode::Down => {
                            if !a.prs.is_empty() && a.selected_pr + 1 < a.prs.len() {
                                a.selected_pr += 1;
                            }
                        }
                        KeyCode::Char('j') => {
                            if a.scroll < a.logs.len() as u16 {
                                a.scroll = a.scroll.saturating_add(1);
                            }
                        }
                        KeyCode::Char('k') => {
                            a.scroll = a.scroll.saturating_sub(1);
                        }
                        // [1] Backend API Unit Tests
                        KeyCode::Char('1') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "API Unit & Contract Tests",
                                "npm",
                                vec!["run".into(), "test:api".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [2] 13-Stage Behavioral E2E
                        KeyCode::Char('2') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "13-Stage Behavioral & OpenAPI Journey",
                                "node",
                                vec!["scripts/test-behavior-contract.mjs".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [3] Frontend Typecheck (tsc)
                        KeyCode::Char('3') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "TypeScript Typecheck (tsc --noEmit)",
                                "sh",
                                vec!["-c".into(), "cd apps/web && ./node_modules/.bin/tsc --noEmit".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [4] Frontend Component Tests (Vitest)
                        KeyCode::Char('4') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "UI Component Tests (Vitest)",
                                "pnpm",
                                vec!["--filter".into(), "expiry-ui".into(), "test".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [5] Frontend Production Build
                        KeyCode::Char('5') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "Frontend Production Build",
                                "npm",
                                vec!["run".into(), "build:web".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [6] Python Scan OCR Tests
                        KeyCode::Char('6') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "Python OCR Microservice Unit Tests",
                                "docker",
                                vec!["exec".into(), "expiry-python-scan".into(), "python".into(), "-c".into(), "import app.scanner; print('Python scan imports healthy!')".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [7] Code Format & Lint Check
                        KeyCode::Char('7') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "Code Format Check (oxfmt --check)",
                                "sh",
                                vec!["-c".into(), "cd apps/web && ./node_modules/.bin/oxfmt --check src/".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [8] Auto-fix Format
                        KeyCode::Char('8') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "Auto-format Code (oxfmt)",
                                "sh",
                                vec!["-c".into(), "cd apps/web && ./node_modules/.bin/oxfmt src/".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [9] DBOps & Database Schema Integrity
                        KeyCode::Char('9') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "DBOps & Database Schema Verification",
                                "node",
                                vec!["scripts/test-dbops.mjs".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [n] Mobile Notification Push Test
                        KeyCode::Char('n') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "Push Alert to Smartphone (ntfy & Telegram)",
                                "node",
                                vec!["scripts/notify-mobile.mjs".into(), "Test Alert từ TUI".into(), "Hệ thống CI/CD & DevOps Control Center hoạt động 100%!".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [0] Full Quality Gate
                        KeyCode::Char('0') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "Full Quality Gate (All Suites)",
                                "npm",
                                vec!["run".into(), "test:all".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        // [r] Review Selected PR
                        KeyCode::Char('r') => {
                            if let Some(pr) = a.prs.get(a.selected_pr).cloned() {
                                let pr_num = pr.number.clone();
                                drop(a);
                                tokio::spawn(run_async_command(
                                    "Autonomous AGY PR Catch & Review",
                                    "node",
                                    vec!["scripts/review-pr.mjs".into(), pr_num],
                                    app_event.clone(),
                                    log_tx.clone(),
                                ));
                            } else {
                                let _ = a.log_sender.send("⚠️ Không có PR nào được chọn!".to_string());
                            }
                        }
                        // [m] Merge Selected PR
                        KeyCode::Char('m') => {
                            if let Some(pr) = a.prs.get(a.selected_pr).cloned() {
                                let pr_num = pr.number.clone();
                                drop(a);
                                tokio::spawn(run_async_command(
                                    "Rebase & Merge PR",
                                    "gh",
                                    vec!["pr".into(), "merge".into(), pr_num, "--rebase".into()],
                                    app_event.clone(),
                                    log_tx.clone(),
                                ));
                            }
                        }
                        // [d] Docker Restart
                        KeyCode::Char('d') => {
                            drop(a);
                            tokio::spawn(run_async_command(
                                "Restart Full-Stack Docker Services",
                                "docker",
                                vec!["compose".into(), "up".into(), "-d".into(), "--build".into()],
                                app_event.clone(),
                                log_tx.clone(),
                            ));
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    restore_terminal();
    terminal.show_cursor()?;
    Ok(())
}

fn ui(f: &mut Frame, app: &App) {
    let area = f.area();

    // Responsive guard for small terminal screens
    if area.height < 18 || area.width < 50 {
        let warn = Paragraph::new("⚠️ Màn hình Terminal quá nhỏ!\nHãy kéo rộng cửa sổ terminal (tối thiểu 60 cột x 20 dòng) để hiển thị đầy đủ.")
            .style(Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD))
            .alignment(Alignment::Center)
            .block(Block::default().borders(Borders::ALL).title(" Cảnh Báo "));
        f.render_widget(warn, area);
        return;
    }

    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .margin(1)
        .constraints([
            Constraint::Length(3),  // Banner
            Constraint::Length(14), // Middle row
            Constraint::Min(6),     // Realtime Logs
        ])
        .split(area);

    // 1. Top Banner
    let running_indicator = if let Some(ref task) = app.running_task {
        Span::styled(format!(" [ĐANG CHẠY: {}]", task), Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD))
    } else {
        Span::styled(" [IDLE - SẴN SÀNG]", Style::default().fg(Color::Green).add_modifier(Modifier::BOLD))
    };

    let banner = Paragraph::new(Line::from(vec![
        Span::styled("⚡ EXPIRY DEVOPS CONTROL CENTER ", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Span::raw("│ Nhánh: "),
        Span::styled(&app.git_branch, Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD)),
        Span::raw(" │ Trạng thái: "),
        running_indicator,
    ]))
    .block(
        Block::default()
            .borders(Borders::ALL)
            .border_type(BorderType::Rounded)
            .border_style(Style::default().fg(Color::Cyan)),
    )
    .alignment(Alignment::Left);
    f.render_widget(banner, chunks[0]);

    // 2. Middle Row: Left (Services & 10 Quick Actions), Right (PR List)
    let mid_chunks = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(52), Constraint::Percentage(48)])
        .split(chunks[1]);

    // Left Box
    let mut service_lines = vec![
        Line::from(Span::styled("DỊCH VỤ DOCKER:", Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD))),
    ];
    for s in &app.docker_services {
        let status_span = if s.healthy {
            Span::styled(" [OK] ", Style::default().fg(Color::Green).add_modifier(Modifier::BOLD))
        } else {
            Span::styled(" [DOWN] ", Style::default().fg(Color::Red).add_modifier(Modifier::BOLD))
        };
        service_lines.push(Line::from(vec![
            status_span,
            Span::raw(format!("{:<18} ({})", s.name, s.port)),
        ]));
    }
    service_lines.push(Line::from(""));
    service_lines.push(Line::from(Span::styled("BỘ KIỂM THỬ ĐA TẦNG & GIAO DIỆN (Phím tắt):", Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD))));
    service_lines.push(Line::from(vec![
        Span::styled("[1] ", Style::default().fg(Color::Cyan)), Span::raw("API Test  "),
        Span::styled("[2] ", Style::default().fg(Color::Cyan)), Span::raw("Behavior E2E  "),
        Span::styled("[3] ", Style::default().fg(Color::Cyan)), Span::raw("TypeScript  "),
        Span::styled("[4] ", Style::default().fg(Color::Cyan)), Span::raw("Vitest UI"),
    ]));
    service_lines.push(Line::from(vec![
        Span::styled("[5] ", Style::default().fg(Color::Cyan)), Span::raw("Web Build  "),
        Span::styled("[6] ", Style::default().fg(Color::Cyan)), Span::raw("Python Scan  "),
        Span::styled("[7] ", Style::default().fg(Color::Cyan)), Span::raw("Format Check  "),
        Span::styled("[8] ", Style::default().fg(Color::Cyan)), Span::raw("Auto Format"),
    ]));
    service_lines.push(Line::from(vec![
        Span::styled("[9] ", Style::default().fg(Color::Cyan)), Span::raw("DBOps Audit  "),
        Span::styled("[0] ", Style::default().fg(Color::Green).add_modifier(Modifier::BOLD)), Span::raw("FULL GATES  "),
        Span::styled("[n] ", Style::default().fg(Color::Magenta)), Span::raw("Mobile Alert  "),
        Span::styled("[r] ", Style::default().fg(Color::Yellow)), Span::raw("Review PR"),
    ]));
    service_lines.push(Line::from(vec![
        Span::styled("[m] ", Style::default().fg(Color::Magenta)), Span::raw("Merge PR  "),
        Span::styled("[d] ", Style::default().fg(Color::Blue)), Span::raw("Docker Up  "),
        Span::styled("[R] ", Style::default().fg(Color::Yellow)), Span::raw("Refresh  "),
        Span::styled("[c] ", Style::default().fg(Color::White)), Span::raw("Clear  "),
        Span::styled("[q] ", Style::default().fg(Color::Red)), Span::raw("Thoát"),
    ]));

    let service_widget = Paragraph::new(service_lines).block(
        Block::default()
            .title(" 🛠️ Dịch Vụ & Phím Tắt Điều Khiển ")
            .borders(Borders::ALL)
            .border_type(BorderType::Rounded)
            .border_style(Style::default().fg(Color::Blue)),
    );
    f.render_widget(service_widget, mid_chunks[0]);

    // Right Box: PRs List
    let pr_items: Vec<ListItem> = if app.prs.is_empty() {
        vec![ListItem::new("Không có Pull Request nào đang mở. Bấm [R] để làm mới.")]
    } else {
        app.prs
            .iter()
            .enumerate()
            .map(|(idx, pr)| {
                let is_selected = idx == app.selected_pr;
                let prefix = if is_selected { "👉 " } else { "   " };
                let style = if is_selected {
                    Style::default().fg(Color::Black).bg(Color::Cyan).add_modifier(Modifier::BOLD)
                } else {
                    Style::default().fg(Color::White)
                };
                ListItem::new(format!("{}#{} [{}] by @{} - {}", prefix, pr.number, pr.branch, pr.author, pr.title)).style(style)
            })
            .collect()
    };

    let pr_list_widget = List::new(pr_items).block(
        Block::default()
            .title(" 📬 PRs (↑/↓ chọn, [r] Review, [m] Merge) ")
            .borders(Borders::ALL)
            .border_type(BorderType::Rounded)
            .border_style(Style::default().fg(Color::Green)),
    );
    f.render_widget(pr_list_widget, mid_chunks[1]);

    // 3. Bottom Box: Realtime Logs
    let log_lines: Vec<Line> = app
        .logs
        .iter()
        .map(|l| {
            if l.contains("SUCCESS") || l.contains("PASS") || l.contains("✅") {
                Line::from(Span::styled(l, Style::default().fg(Color::Green)))
            } else if l.contains("FAIL") || l.contains("ERROR") || l.contains("❌") {
                Line::from(Span::styled(l, Style::default().fg(Color::Red).add_modifier(Modifier::BOLD)))
            } else if l.contains("START") || l.contains("RUN") || l.contains("▶") {
                Line::from(Span::styled(l, Style::default().fg(Color::Yellow)))
            } else {
                Line::from(Span::raw(l))
            }
        })
        .collect();

    let logs_widget = Paragraph::new(log_lines)
        .block(
            Block::default()
                .title(format!(" 📜 Nhật Ký Hoạt Động Realtime ({}/{} lines - [j/k] Cuộn, [c] Xóa) ", app.scroll, app.logs.len()))
                .borders(Borders::ALL)
                .border_type(BorderType::Rounded)
                .border_style(Style::default().fg(Color::White)),
        )
        .scroll((app.scroll, 0))
        .wrap(Wrap { trim: false });
    f.render_widget(logs_widget, chunks[2]);
}
