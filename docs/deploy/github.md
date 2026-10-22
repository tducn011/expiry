# Quy tắc Repository & Hướng dẫn Deploy GitHub (Expiry System)

Tài liệu này tổng hợp toàn bộ **quy tắc làm việc (Rules)**, **quy chuẩn kỹ thuật (Standards)** và **quy trình đẩy code / deploy (GitHub & CI/CD Workflow)** của repository Expiry. Mọi thành viên và trợ lý phát triển bắt buộc phải tuân thủ nghiêm ngặt.

---

## 1. Nguyên tắc Cốt lõi & Ranh giới Kiến trúc (Architectural Boundaries)

Dự án áp dụng mô hình **Monorepo Hybrid Architecture** (Node.js Modular Monolith + Python Microservice + MySQL 8.4 + React 19 Frontend).

```text
expiry/
├── apps/
│   ├── web/               # React 19 + Vite 8 + Tailwind CSS v4 (UI tĩnh, Vercel/Static)
│   └── api/               # Node.js Express Modular Monolith (/api/v1, Port 3001)
├── services/
│   └── python-scan/       # FastAPI OCR & Date Parsing Microservice (Port 8000)
├── database/
│   └── mysql/             # MySQL 8.4 InnoDB migrations, seeds, tools
├── contracts/             # OpenAPI Specifications (public-api.yaml, scan-api.yaml)
├── deploy/                # Tài liệu & quy chuẩn deployment
├── docs/                  # Tài liệu kiến trúc, nghiệp vụ & quyết định kỹ thuật
└── compose.yaml           # Docker Compose full-stack orchestration
```

### Quy tắc phân định ranh giới (Boundary Rules):
1. **Frontend (`apps/web`)**:
   - Chỉ được giao tiếp với Backend thông qua các endpoint REST API `/api/v1`.
   - Tuyệt đối không gọi trực tiếp sang `services/python-scan` hoặc truy cập trực tiếp MySQL.
2. **Backend API (`apps/api`)**:
   - Là cơ quan duy nhất nắm quyền thực thi nghiệp vụ (business rules), quản lý số lượng tồn kho (inventory state), kiểm soát khóa lạc quan (`version`), và tính toán hạn dùng (`attention policies`).
   - Là dịch vụ duy nhất được phép gửi request sang `python-scan` qua HTTP nội bộ.
3. **Python Scan Service (`services/python-scan`)**:
   - Là microservice phi trạng thái (stateless) chuyên tiền xử lý ảnh và bóc tách hạn sử dụng qua regex/OCR deterministic.
   - **Tuyệt đối KHÔNG kết nối trực tiếp vào MySQL database.**
   - Tuân thủ nguyên tắc YAGNI & Ponytail: Không cài đặt thêm các thư viện AI/ML cồng kềnh (PyTorch, TensorFlow, LLMs) gây phình to hệ thống.
4. **Database (`database/mysql`)**:
   - Nguồn chân lý duy nhất (Single Source of Truth) cho trạng thái dữ liệu.
   - Mọi thay đổi cấu trúc bảng phải thực hiện qua migration có phiên bản trong `database/mysql/migrations/`.

---

## 2. Quy tắc Quản lý Nhánh (Git Branching Strategy)

> [!CAUTION]
> **TUYỆT ĐỐI CẤM PUSH TRỰC TIẾP LÊN NHÁNH `main` (`git push origin main`)!**
> Mọi thay đổi vào `main` bắt buộc phải đi qua nhánh tính năng (`feature/*`) -> Rebase cập nhật với `main` -> Tạo Pull Request -> Review & Quality Gates -> Rebase & Merge.

| Nhánh | Mục đích | Quy định bảo vệ |
| :--- | :--- | :--- |
| `main` | Production branch, đại diện cho bản phát hành chính thức | **Protected (Khóa cứng):** Cấm push trực tiếp. Bắt buộc phải qua PR và kiểm thử `npm run test:all` đạt 100%. |
| `develop` | Staging / Integration branch tích hợp các tính năng | **Protected:** Nhận merge từ các nhánh tính năng sau khi rebase sạch. |
| `feature/<name>` | Phát triển tính năng mới (vd: `feature/ui`, `feature/inventory-flow`) | Nhánh cá nhân/tính năng, phải thường xuyên rebase với `main`/`develop`. |
| `fix/<name>` / `hotfix/<name>` | Sửa lỗi hệ thống hoặc patch khẩn cấp | Tạo từ nhánh lỗi, rebase sạch trước khi mở PR. |
| `docs/<name>` | Cập nhật tài liệu kỹ thuật, kiến trúc | Tạo từ `main`/`develop`. |

---

## 3. Quy chuẩn Commit Message (Conventional Commits)

Mọi commit bắt buộc tuân theo định dạng:

```text
<type>(<scope>): <mô tả ngắn gọn về thay đổi>
```

### Các `type` được chấp nhận:
- `feat`: Tính năng mới cho người dùng hoặc hệ thống.
- `fix`: Sửa lỗi (bug fix).
- `docs`: Cập nhật tài liệu, hướng dẫn, specs.
- `ui`: Thay đổi giao diện, styles, layout người dùng.
- `refactor`: Tái cấu trúc code (không đổi behavior, không thêm tính năng mới).
- `test`: Thêm hoặc chỉnh sửa unit test, contract test.
- `chore`: Cập nhật cấu hình phụ thuộc, build script, docker, tooling.

### Các `scope` chuẩn trong repo:
- `web`: Frontend React/Vite.
- `api`: Backend Express monolith.
- `python-scan`: Python OCR service.
- `database`: MySQL schemas, migrations, seeds.
- `contracts`: OpenAPI specs.
- `architecture`: Quyết định kiến trúc, docs.
- `config`: Thiết lập môi trường, site config.

### Ví dụ hợp lệ trong repo:
```bash
git commit -m "feat(ui): update inventory cards and attention badge filtering"
git commit -m "fix(api): handle optimistic lock conflict on stock deduction"
git commit -m "docs(deploy): add github workflow and repository rules"
git commit -m "refactor(config): move site configuration to site.config.ts"
```

---

## 4. Cổng Kiểm Tra Chất Lượng Trước Khi Push (Pre-push Quality Gates)

Trước khi rebase và push code lên GitHub, lập trình viên **bắt buộc** phải chạy bộ kiểm tra toàn cục tại thư mục gốc monorepo:

```bash
# Chạy toàn bộ kiểm thử đơn vị & kiểm tra build
npm run test:all
```

Lệnh trên sẽ tự động thực thi chuỗi kiểm tra sau:
1. `npm run test:api`: Kiểm tra unit tests cho các module nghiệp vụ của Node.js Backend.
2. `npm run test:python`: Kiểm tra parser và regex date scanner của Python Scan Service (`services/python-scan/tests`).
3. `npm run build:web`: Chạy typecheck (`tsc`) và build gói tĩnh Frontend React (`apps/web`).

### Các quy tắc kiểm tra bổ sung:
- **Contract Parity**: Nếu thay đổi API endpoint, bắt buộc cập nhật tương ứng vào `contracts/public-api.yaml` hoặc `contracts/scan-api.yaml`.
- **Database Migrations**: Không drop column đột ngột trong cùng một bản release. Mọi migration phải bảo toàn tính tương thích ngược (Backward-Compatible).
- **Environment Safety**: Tuyệt đối không commit file `.env` chứa mật khẩu thực tế hoặc secret keys lên GitHub.

---

## 5. Quy trình Git Rebase & Tạo Pull Request (Chuẩn Linear History)

> [!IMPORTANT]
> Dự án áp dụng chiến lược **Linear History (Lịch sử commit tuyến tính)**.
> **KHÔNG SỬ DỤNG MERGE COMMIT RÁC** (tránh `Merge branch 'main' of ...`). Luôn luôn dùng `git rebase` để giữ cây commit sạch và dễ dàng điều tra lỗi (`git bisect`).

```text
[origin/main] ─────── A ─── B ─── C ─── D (mới nhất trên remote)
                                    \
[feature/your-branch]                E' ─── F' (rebase đặt commit của bạn lên đầu D)
```

---

### Quy trình từng bước thực hiện:

#### Bước 1: Tạo nhánh tính năng từ `main` mới nhất
Trước khi bắt tay vào code, luôn đảm bảo `main` local của bạn là mới nhất:
```bash
# Chuyển về main và cập nhật
git checkout main
git pull --rebase origin main

# Tạo nhánh tính năng mới
git checkout -b feature/ten-tinh-nang
```

#### Bước 2: Thực hiện code, kiểm tra và Commit cục bộ
Sau khi hoàn thành công việc và chạy pass `npm run test:all`:
```bash
git add <cac_file_thay_doi>
git commit -m "feat(scope): mo ta ngan gon ve thay doi"
```

#### Bước 3: Đồng bộ và REBASE với `main` mới nhất từ Remote
Trong quá trình bạn code, nhánh `main` trên remote có thể đã có commit mới từ các thành viên khác. Bạn **bắt buộc phải Rebase** trước khi mở PR:

```bash
# 1. Tải toàn bộ metadata mới nhất từ GitHub
git fetch origin

# 2. Rebase nhánh tính năng của bạn lên trên đỉnh của origin/main (hoặc origin/develop)
git rebase origin/main
```

##### Xử lý khi xảy ra Conflict trong lúc Rebase:
Nếu Git thông báo có xung đột (`CONFLICT`), hãy bình tĩnh xử lý:
1. Kiểm tra danh sách file bị xung đột:
   ```bash
   git status
   ```
2. Mở các file bị conflict, giải quyết các đoạn xung đột `<<<<<<<` và `>>>>>>>`.
3. Đánh dấu file đã giải quyết xong:
   ```bash
   git add <file_da_sua>
   ```
4. Tiếp tục quá trình rebase:
   ```bash
   git rebase --continue
   ```
   *(Lặp lại các bước trên nếu còn commit khác bị conflict)*.
5. Nếu gặp sự cố muốn hủy bỏ toàn bộ rebase để trở về trạng thái trước đó:
   ```bash
   git rebase --abort
   ```

#### Bước 4: Đẩy branch lên GitHub Remote an toàn
Nếu đây là lần đầu tiên bạn đẩy branch:
```bash
git push -u origin feature/ten-tinh-nang
```

Nếu bạn **đã từng push trước đó** và vừa thực hiện `git rebase`, lịch sử commit local đã thay đổi:
```bash
# TUYỆT ĐỐI KHÔNG dùng git push -f (nguy hiểm)
# HÃY DÙNG --force-with-lease để tránh ghi đè commit của người khác nếu remote có cập nhật mới
git push --force-with-lease origin feature/ten-tinh-nang
```

#### Bước 5: Mở Pull Request (PR) trên GitHub
1. Truy cập vào GitHub repository.
2. Nhấp vào nút **Compare & pull request** trên banner hiển thị.
3. Chọn `base: main` (hoặc `base: develop`) và `compare: feature/ten-tinh-nang`.
4. Điền tiêu đề và nội dung theo mẫu chuẩn:

```markdown
## Tóm tắt thay đổi
- Mô tả ngắn gọn thay đổi chính.

## Lý do / Ngữ cảnh
- Nêu mục đích và giải pháp thực hiện.

## Kết quả kiểm thử (Verification)
- [x] Đã chạy `npm run test:all` (PASS 100%)
- [x] Đã rebase thành công với `origin/main` mới nhất, không conflict
- [x] Tuân thủ kiến trúc phân vùng Monorepo

## Checklist
- [ ] Commit message tuân theo Conventional Commits
- [ ] Không có file rác, file nhạy cảm (.env)
```

*(Mẹo: Dùng GitHub CLI để tạo PR nhanh từ terminal: `gh pr create --base main --fill`)*

#### Bước 6: Chiến lược Merge PR trên GitHub
Khi PR đã được review và pass toàn bộ CI checks:
- Trên giao diện GitHub: Chọn **Rebase and merge** (hoặc **Squash and merge** nếu muốn gộp các commit nhỏ thành 1 commit duy nhất).
- Hoặc dùng GitHub CLI:
  ```bash
  gh pr merge <PR_NUMBER_HOAC_LINK> --rebase --delete-branch
  ```
- **Không chọn "Create a merge commit"** để tránh tạo các merge commit làm rối nhánh `main`.

#### Bước 7: Dọn dẹp Local sau khi PR đã Merge
Sau khi PR đã được merge vào `main` trên GitHub:
```bash
# 1. Chuyển về nhánh main
git checkout main

# 2. Kéo code mới nhất đã merge về máy
git pull --rebase origin main

# 3. Xóa nhánh tính năng cục bộ đã xong việc
git branch -d feature/ten-tinh-nang

# 4. Dọn dẹp các tracking branch trên remote đã bị xóa
git remote prune origin
```

---

## 6. Quy tắc Triển khai (Deployment Guidelines)

### 6.1. Triển khai Local & Staging bằng Docker Compose
Hệ thống sử dụng Docker Compose để đảm bảo môi trường đồng nhất:

```bash
# Khởi chạy toàn bộ hệ thống (MySQL + Backend + Python Scan)
docker compose up -d --build

# Kiểm tra trạng thái các container
docker compose ps

# Kiểm tra sức khỏe các dịch vụ
curl http://localhost:3001/health   # Backend Node.js API
curl http://localhost:8000/health   # Python Scan Service
```

### 6.2. Triển khai Frontend (`apps/web`)
- Frontend được cấu hình triển khai tĩnh thông qua file `apps/web/vercel.json`.
- Khi PR được merge vào nhánh chính, quy trình CI/CD sẽ tự động kích hoạt `npm run build` để xuất gói ra thư mục `dist`.

### 6.3. Bảo mật mạng Docker (Network Isolation)
- Dịch vụ `python-scan` chỉ phục vụ các truy vấn nội bộ từ `api`.
- Trong môi trường triển khai thực tế, không mở port của `python-scan` ra ngoài Internet công cộng.

### 6.4. Chiến lược Rollback & Khôi phục sự cố
- **Stateless Services (`api`, `python-scan`)**: Khi gặp sự cố sau khi deploy, có thể rollback tức thì về Docker image tag trước đó mà không ảnh hưởng tới dữ liệu.
- **Database (`mysql`)**: Luôn sao lưu dữ liệu trước khi chạy migration mới. Không rollback bằng cách drop dữ liệu nếu không có kế hoạch migrate ngược an toàn.

---

## 7. Quy chuẩn Kiểm tra Trước Thay đổi (Inspection Protocol [S0])

Dành cho nhà phát triển và các AI coding assistant:
1. **Xác định Task Mode trước khi thao tác**:
   - `REVIEW_ONLY`: Chỉ phân tích và báo cáo, không sửa code, không thay đổi trạng thái repo.
   - `IMPLEMENT`: Kiểm tra kỹ ngữ cảnh trước, sau đó chỉnh sửa chính xác phạm vi được yêu cầu.
   - `DEBUG`: Tái hiện hoặc lần theo dấu vết chính xác trước khi vá lỗi.
2. **Kiểm tra ngữ cảnh (Context Inspection)**:
   - Luôn kiểm tra `git status`, branch hiện tại, các uncommitted changes để tránh ghi đè code ngoài ý muốn.
3. **Kỷ luật thực thi (Discipline)**:
   - Sửa một trách nhiệm tập trung tại một thời điểm.
   - Giữ diff nhỏ, sạch, bảo toàn comment và logic không liên quan.
   - Không tự ý thêm thư viện ngoài phạm vi phê duyệt.
