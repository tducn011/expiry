import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:3055");
const CHANNEL = "apx2nvdw";
let seq = 0;

function sendCmd(command, params) {
  return new Promise((resolve, reject) => {
    const id = "cmd-" + (++seq);
    const handler = (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.message?.id === id) {
          ws.off("message", handler);
          if (parsed.message.error) reject(new Error(parsed.message.error));
          else resolve(parsed.message.result);
        }
      } catch (e) {}
    };
    ws.on("message", handler);
    ws.send(JSON.stringify({
      id,
      type: "message",
      channel: CHANNEL,
      message: { id, command, params: { ...params, commandId: id } }
    }));
  });
}

// Helpers
async function createFrame(opts) {
  const f = await sendCmd("create_frame", {
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    name: opts.name || "Frame",
    parentId: opts.parentId,
    fillColor: opts.fillColor || { r: 1, g: 1, b: 1, a: 1 },
    strokeColor: opts.strokeColor,
    strokeWeight: opts.strokeWeight || (opts.strokeColor ? 1 : 0),
  });
  if (opts.radius) {
    await sendCmd("set_corner_radius", { nodeId: f.id, radius: opts.radius });
  }
  return f;
}

async function createText(opts) {
  const t = await sendCmd("create_text", {
    x: opts.x,
    y: opts.y,
    text: opts.text || "Text",
    fontSize: opts.fontSize || 14,
    fontWeight: opts.fontWeight || 400,
    fontColor: opts.fontColor || { r: 0.06, g: 0.09, b: 0.16, a: 1 },
    name: opts.name || opts.text?.slice(0, 20) || "Text",
    parentId: opts.parentId,
  });
  if (opts.text) {
    await sendCmd("set_text_content", { nodeId: t.id, text: opts.text });
  }
  return t;
}

async function createRect(opts) {
  const r = await sendCmd("create_rectangle", {
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    name: opts.name || "Rectangle",
    parentId: opts.parentId,
  });
  if (opts.fillColor) {
    await sendCmd("set_fill_color", { nodeId: r.id, color: opts.fillColor });
  }
  if (opts.strokeColor) {
    await sendCmd("set_stroke_color", { nodeId: r.id, color: opts.strokeColor, weight: opts.strokeWeight || 1 });
  }
  if (opts.radius) {
    await sendCmd("set_corner_radius", { nodeId: r.id, radius: opts.radius });
  }
  return r;
}

// Color palette
const C = {
  bg: { r: 0.97, g: 0.98, b: 0.99, a: 1 }, // #F8FAFC
  white: { r: 1, g: 1, b: 1, a: 1 },
  text: { r: 0.06, g: 0.09, b: 0.16, a: 1 }, // #0F172A
  subtext: { r: 0.39, g: 0.45, b: 0.55, a: 1 }, // #64748B
  muted: { r: 0.58, g: 0.64, b: 0.72, a: 1 }, // #94A3B8
  border: { r: 0.88, g: 0.91, b: 0.94, a: 1 }, // #E2E8F0
  primary: { r: 0.02, g: 0.59, b: 0.41, a: 1 }, // #059669 (Emerald)
  primaryDark: { r: 0.02, g: 0.47, b: 0.34, a: 1 }, // #047857
  primaryLight: { r: 0.92, g: 0.99, b: 0.96, a: 1 }, // #ECFDF5
  primaryBorder: { r: 0.65, g: 0.95, b: 0.82, a: 1 }, // #A7F3D0
  amberBg: { r: 0.99, g: 0.95, b: 0.78, a: 1 }, // #FEF3C7
  amberBorder: { r: 0.99, g: 0.83, b: 0.30, a: 1 }, // #FCD34D
  amberText: { r: 0.85, g: 0.47, b: 0.02, a: 1 }, // #D97706
  redBg: { r: 0.99, g: 0.88, b: 0.88, a: 1 }, // #FEE2E2
  redBorder: { r: 0.99, g: 0.70, b: 0.70, a: 1 }, // #FCA5A5
  redText: { r: 0.86, g: 0.15, b: 0.15, a: 1 }, // #DC2626
  blueBg: { r: 0.86, g: 0.93, b: 1, a: 1 }, // #DBEAFE
  blueText: { r: 0.15, g: 0.39, b: 0.92, a: 1 }, // #2563EB
};

function addStatusBar(parentId) {
  return Promise.all([
    createText({ x: 28, y: 14, text: "9:41", fontSize: 13, fontWeight: 700, fontColor: C.text, parentId }),
    createText({ x: 310, y: 14, text: "5G  89%", fontSize: 12, fontWeight: 600, fontColor: C.text, parentId })
  ]);
}

function addBottomNavWithCenterHeroAdd(parentId, activeTab = "kho") {
  const navY = 765;
  const p = [];
  // Bottom dock bar background
  p.push(createRect({ x: 0, y: navY, width: 390, height: 79, fillColor: C.white, strokeColor: C.border, parentId }));
  
  // Tab 1: Kho
  const isKho = activeTab === "kho";
  p.push(createText({ x: 32, y: navY + 12, text: "📦", fontSize: 20, parentId }));
  p.push(createText({ x: 24, y: navY + 36, text: "Kho hàng", fontSize: 11, fontWeight: isKho ? 700 : 500, fontColor: isKho ? C.primary : C.subtext, parentId }));

  // Tab 2: Chú ý
  const isAtt = activeTab === "attention";
  p.push(createText({ x: 104, y: navY + 12, text: "⚠️", fontSize: 20, parentId }));
  p.push(createText({ x: 96, y: navY + 36, text: "Cần chú ý", fontSize: 11, fontWeight: isAtt ? 700 : 500, fontColor: isAtt ? C.primary : C.subtext, parentId }));

  // Tab 3: Raised Center Hero Add Button
  p.push(createFrame({ x: 168, y: navY - 18, width: 54, height: 54, fillColor: C.primary, strokeColor: C.white, strokeWeight: 3, radius: 27, parentId }));
  p.push(createText({ x: 184, y: navY - 14, text: "+", fontSize: 32, fontWeight: 800, fontColor: C.white, parentId }));
  p.push(createText({ x: 180, y: navY + 42, text: "Thêm", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId }));

  // Tab 4: Lịch sử
  const isHistory = activeTab === "history";
  p.push(createText({ x: 258, y: navY + 12, text: "⏱️", fontSize: 20, parentId }));
  p.push(createText({ x: 250, y: navY + 36, text: "Lịch sử", fontSize: 11, fontWeight: isHistory ? 700 : 500, fontColor: isHistory ? C.primary : C.subtext, parentId }));

  // Tab 5: Cài đặt
  const isSettings = activeTab === "settings";
  p.push(createText({ x: 330, y: navY + 12, text: "⚙️", fontSize: 20, parentId }));
  p.push(createText({ x: 322, y: navY + 36, text: "Cài đặt", fontSize: 11, fontWeight: isSettings ? 700 : 500, fontColor: isSettings ? C.primary : C.subtext, parentId }));

  return Promise.all(p);
}

// -------------------------------------------------------------
// SCREEN 1: WF-01 INVENTORY (CÓ DẤU + TO NHẤT Ở ĐẦU)
// -------------------------------------------------------------
async function buildScreen1(originX = 0) {
  console.log("Building Screen 1: Inventory with GIANT + Button at top...");
  const screen = await createFrame({
    x: originX, y: 0, width: 390, height: 844,
    name: "WF-01: Kho thực phẩm (Inventory)",
    fillColor: C.bg, radius: 40
  });
  const sid = screen.id;
  await addStatusBar(sid);

  // Top header with Title and Top Add Icon
  await createText({ x: 20, y: 44, text: "EXPIRY MANAGEMENT", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: sid });
  await createText({ x: 20, y: 60, text: "Kho thực phẩm", fontSize: 24, fontWeight: 700, fontColor: C.text, parentId: sid });
  
  // Top right Header Mini Add + Avatar
  await createFrame({ x: 276, y: 52, width: 38, height: 38, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 19, parentId: sid });
  await createText({ x: 288, y: 56, text: "+", fontSize: 22, fontWeight: 800, fontColor: C.primary, parentId: sid });
  await createFrame({ x: 326, y: 52, width: 38, height: 38, fillColor: C.white, strokeColor: C.border, radius: 19, parentId: sid });
  await createText({ x: 334, y: 62, text: "HA", fontSize: 13, fontWeight: 700, fontColor: C.text, parentId: sid });

  // =========================================================================
  // ⭐ DẤU + LÀ TO NHẤT NẰM Ở ĐẦU (HERO ADD BUTTON / CARD) ⭐
  // =========================================================================
  const heroAddCard = await createFrame({
    x: 20, y: 100, width: 350, height: 84,
    name: "Hero Add Card (Dấu + To Nhất)",
    fillColor: C.primary, radius: 20, parentId: sid
  });
  // Big circle with Giant +
  await createFrame({ x: 34, y: 114, width: 56, height: 56, fillColor: C.white, radius: 28, parentId: sid });
  await createText({ x: 48, y: 112, text: "+", fontSize: 44, fontWeight: 900, fontColor: C.primary, parentId: sid });

  // Main text inside Hero Card
  await createText({ x: 104, y: 118, text: "THÊM MÓN MỚI", fontSize: 17, fontWeight: 800, fontColor: C.white, parentId: sid });
  await createText({ x: 104, y: 142, text: "Chạm để nhập nhanh hoặc quét bao bì", fontSize: 12, fontWeight: 500, fontColor: C.primaryLight, parentId: sid });
  // Right arrow
  await createText({ x: 338, y: 128, text: "›", fontSize: 26, fontWeight: 600, fontColor: C.white, parentId: sid });

  // Urgency Alert Banner right below Hero Add
  await createFrame({ x: 20, y: 196, width: 350, height: 58, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 14, parentId: sid });
  await createText({ x: 34, y: 206, text: "⚠️  2 món cần chú ý gấp", fontSize: 13, fontWeight: 700, fontColor: C.amberText, parentId: sid });
  await createText({ x: 34, y: 226, text: "1 món quá hạn • 1 món cận hạn trong 2 ngày", fontSize: 12, fontColor: C.text, parentId: sid });

  // Search input
  await createFrame({ x: 20, y: 264, width: 350, height: 40, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: sid });
  await createText({ x: 34, y: 275, text: "🔍  Tìm kiếm món ăn, vị trí lưu trữ...", fontSize: 13, fontColor: C.muted, parentId: sid });

  // Filter Chips
  await createFrame({ x: 20, y: 312, width: 84, height: 30, fillColor: C.text, radius: 15, parentId: sid });
  await createText({ x: 32, y: 319, text: "Tất cả (5)", fontSize: 12, fontWeight: 600, fontColor: C.white, parentId: sid });
  await createFrame({ x: 110, y: 312, width: 94, height: 30, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 15, parentId: sid });
  await createText({ x: 120, y: 319, text: "Cần chú ý (2)", fontSize: 12, fontWeight: 600, fontColor: C.amberText, parentId: sid });
  await createFrame({ x: 210, y: 312, width: 90, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: sid });
  await createText({ x: 220, y: 319, text: "Ngăn mát (3)", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createFrame({ x: 306, y: 312, width: 64, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: sid });
  await createText({ x: 314, y: 319, text: "Đông (1)", fontSize: 12, fontColor: C.subtext, parentId: sid });

  // Food Card 1: Quá hạn
  await createFrame({ x: 20, y: 352, width: 350, height: 94, fillColor: C.white, strokeColor: C.redBorder, radius: 16, parentId: sid });
  await createText({ x: 36, y: 364, text: "Phô mai lát Cheddar", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 36, y: 386, text: "Còn 4 lát • Ngăn mát tủ lạnh", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 36, y: 408, text: "HSD: 06/10/2026 (Quá hạn 7 ngày)", fontSize: 12, fontWeight: 600, fontColor: C.redText, parentId: sid });
  await createFrame({ x: 278, y: 366, width: 76, height: 28, fillColor: C.redBg, strokeColor: C.redBorder, radius: 8, parentId: sid });
  await createText({ x: 288, y: 372, text: "Bỏ hỏng", fontSize: 11, fontWeight: 700, fontColor: C.redText, parentId: sid });

  // Food Card 2: Cận hạn
  await createFrame({ x: 20, y: 456, width: 350, height: 94, fillColor: C.white, strokeColor: C.amberBorder, radius: 16, parentId: sid });
  await createText({ x: 36, y: 468, text: "Trứng gà Ba Huân", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 36, y: 490, text: "Còn 6 quả • Ngăn mát", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 36, y: 512, text: "HSD: 12/10/2026 (Hôm nay hết hạn!)", fontSize: 12, fontWeight: 600, fontColor: C.amberText, parentId: sid });
  await createFrame({ x: 278, y: 470, width: 76, height: 28, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 8, parentId: sid });
  await createText({ x: 288, y: 476, text: "Dùng món", fontSize: 11, fontWeight: 700, fontColor: C.amberText, parentId: sid });

  // Food Card 3: Còn hạn
  await createFrame({ x: 20, y: 560, width: 350, height: 94, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: sid });
  await createText({ x: 36, y: 572, text: "Sữa tươi Dalat Milk 450ml", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 36, y: 594, text: "Còn 350 ml • Cánh tủ mát • Đã mở", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 36, y: 616, text: "HSD: 15/10/2026 (Còn 3 ngày)", fontSize: 12, fontWeight: 600, fontColor: C.primary, parentId: sid });
  await createFrame({ x: 278, y: 574, width: 76, height: 28, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 8, parentId: sid });
  await createText({ x: 288, y: 580, text: "Chi tiết", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: sid });

  // Food Card 4: Ước tính
  await createFrame({ x: 20, y: 664, width: 350, height: 86, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: sid });
  await createText({ x: 36, y: 676, text: "Chuối sứ chín", fontSize: 15, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createText({ x: 36, y: 698, text: "5 quả • Kệ bếp • HSD ước tính: 18/10", fontSize: 12, fontColor: C.subtext, parentId: sid });

  // Bottom dock with raised center hero add button
  await addBottomNavWithCenterHeroAdd(sid, "kho");
  console.log("Screen 1 completed.");
  return screen;
}

// -------------------------------------------------------------
// SCREEN 2: WF-02 ENTRY FORM
// -------------------------------------------------------------
async function buildScreen2(originX = 430) {
  console.log("Building Screen 2: Add Entry Form...");
  const screen = await createFrame({
    x: originX, y: 0, width: 390, height: 844,
    name: "WF-02: Thêm món mới (Entry Form)",
    fillColor: C.bg, radius: 40
  });
  const sid = screen.id;
  await addStatusBar(sid);

  // Header Bar
  await createText({ x: 20, y: 52, text: "Hủy", fontSize: 15, fontColor: C.subtext, parentId: sid });
  await createText({ x: 135, y: 50, text: "Thêm thực phẩm", fontSize: 17, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 335, y: 52, text: "Lưu", fontSize: 15, fontWeight: 700, fontColor: C.primary, parentId: sid });

  // OCR Scan banner
  await createFrame({ x: 20, y: 92, width: 350, height: 46, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 12, parentId: sid });
  await createText({ x: 36, y: 106, text: "📸  Quét thông tin nhanh từ bao bì / hóa đơn", fontSize: 13, fontWeight: 600, fontColor: C.primary, parentId: sid });

  // Field 1: Name
  await createText({ x: 20, y: 154, text: "Tên thực phẩm *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 20, y: 174, width: 350, height: 44, fillColor: C.white, strokeColor: C.primaryBorder, radius: 10, parentId: sid });
  await createText({ x: 34, y: 187, text: "Sữa chua Hy Lạp Lucas", fontSize: 14, fontWeight: 500, fontColor: C.text, parentId: sid });

  // Field 2: Quantity & Unit
  await createText({ x: 20, y: 232, text: "Số lượng ban đầu *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 20, y: 252, width: 165, height: 44, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: sid });
  await createText({ x: 34, y: 265, text: "4", fontSize: 15, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 205, y: 252, width: 165, height: 44, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: sid });
  await createText({ x: 220, y: 265, text: "Hộp  ▾", fontSize: 14, fontColor: C.text, parentId: sid });

  // Field 3: Location
  await createText({ x: 20, y: 310, text: "Vị trí lưu trữ *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 20, y: 330, width: 88, height: 32, fillColor: C.primary, radius: 16, parentId: sid });
  await createText({ x: 30, y: 338, text: "Ngăn mát", fontSize: 12, fontWeight: 600, fontColor: C.white, parentId: sid });
  await createFrame({ x: 116, y: 330, width: 92, height: 32, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: sid });
  await createText({ x: 126, y: 338, text: "Ngăn đông", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createFrame({ x: 216, y: 330, width: 80, height: 32, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: sid });
  await createText({ x: 226, y: 338, text: "Kệ bếp", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createFrame({ x: 304, y: 330, width: 66, height: 32, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: sid });
  await createText({ x: 314, y: 338, text: "Tủ khô", fontSize: 12, fontColor: C.subtext, parentId: sid });

  // Field 4: Expiry Date Card
  await createText({ x: 20, y: 380, text: "Hạn sử dụng theo dõi *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 20, y: 400, width: 350, height: 110, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: sid });
  await createText({ x: 34, y: 414, text: "📅  18 / 10 / 2026", fontSize: 15, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createText({ x: 34, y: 446, text: "Độ tin cậy của ngày:", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createFrame({ x: 34, y: 468, width: 140, height: 28, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 8, parentId: sid });
  await createText({ x: 42, y: 474, text: "✓ In trên bao bì (HSD)", fontSize: 11, fontWeight: 600, fontColor: C.primary, parentId: sid });
  await createFrame({ x: 182, y: 468, width: 100, height: 28, fillColor: C.bg, radius: 8, parentId: sid });
  await createText({ x: 190, y: 474, text: "Tự ước tính", fontSize: 11, fontColor: C.subtext, parentId: sid });

  // Field 5: Opened on
  await createText({ x: 20, y: 526, text: "Ngày mở nắp (Tùy chọn)", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 20, y: 546, width: 350, height: 42, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: sid });
  await createText({ x: 34, y: 558, text: "Hôm nay (13/10/2026)", fontSize: 14, fontColor: C.text, parentId: sid });

  // Field 6: Note
  await createText({ x: 20, y: 602, text: "Ghi chú bổ sung", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 20, y: 622, width: 350, height: 60, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: sid });
  await createText({ x: 34, y: 636, text: "Mua lốc 4 hộp tại Co.opMart...", fontSize: 13, fontColor: C.muted, parentId: sid });

  // Primary Button
  await createFrame({ x: 20, y: 720, width: 350, height: 50, fillColor: C.primary, radius: 14, parentId: sid });
  await createText({ x: 125, y: 735, text: "Lưu vào kho thực phẩm", fontSize: 15, fontWeight: 700, fontColor: C.white, parentId: sid });

  console.log("Screen 2 completed.");
  return screen;
}

// -------------------------------------------------------------
// SCREEN 3: WF-03 DETAIL VIEW
// -------------------------------------------------------------
async function buildScreen3(originX = 860) {
  console.log("Building Screen 3: Detail View...");
  const screen = await createFrame({
    x: originX, y: 0, width: 390, height: 844,
    name: "WF-03: Chi tiết món (Food Detail)",
    fillColor: C.bg, radius: 40
  });
  const sid = screen.id;
  await addStatusBar(sid);

  // Header Bar
  await createText({ x: 20, y: 52, text: "‹ Quay lại", fontSize: 15, fontWeight: 600, fontColor: C.primary, parentId: sid });
  await createText({ x: 150, y: 50, text: "Chi tiết món", fontSize: 17, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 330, y: 52, text: "Sửa", fontSize: 15, fontWeight: 600, fontColor: C.primary, parentId: sid });

  // Food title
  await createText({ x: 20, y: 92, text: "Sữa tươi Dalat Milk 450ml", fontSize: 22, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 20, y: 120, text: "📍 Vị trí: Cánh tủ mát • Nhập kho 12/10", fontSize: 13, fontColor: C.subtext, parentId: sid });

  // Urgency status card
  await createFrame({ x: 20, y: 150, width: 350, height: 68, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 14, parentId: sid });
  await createText({ x: 36, y: 162, text: "⚠️  CẬN HẠN: Cần dùng trong 2 ngày", fontSize: 14, fontWeight: 700, fontColor: C.amberText, parentId: sid });
  await createText({ x: 36, y: 184, text: "Hạn sử dụng: 15/10/2026 (Nguồn OCR bao bì)", fontSize: 12, fontColor: C.text, parentId: sid });

  // 2x2 Metrics Grid
  await createFrame({ x: 20, y: 232, width: 168, height: 74, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: sid });
  await createText({ x: 34, y: 244, text: "Lượng còn lại", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 34, y: 266, text: "350 ml", fontSize: 18, fontWeight: 700, fontColor: C.text, parentId: sid });

  await createFrame({ x: 202, y: 232, width: 168, height: 74, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: sid });
  await createText({ x: 216, y: 244, text: "Lượng ban đầu", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 216, y: 266, text: "450 ml", fontSize: 18, fontWeight: 600, fontColor: C.subtext, parentId: sid });

  await createFrame({ x: 20, y: 318, width: 168, height: 74, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: sid });
  await createText({ x: 34, y: 330, text: "Ngày mở nắp", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 34, y: 352, text: "13/10/2026", fontSize: 15, fontWeight: 600, fontColor: C.text, parentId: sid });

  await createFrame({ x: 202, y: 318, width: 168, height: 74, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: sid });
  await createText({ x: 216, y: 330, text: "Độ tin cậy HSD", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 216, y: 352, text: "Chính xác (OCR)", fontSize: 15, fontWeight: 600, fontColor: C.primary, parentId: sid });

  // Action Buttons Stack
  await createText({ x: 20, y: 410, text: "THAO TÁC VỚI THỰC PHẨM", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: sid });

  await createFrame({ x: 20, y: 432, width: 350, height: 48, fillColor: C.primary, radius: 12, parentId: sid });
  await createText({ x: 125, y: 446, text: "Dùng một phần (-ml)", fontSize: 15, fontWeight: 700, fontColor: C.white, parentId: sid });

  await createFrame({ x: 20, y: 490, width: 350, height: 46, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: sid });
  await createText({ x: 130, y: 504, text: "Ghi nhận dùng hết", fontSize: 14, fontWeight: 600, fontColor: C.text, parentId: sid });

  await createFrame({ x: 20, y: 546, width: 350, height: 46, fillColor: C.redBg, strokeColor: C.redBorder, radius: 12, parentId: sid });
  await createText({ x: 120, y: 560, text: "Bỏ món (Hỏng / Quá hạn)", fontSize: 14, fontWeight: 600, fontColor: C.redText, parentId: sid });

  // Recent log snippet
  await createText({ x: 20, y: 614, text: "NHẬT KÝ BIẾN ĐỘNG GẦN ĐÂY", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: sid });
  await createFrame({ x: 20, y: 634, width: 350, height: 110, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: sid });
  await createText({ x: 34, y: 648, text: "• 13/10 08:30: Dùng 100ml (Pha cà phê sáng)", fontSize: 13, fontColor: C.text, parentId: sid });
  await createText({ x: 44, y: 668, text: "Còn lại: 350 ml (Phiên bản 2)", fontSize: 11, fontColor: C.subtext, parentId: sid });
  await createText({ x: 34, y: 692, text: "• 12/10 14:00: Nhập kho mới (+450ml)", fontSize: 13, fontColor: C.text, parentId: sid });

  console.log("Screen 3 completed.");
  return screen;
}

// -------------------------------------------------------------
// SCREEN 4: WF-04 ACTION SHEET
// -------------------------------------------------------------
async function buildScreen4(originX = 1290) {
  console.log("Building Screen 4: Movement Action Sheet...");
  const screen = await createFrame({
    x: originX, y: 0, width: 390, height: 844,
    name: "WF-04: Thao tác kho (Stock Action Sheet)",
    fillColor: { r: 0.15, g: 0.20, b: 0.27, a: 1 }, radius: 40
  });
  const sid = screen.id;
  await addStatusBar(sid);

  await createText({ x: 20, y: 90, text: "‹ Quay lại", fontSize: 15, fontColor: C.subtext, parentId: sid });
  await createText({ x: 20, y: 130, text: "Sữa tươi Dalat Milk 450ml", fontSize: 22, fontWeight: 700, fontColor: { r: 0.5, g: 0.6, b: 0.7, a: 1 }, parentId: sid });

  // Bottom Sheet
  await createFrame({
    x: 0, y: 260, width: 390, height: 584,
    name: "Action Bottom Sheet",
    fillColor: C.white, radius: 28, parentId: sid
  });
  await createRect({ x: 175, y: 274, width: 40, height: 4, fillColor: C.border, radius: 2, parentId: sid });

  await createText({ x: 24, y: 298, text: "Ghi nhận sử dụng món", fontSize: 19, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 24, y: 324, text: "Món: Sữa tươi Dalat Milk • Hiện còn: 350 ml", fontSize: 13, fontColor: C.subtext, parentId: sid });

  await createFrame({ x: 24, y: 356, width: 166, height: 38, fillColor: C.primary, radius: 10, parentId: sid });
  await createText({ x: 50, y: 366, text: "Dùng thực phẩm", fontSize: 13, fontWeight: 700, fontColor: C.white, parentId: sid });
  await createFrame({ x: 200, y: 356, width: 166, height: 38, fillColor: C.bg, radius: 10, parentId: sid });
  await createText({ x: 240, y: 366, text: "Bỏ do hỏng", fontSize: 13, fontColor: C.subtext, parentId: sid });

  await createText({ x: 24, y: 418, text: "Số lượng sử dụng (ml) *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 24, y: 440, width: 342, height: 60, fillColor: C.bg, strokeColor: C.border, radius: 14, parentId: sid });
  await createFrame({ x: 36, y: 450, width: 40, height: 40, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: sid });
  await createText({ x: 50, y: 460, text: "-", fontSize: 20, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 145, y: 456, text: "100  ml", fontSize: 22, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createFrame({ x: 314, y: 450, width: 40, height: 40, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: sid });
  await createText({ x: 328, y: 460, text: "+", fontSize: 20, fontWeight: 700, fontColor: C.text, parentId: sid });

  await createFrame({ x: 24, y: 512, width: 70, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: sid });
  await createText({ x: 38, y: 519, text: "50 ml", fontSize: 12, fontColor: C.text, parentId: sid });
  await createFrame({ x: 102, y: 512, width: 78, height: 30, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 15, parentId: sid });
  await createText({ x: 114, y: 519, text: "100 ml ✓", fontSize: 12, fontWeight: 600, fontColor: C.primary, parentId: sid });
  await createFrame({ x: 188, y: 512, width: 70, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: sid });
  await createText({ x: 202, y: 519, text: "200 ml", fontSize: 12, fontColor: C.text, parentId: sid });
  await createFrame({ x: 266, y: 512, width: 100, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: sid });
  await createText({ x: 274, y: 519, text: "Hết (350ml)", fontSize: 12, fontColor: C.text, parentId: sid });

  await createText({ x: 24, y: 560, text: "Lý do / Mục đích sử dụng", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: sid });
  await createFrame({ x: 24, y: 582, width: 342, height: 44, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: sid });
  await createText({ x: 38, y: 595, text: "Pha cà phê sáng", fontSize: 14, fontColor: C.text, parentId: sid });

  await createFrame({ x: 24, y: 642, width: 342, height: 42, fillColor: C.primaryLight, radius: 10, parentId: sid });
  await createText({ x: 38, y: 654, text: "✓ Sau khi trừ: Kho còn 250 ml (Đủ cho 2 ngày tới)", fontSize: 12, fontWeight: 600, fontColor: C.primary, parentId: sid });

  await createFrame({ x: 24, y: 702, width: 342, height: 50, fillColor: C.primary, radius: 14, parentId: sid });
  await createText({ x: 110, y: 717, text: "Xác nhận trừ kho (100ml)", fontSize: 15, fontWeight: 700, fontColor: C.white, parentId: sid });

  await createText({ x: 175, y: 764, text: "Hủy bỏ", fontSize: 14, fontWeight: 500, fontColor: C.subtext, parentId: sid });

  console.log("Screen 4 completed.");
  return screen;
}

// -------------------------------------------------------------
// SCREEN 5: WF-05 AUDIT LOG / HISTORY
// -------------------------------------------------------------
async function buildScreen5(originX = 1720) {
  console.log("Building Screen 5: History / Audit Log...");
  const screen = await createFrame({
    x: originX, y: 0, width: 390, height: 844,
    name: "WF-05: Lịch sử biến động (Audit Log)",
    fillColor: C.bg, radius: 40
  });
  const sid = screen.id;
  await addStatusBar(sid);

  await createText({ x: 24, y: 46, text: "NHẬT KÝ KHO HÀNG", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: sid });
  await createText({ x: 24, y: 64, text: "Lịch sử biến động", fontSize: 24, fontWeight: 700, fontColor: C.text, parentId: sid });

  // Summary KPI card
  await createFrame({ x: 20, y: 104, width: 350, height: 72, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: sid });
  await createText({ x: 42, y: 118, text: "Đã dùng", fontSize: 11, fontColor: C.subtext, parentId: sid });
  await createText({ x: 46, y: 136, text: "8 lần", fontSize: 17, fontWeight: 700, fontColor: C.primary, parentId: sid });
  await createText({ x: 160, y: 118, text: "Nhập mới", fontSize: 11, fontColor: C.subtext, parentId: sid });
  await createText({ x: 165, y: 136, text: "3 món", fontSize: 17, fontWeight: 700, fontColor: C.blueText, parentId: sid });
  await createText({ x: 280, y: 118, text: "Hủy hỏng", fontSize: 11, fontColor: C.subtext, parentId: sid });
  await createText({ x: 288, y: 136, text: "1 món", fontSize: 17, fontWeight: 700, fontColor: C.redText, parentId: sid });

  // Feed items
  await createFrame({ x: 20, y: 192, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: sid });
  await createFrame({ x: 34, y: 206, width: 50, height: 24, fillColor: C.primaryLight, radius: 6, parentId: sid });
  await createText({ x: 40, y: 211, text: "DÙNG", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: sid });
  await createText({ x: 92, y: 210, text: "Sữa tươi Dalat Milk (-100ml)", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 34, y: 238, text: "Lượng: 450ml → 350ml • Lý do: Pha cà phê", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 34, y: 256, text: "🕒 13/10/2026 - 08:30 sáng", fontSize: 11, fontColor: C.muted, parentId: sid });

  await createFrame({ x: 20, y: 298, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: sid });
  await createFrame({ x: 34, y: 312, width: 56, height: 24, fillColor: C.redBg, radius: 6, parentId: sid });
  await createText({ x: 40, y: 317, text: "BỎ HỎNG", fontSize: 10, fontWeight: 700, fontColor: C.redText, parentId: sid });
  await createText({ x: 98, y: 316, text: "Phô mai lát Cheddar (-2)", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 34, y: 344, text: "Lượng: 6 → 4 lát • Lý do: Quá hạn mốc", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 34, y: 362, text: "🕒 12/10/2026 - 18:00", fontSize: 11, fontColor: C.muted, parentId: sid });

  await createFrame({ x: 20, y: 404, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: sid });
  await createFrame({ x: 34, y: 418, width: 62, height: 24, fillColor: C.blueBg, radius: 6, parentId: sid });
  await createText({ x: 40, y: 423, text: "NHẬP KHO", fontSize: 10, fontWeight: 700, fontColor: C.blueText, parentId: sid });
  await createText({ x: 104, y: 422, text: "Sữa tươi Dalat Milk (+450ml)", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 34, y: 450, text: "Khởi tạo mới • Vị trí: Cánh tủ mát", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 34, y: 468, text: "🕒 12/10/2026 - 14:00", fontSize: 11, fontColor: C.muted, parentId: sid });

  await createFrame({ x: 20, y: 510, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: sid });
  await createFrame({ x: 34, y: 524, width: 60, height: 24, fillColor: C.amberBg, radius: 6, parentId: sid });
  await createText({ x: 40, y: 529, text: "KIỂM KÊ", fontSize: 11, fontWeight: 700, fontColor: C.amberText, parentId: sid });
  await createText({ x: 102, y: 528, text: "Trứng gà Ba Huân (+2)", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 34, y: 556, text: "Điều chỉnh thực tế: 4 → 6 quả", fontSize: 12, fontColor: C.subtext, parentId: sid });
  await createText({ x: 34, y: 574, text: "🕒 10/10/2026 - 09:15", fontSize: 11, fontColor: C.muted, parentId: sid });

  await addBottomNavWithCenterHeroAdd(sid, "history");
  console.log("Screen 5 completed.");
  return screen;
}

// -------------------------------------------------------------
// SCREEN 6: WF-06 SETTINGS
// -------------------------------------------------------------
async function buildScreen6(originX = 2150) {
  console.log("Building Screen 6: Settings...");
  const screen = await createFrame({
    x: originX, y: 0, width: 390, height: 844,
    name: "WF-06: Cài đặt hệ thống (Settings)",
    fillColor: C.bg, radius: 40
  });
  const sid = screen.id;
  await addStatusBar(sid);

  await createText({ x: 24, y: 46, text: "TÙY CHỈNH HỆ THỐNG", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: sid });
  await createText({ x: 24, y: 64, text: "Cài đặt", fontSize: 24, fontWeight: 700, fontColor: C.text, parentId: sid });

  const uCard = await createFrame({ x: 20, y: 104, width: 350, height: 76, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: sid });
  await createFrame({ x: 36, y: 120, width: 44, height: 44, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 22, parentId: sid });
  await createText({ x: 47, y: 133, text: "HA", fontSize: 16, fontWeight: 700, fontColor: C.primary, parentId: sid });
  await createText({ x: 92, y: 122, text: "Phạm Hoàng An", fontSize: 16, fontWeight: 700, fontColor: C.text, parentId: sid });
  await createText({ x: 92, y: 144, text: "Múi giờ: Asia/Ho_Chi_Minh (+07:00)", fontSize: 12, fontColor: C.subtext, parentId: sid });

  await createText({ x: 24, y: 198, text: "CẢNH BÁO HẠN SỬ DỤNG", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: sid });
  const g1 = await createFrame({ x: 20, y: 218, width: 350, height: 140, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: sid });
  
  await createText({ x: 36, y: 234, text: "Báo trước hạn (Lead days)", fontSize: 14, fontWeight: 500, fontColor: C.text, parentId: sid });
  await createText({ x: 295, y: 234, text: "2 ngày ▾", fontSize: 14, fontWeight: 600, fontColor: C.primary, parentId: sid });
  await createRect({ x: 36, y: 264, width: 318, height: 1, fillColor: C.border, parentId: sid });

  await createText({ x: 36, y: 280, text: "Khung giờ thông báo", fontSize: 14, fontWeight: 500, fontColor: C.text, parentId: sid });
  await createText({ x: 295, y: 280, text: "08:00 sáng", fontSize: 14, fontColor: C.subtext, parentId: sid });
  await createRect({ x: 36, y: 310, width: 318, height: 1, fillColor: C.border, parentId: sid });

  await createText({ x: 36, y: 326, text: "Thông báo đẩy thiết bị", fontSize: 14, fontWeight: 500, fontColor: C.text, parentId: sid });
  await createFrame({ x: 300, y: 322, width: 44, height: 24, fillColor: C.primary, radius: 12, parentId: sid });
  await createFrame({ x: 322, y: 324, width: 20, height: 20, fillColor: C.white, radius: 10, parentId: sid });

  await createText({ x: 24, y: 376, text: "VỊ TRÍ LƯU TRỮ TRONG KHO", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: sid });
  const g2 = await createFrame({ x: 20, y: 396, width: 350, height: 124, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: sid });
  await createText({ x: 36, y: 412, text: "❄️ Ngăn mát tủ lạnh", fontSize: 14, fontColor: C.text, parentId: sid });
  await createText({ x: 310, y: 412, text: "3 món", fontSize: 13, fontColor: C.subtext, parentId: sid });
  await createRect({ x: 36, y: 436, width: 318, height: 1, fillColor: C.border, parentId: sid });
  await createText({ x: 36, y: 450, text: "🧊 Ngăn đông", fontSize: 14, fontColor: C.text, parentId: sid });
  await createText({ x: 310, y: 450, text: "1 món", fontSize: 13, fontColor: C.subtext, parentId: sid });
  await createRect({ x: 36, y: 474, width: 318, height: 1, fillColor: C.border, parentId: sid });
  await createText({ x: 36, y: 488, text: "🥫 Kệ bếp / Tủ khô", fontSize: 14, fontColor: C.text, parentId: sid });
  await createText({ x: 310, y: 488, text: "1 món", fontSize: 13, fontColor: C.subtext, parentId: sid });

  await createText({ x: 24, y: 538, text: "QUẢN TRỊ DỮ LIỆU", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: sid });
  const g3 = await createFrame({ x: 20, y: 558, width: 350, height: 96, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: sid });
  await createText({ x: 36, y: 574, text: "📥 Xuất dữ liệu kho (CSV)", fontSize: 14, fontWeight: 600, fontColor: C.primary, parentId: sid });
  await createRect({ x: 36, y: 602, width: 318, height: 1, fillColor: C.border, parentId: sid });
  await createText({ x: 36, y: 618, text: "🔄 Đặt lại dữ liệu mẫu (Demo reset)", fontSize: 14, fontWeight: 500, fontColor: C.redText, parentId: sid });

  await addBottomNavWithCenterHeroAdd(sid, "settings");
  console.log("Screen 6 completed.");
  return screen;
}

// Main execution
ws.on("open", async () => {
  console.log("Connected to WebSocket server. Joining channel:", CHANNEL);
  ws.send(JSON.stringify({ type: "join", channel: CHANNEL, id: "main-join" }));
  await new Promise(r => setTimeout(r, 800));

  try {
    // Clean old nodes first
    console.log("Checking and cleaning existing nodes...");
    const doc = await sendCmd("get_document_info", {});
    for (const c of (doc.children || [])) {
      console.log("Deleting old node:", c.name, c.id);
      await sendCmd("delete_node", { nodeId: c.id });
    }

    console.log("Starting full design generation for Expiry App in Figma...");
    const s1 = await buildScreen1(0);
    const s2 = await buildScreen2(430);
    const s3 = await buildScreen3(860);
    const s4 = await buildScreen4(1290);
    const s5 = await buildScreen5(1720);
    const s6 = await buildScreen6(2150);

    const screenIds = [s1.id, s2.id, s3.id, s4.id, s5.id, s6.id];
    console.log("Setting focus/selection on screens:", screenIds);
    await sendCmd("set_selections", { nodeIds: screenIds });

    console.log("ALL 6 SCREENS SUCCESSFULLY RE-GENERATED WITH GIANT '+' BUTTON!");
    process.exit(0);
  } catch (err) {
    console.error("Error during Figma generation:", err);
    process.exit(1);
  }
});

setTimeout(() => {
  console.error("Timeout reached during generation.");
  process.exit(1);
}, 60000);
