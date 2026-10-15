import WebSocket from "ws";

const CHANNEL = "do871qiv";
const ws = new WebSocket("ws://localhost:3055");

let seq = 0;
function sendCmd(command, params, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const id = "cmd-" + (++seq);
    const timer = setTimeout(() => {
      ws.off("message", handler);
      reject(new Error(`Timeout waiting for response to ${command} on channel ${CHANNEL}`));
    }, timeoutMs);

    const handler = (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.message?.id === id) {
          clearTimeout(timer);
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
    name: opts.name || opts.text?.slice(0, 24) || "Text",
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
  bg: { r: 0.97, g: 0.98, b: 0.99, a: 1 },
  white: { r: 1, g: 1, b: 1, a: 1 },
  text: { r: 0.06, g: 0.09, b: 0.16, a: 1 },
  subtext: { r: 0.39, g: 0.45, b: 0.55, a: 1 },
  muted: { r: 0.58, g: 0.64, b: 0.72, a: 1 },
  border: { r: 0.88, g: 0.91, b: 0.94, a: 1 },
  borderLight: { r: 0.93, g: 0.95, b: 0.97, a: 1 },
  
  // Brand Emerald
  primary: { r: 0.02, g: 0.59, b: 0.41, a: 1 },
  primaryHover: { r: 0.02, g: 0.5, b: 0.35, a: 1 },
  primaryLight: { r: 0.92, g: 0.99, b: 0.96, a: 1 },
  primaryBorder: { r: 0.65, g: 0.92, b: 0.81, a: 1 },
  
  // Danger / Expired Red
  redBg: { r: 1, g: 0.95, b: 0.95, a: 1 },
  redBorder: { r: 0.99, g: 0.8, b: 0.8, a: 1 },
  redText: { r: 0.86, g: 0.15, b: 0.15, a: 1 },
  
  // Warning / Soon Amber
  amberBg: { r: 1, g: 0.98, b: 0.92, a: 1 },
  amberBorder: { r: 0.99, g: 0.87, b: 0.63, a: 1 },
  amberText: { r: 0.78, g: 0.44, b: 0.02, a: 1 },

  // Blue / Info
  blueBg: { r: 0.93, g: 0.96, b: 1, a: 1 },
  blueBorder: { r: 0.75, g: 0.85, b: 0.99, a: 1 },
  blueText: { r: 0.12, g: 0.4, b: 0.8, a: 1 },

  // Dark overlay
  overlay: { r: 0.06, g: 0.09, b: 0.16, a: 0.45 },
};

const addStatusBar = (parentId) => Promise.all([
  createText({ x: 28, y: 14, text: "9:41", fontSize: 13, fontWeight: 700, fontColor: C.text, parentId }),
  createText({ x: 310, y: 14, text: "5G  89%", fontSize: 12, fontWeight: 600, fontColor: C.text, parentId })
]);

const addBottomNav = (parentId, activeTab = "kho") => {
  const navY = 765;
  const p = [];
  p.push(createRect({ x: 0, y: navY, width: 390, height: 79, fillColor: C.white, strokeColor: C.border, parentId }));

  p.push(createText({ x: 32, y: navY + 12, text: "📦", fontSize: 20, parentId }));
  p.push(createText({ x: 24, y: navY + 36, text: "Kho hàng", fontSize: 11, fontWeight: activeTab === "kho" ? 700 : 500, fontColor: activeTab === "kho" ? C.primary : C.subtext, parentId }));

  p.push(createText({ x: 104, y: navY + 12, text: "⚠️", fontSize: 20, parentId }));
  p.push(createText({ x: 96, y: navY + 36, text: "Cần chú ý", fontSize: 11, fontWeight: activeTab === "attention" ? 700 : 500, fontColor: activeTab === "attention" ? C.primary : C.subtext, parentId }));

  // Center Raised Hero Add
  p.push(createFrame({ x: 168, y: navY - 18, width: 54, height: 54, fillColor: C.primary, strokeColor: C.white, strokeWeight: 3, radius: 27, parentId }));
  p.push(createText({ x: 184, y: navY - 14, text: "+", fontSize: 32, fontWeight: 800, fontColor: C.white, parentId }));
  p.push(createText({ x: 180, y: navY + 42, text: "Thêm", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId }));

  p.push(createText({ x: 258, y: navY + 12, text: "⏱️", fontSize: 20, parentId }));
  p.push(createText({ x: 250, y: navY + 36, text: "Lịch sử", fontSize: 11, fontWeight: activeTab === "history" ? 700 : 500, fontColor: activeTab === "history" ? C.primary : C.subtext, parentId }));

  p.push(createText({ x: 330, y: navY + 12, text: "⚙️", fontSize: 20, parentId }));
  p.push(createText({ x: 322, y: navY + 36, text: "Cài đặt", fontSize: 11, fontWeight: activeTab === "settings" ? 700 : 500, fontColor: activeTab === "settings" ? C.primary : C.subtext, parentId }));

  return Promise.all(p);
};

ws.on("open", async () => {
  console.log(`Connected to WebSocket! Joining channel "${CHANNEL}"...`);
  ws.send(JSON.stringify({ type: "join", channel: CHANNEL, id: "builder-main" }));
  await new Promise(r => setTimeout(r, 600));

  console.log("Cleaning old screens on canvas...");
  try {
    const doc = await sendCmd("get_document_info", {});
    for (const c of (doc.children || [])) {
      console.log(`Deleting old node: ${c.name} (${c.id})`);
      await sendCmd("delete_node", { nodeId: c.id });
    }
  } catch (e) {
    console.log("Clean notice:", e.message);
  }

  // =========================================================================
  // SCREEN 1: WF-01 KHO THỰC PHẨM & DẤU + TO NHẤT Ở ĐẦU (x: 0, y: 0)
  // =========================================================================
  console.log("Creating Screen 1 (WF-01): Kho thực phẩm with Giant + Hero Card...");
  const s1 = await createFrame({
    x: 0, y: 0, width: 390, height: 844,
    name: "WF-01: Kho thực phẩm (Inventory)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s1.id);

  // Top Header
  await createText({ x: 20, y: 44, text: "EXPIRY MANAGEMENT", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s1.id });
  await createText({ x: 20, y: 60, text: "Kho thực phẩm", fontSize: 24, fontWeight: 800, fontColor: C.text, parentId: s1.id });
  
  // Header Avatar / Demo Mode Pill
  await createFrame({ x: 254, y: 52, width: 62, height: 28, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 14, parentId: s1.id });
  await createText({ x: 266, y: 58, text: "DEMO", fontSize: 11, fontWeight: 800, fontColor: C.amberText, parentId: s1.id });

  await createFrame({ x: 326, y: 48, width: 42, height: 42, fillColor: C.white, strokeColor: C.border, radius: 21, parentId: s1.id });
  await createText({ x: 336, y: 60, text: "HA", fontSize: 14, fontWeight: 700, fontColor: C.primary, parentId: s1.id });

  // ⭐⭐⭐ HERO GIANT ADD BUTTON AT THE VERY TOP ⭐⭐⭐
  await createFrame({
    x: 20, y: 102, width: 350, height: 90,
    name: "Hero Add Card (Dấu + To Nhất)",
    fillColor: C.primary, radius: 22, parentId: s1.id
  });
  // Giant white circle with 46px + symbol
  await createFrame({ x: 34, y: 117, width: 60, height: 60, fillColor: C.white, radius: 30, parentId: s1.id });
  await createText({ x: 48, y: 114, text: "+", fontSize: 46, fontWeight: 900, fontColor: C.primary, parentId: s1.id });

  // Hero Card text
  await createText({ x: 108, y: 122, text: "THÊM THỰC PHẨM MỚI", fontSize: 17, fontWeight: 800, fontColor: C.white, parentId: s1.id });
  await createText({ x: 108, y: 146, text: "Chạm để nhập món • Tự động bật Auth nếu chưa login", fontSize: 11, fontWeight: 500, fontColor: C.primaryLight, parentId: s1.id });
  await createText({ x: 340, y: 133, text: "›", fontSize: 26, fontWeight: 600, fontColor: C.white, parentId: s1.id });

  // Attention Alert Banner
  await createFrame({ x: 20, y: 204, width: 350, height: 54, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 14, parentId: s1.id });
  await createText({ x: 34, y: 214, text: "⚠️  2 món cần chú ý gấp", fontSize: 13, fontWeight: 700, fontColor: C.amberText, parentId: s1.id });
  await createText({ x: 34, y: 233, text: "1 món quá hạn • 1 món cận hạn trong 2 ngày", fontSize: 12, fontColor: C.text, parentId: s1.id });

  // Search input
  await createFrame({ x: 20, y: 268, width: 350, height: 40, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s1.id });
  await createText({ x: 34, y: 279, text: "🔍  Tìm kiếm món ăn, vị trí lưu trữ...", fontSize: 13, fontColor: C.muted, parentId: s1.id });

  // Filter Chips
  await createFrame({ x: 20, y: 316, width: 84, height: 30, fillColor: C.text, radius: 15, parentId: s1.id });
  await createText({ x: 32, y: 323, text: "Tất cả (4)", fontSize: 12, fontWeight: 600, fontColor: C.white, parentId: s1.id });
  await createFrame({ x: 110, y: 316, width: 94, height: 30, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 15, parentId: s1.id });
  await createText({ x: 120, y: 323, text: "Cần chú ý (2)", fontSize: 12, fontWeight: 600, fontColor: C.amberText, parentId: s1.id });
  await createFrame({ x: 210, y: 316, width: 90, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: s1.id });
  await createText({ x: 220, y: 323, text: "Ngăn mát (2)", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createFrame({ x: 306, y: 316, width: 64, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: s1.id });
  await createText({ x: 314, y: 323, text: "Đông (1)", fontSize: 12, fontColor: C.subtext, parentId: s1.id });

  // Food Cards
  // Card 1: Quá hạn
  await createFrame({ x: 20, y: 354, width: 350, height: 92, fillColor: C.white, strokeColor: C.redBorder, radius: 16, parentId: s1.id });
  await createText({ x: 36, y: 366, text: "Phô mai lát Cheddar", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s1.id });
  await createText({ x: 36, y: 388, text: "Còn 4 lát • Ngăn mát tủ lạnh", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createText({ x: 36, y: 410, text: "HSD: 06/10/2026 (Quá hạn 7 ngày)", fontSize: 12, fontWeight: 600, fontColor: C.redText, parentId: s1.id });
  await createFrame({ x: 278, y: 368, width: 76, height: 28, fillColor: C.redBg, strokeColor: C.redBorder, radius: 8, parentId: s1.id });
  await createText({ x: 288, y: 374, text: "Bỏ hỏng", fontSize: 11, fontWeight: 700, fontColor: C.redText, parentId: s1.id });

  // Card 2: Cận hạn
  await createFrame({ x: 20, y: 454, width: 350, height: 92, fillColor: C.white, strokeColor: C.amberBorder, radius: 16, parentId: s1.id });
  await createText({ x: 36, y: 466, text: "Trứng gà Ba Huân", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s1.id });
  await createText({ x: 36, y: 488, text: "Còn 8 quả • Ngăn mát tủ lạnh", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createText({ x: 36, y: 510, text: "HSD: 15/10/2026 (Cận hạn trong 2 ngày)", fontSize: 12, fontWeight: 600, fontColor: C.amberText, parentId: s1.id });
  await createFrame({ x: 278, y: 468, width: 76, height: 28, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 8, parentId: s1.id });
  await createText({ x: 286, y: 474, text: "Dùng ngay", fontSize: 11, fontWeight: 700, fontColor: C.amberText, parentId: s1.id });

  // Card 3: Unknown Date với Nút nhanh "Thêm ngày"
  await createFrame({ x: 20, y: 554, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s1.id });
  await createText({ x: 36, y: 566, text: "Rau cải thìa xanh", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s1.id });
  await createText({ x: 36, y: 588, text: "Còn 1 bó • Ngăn rau củ", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createText({ x: 36, y: 610, text: "Chưa có ngày theo dõi (Chưa gắn hạn)", fontSize: 12, fontWeight: 600, fontColor: C.subtext, parentId: s1.id });
  await createFrame({ x: 270, y: 568, width: 84, height: 28, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 8, parentId: s1.id });
  await createText({ x: 278, y: 574, text: "＋ Thêm ngày", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s1.id });

  // Card 4: An toàn (Later)
  await createFrame({ x: 20, y: 654, width: 350, height: 86, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s1.id });
  await createText({ x: 36, y: 666, text: "Sữa chua Vinamilk nha đam", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s1.id });
  await createText({ x: 36, y: 688, text: "Còn 4 hộp • HSD: 30/10/2026 (Còn 17 ngày)", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createText({ x: 36, y: 708, text: "Trạng thái: An toàn • Ngăn mát", fontSize: 11, fontWeight: 600, fontColor: C.primary, parentId: s1.id });

  await addBottomNav(s1.id, "kho");

  // =========================================================================
  // SCREEN 2: WF-00 MODAL AUTH CONTEXTUAL GATE (x: 430, y: 0)
  // Bật lên khi bấm nút '+' hoặc CTA nhập liệu từ chế độ Demo!
  // =========================================================================
  console.log("Creating Screen 2 (WF-00): Auth Contextual Gate Modal...");
  const s2 = await createFrame({
    x: 430, y: 0, width: 390, height: 844,
    name: "WF-00: Xác thực tài khoản (Auth Gate)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s2.id);

  // Background overlay representation
  await createRect({ x: 0, y: 0, width: 390, height: 220, fillColor: C.primaryLight, parentId: s2.id });
  await createText({ x: 24, y: 50, text: "EXPIRY AUTHENTICATION", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s2.id });
  await createText({ x: 24, y: 70, text: "Đăng nhập tài khoản", fontSize: 24, fontWeight: 800, fontColor: C.text, parentId: s2.id });
  await createText({ x: 24, y: 100, text: "Lưu dữ liệu kho cá nhân & đồng bộ thiết bị", fontSize: 13, fontColor: C.subtext, parentId: s2.id });

  // Draft Preservation Notice Box (UF-11)
  await createFrame({ x: 20, y: 132, width: 350, height: 74, fillColor: C.blueBg, strokeColor: C.blueBorder, radius: 14, parentId: s2.id });
  await createText({ x: 34, y: 144, text: "🔒  BẢO LƯU BẢN NHÁP (DRAFT PRESERVED)", fontSize: 12, fontWeight: 700, fontColor: C.blueText, parentId: s2.id });
  await createText({ x: 34, y: 164, text: "Bản nháp món bạn đang nhập sẽ được giữ nguyên 100% và tự động lưu vào kho sau khi đăng nhập thành công.", fontSize: 11, fontColor: C.text, parentId: s2.id });

  // Auth Card
  await createFrame({ x: 20, y: 224, width: 350, height: 490, fillColor: C.white, strokeColor: C.border, radius: 24, parentId: s2.id });

  // Tab switch Login / Register
  await createFrame({ x: 36, y: 244, width: 318, height: 40, fillColor: C.bg, radius: 10, parentId: s2.id });
  await createFrame({ x: 40, y: 248, width: 155, height: 32, fillColor: C.white, radius: 8, parentId: s2.id });
  await createText({ x: 88, y: 256, text: "Đăng nhập", fontSize: 13, fontWeight: 700, fontColor: C.text, parentId: s2.id });
  await createText({ x: 236, y: 256, text: "Tạo tài khoản", fontSize: 13, fontWeight: 600, fontColor: C.muted, parentId: s2.id });

  // Email Field
  await createText({ x: 36, y: 304, text: "Email / Tên đăng nhập *", fontSize: 12, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 36, y: 324, width: 318, height: 46, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s2.id });
  await createText({ x: 50, y: 338, text: "nguyen.van.a@example.com", fontSize: 14, fontColor: C.text, parentId: s2.id });

  // Password Field
  await createText({ x: 36, y: 386, text: "Mật khẩu *", fontSize: 12, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 36, y: 406, width: 318, height: 46, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s2.id });
  await createText({ x: 50, y: 422, text: "••••••••••••", fontSize: 15, fontColor: C.text, parentId: s2.id });
  await createText({ x: 260, y: 460, text: "Quên mật khẩu?", fontSize: 12, fontWeight: 500, fontColor: C.primary, parentId: s2.id });

  // Submit CTA Button
  await createFrame({ x: 36, y: 494, width: 318, height: 48, fillColor: C.primary, radius: 14, parentId: s2.id });
  await createText({ x: 104, y: 508, text: "ĐĂNG NHẬP & TIẾP TỤC", fontSize: 14, fontWeight: 700, fontColor: C.white, parentId: s2.id });

  // Divider
  await createRect({ x: 36, y: 564, width: 318, height: 1, fillColor: C.border, parentId: s2.id });
  await createText({ x: 160, y: 556, text: "hoặc", fontSize: 12, fontColor: C.muted, parentId: s2.id });

  // Demo Return Button
  await createFrame({ x: 36, y: 584, width: 318, height: 46, fillColor: C.bg, strokeColor: C.border, radius: 14, parentId: s2.id });
  await createText({ x: 108, y: 598, text: "Quay lại xem thử chế độ Demo", fontSize: 13, fontWeight: 600, fontColor: C.subtext, parentId: s2.id });

  await createText({ x: 36, y: 654, text: "🔒 Chuẩn phiên bảo mật Cookie HttpOnly + CSRF Protection", fontSize: 10, fontColor: C.muted, parentId: s2.id });

  // Bottom Nav with Settings active
  await addBottomNav(s2.id, "settings");

  // =========================================================================
  // SCREEN 3: WF-02 BIỂU MẪU THÊM MÓN & TRỢ THỦ QUÉT OCR (x: 860, y: 0)
  // =========================================================================
  console.log("Creating Screen 3 (WF-02): Entry Form with Camera OCR Assistant...");
  const s3 = await createFrame({
    x: 860, y: 0, width: 390, height: 844,
    name: "WF-02: Thêm món & OCR Camera (Entry Form)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s3.id);

  // Top Nav bar
  await createText({ x: 20, y: 50, text: "✕ Hủy", fontSize: 14, fontWeight: 600, fontColor: C.subtext, parentId: s3.id });
  await createText({ x: 135, y: 50, text: "Thêm thực phẩm", fontSize: 16, fontWeight: 700, fontColor: C.text, parentId: s3.id });
  await createText({ x: 334, y: 50, text: "Lưu", fontSize: 15, fontWeight: 700, fontColor: C.primary, parentId: s3.id });

  // Form Container
  await createFrame({ x: 16, y: 84, width: 358, height: 746, fillColor: C.white, strokeColor: C.border, radius: 20, parentId: s3.id });

  // Food Name
  await createText({ x: 32, y: 100, text: "TÊN THỰC PHẨM *", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s3.id });
  await createFrame({ x: 32, y: 118, width: 326, height: 42, fillColor: C.white, strokeColor: C.primary, strokeWeight: 2, radius: 10, parentId: s3.id });
  await createText({ x: 44, y: 130, text: "Sữa tươi thanh trùng Vinamilk", fontSize: 14, fontWeight: 600, fontColor: C.text, parentId: s3.id });

  // ⭐⭐⭐ HERO OCR CAMERA ASSISTANT CARD (Trợ thủ quét nhãn) ⭐⭐⭐
  await createFrame({
    x: 32, y: 170, width: 326, height: 114,
    name: "OCR Scan Assistant Card",
    fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 14, parentId: s3.id
  });
  await createText({ x: 46, y: 182, text: "📷  TRỢ THỦ QUÉT BAO BÌ (AI OCR)", fontSize: 12, fontWeight: 800, fontColor: C.primary, parentId: s3.id });
  await createText({ x: 46, y: 202, text: "Chụp vùng in NSX/HSD trên bao bì để tự bóc tách ngày.", fontSize: 11, fontColor: C.subtext, parentId: s3.id });
  
  // OCR Candidate Review (Human-in-the-loop)
  await createFrame({ x: 44, y: 226, width: 302, height: 46, fillColor: C.white, strokeColor: C.primaryBorder, radius: 8, parentId: s3.id });
  await createText({ x: 54, y: 234, text: "✓ Gợi ý đọc được: HSD: 24/10/2026 (Chính xác)", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s3.id });
  await createText({ x: 54, y: 250, text: "Nhãn: Use-by • Đối chiếu và xác nhận trước khi lưu", fontSize: 10, fontColor: C.subtext, parentId: s3.id });

  // Quantity and Unit
  await createText({ x: 32, y: 298, text: "SỐ LƯỢNG BAN ĐẦU *", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s3.id });
  await createFrame({ x: 32, y: 316, width: 140, height: 42, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s3.id });
  await createText({ x: 44, y: 328, text: "1", fontSize: 14, fontWeight: 700, fontColor: C.text, parentId: s3.id });

  await createText({ x: 190, y: 298, text: "ĐƠN VỊ TÍNH *", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s3.id });
  await createFrame({ x: 190, y: 316, width: 168, height: 42, fillColor: C.bg, strokeColor: C.border, radius: 10, parentId: s3.id });
  await createFrame({ x: 194, y: 320, width: 62, height: 34, fillColor: C.white, strokeColor: C.primary, radius: 8, parentId: s3.id });
  await createText({ x: 206, y: 329, text: "Hộp/Cái", fontSize: 12, fontWeight: 700, fontColor: C.primary, parentId: s3.id });
  await createText({ x: 270, y: 329, text: "g", fontSize: 12, fontColor: C.subtext, parentId: s3.id });
  await createText({ x: 312, y: 329, text: "ml", fontSize: 12, fontColor: C.subtext, parentId: s3.id });

  // Storage Location
  await createText({ x: 32, y: 374, text: "VỊ TRÍ BẢO QUẢN", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s3.id });
  await createFrame({ x: 32, y: 392, width: 326, height: 42, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s3.id });
  await createText({ x: 44, y: 404, text: "❄️  Ngăn mát tủ lạnh", fontSize: 14, fontColor: C.text, parentId: s3.id });
  await createText({ x: 334, y: 404, text: "▾", fontSize: 14, fontColor: C.muted, parentId: s3.id });

  // Expiry Date Settings
  await createText({ x: 32, y: 448, text: "NGÀY HẠN SỬ DỤNG", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s3.id });
  await createFrame({ x: 32, y: 466, width: 326, height: 42, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s3.id });
  await createText({ x: 44, y: 478, text: "📅  24/10/2026 (Còn 11 ngày)", fontSize: 14, fontWeight: 600, fontColor: C.text, parentId: s3.id });

  // Date Source & Label Type
  await createText({ x: 32, y: 520, text: "NGUỒN GỐC & LOẠI NHÃN", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s3.id });
  await createFrame({ x: 32, y: 538, width: 156, height: 36, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 8, parentId: s3.id });
  await createText({ x: 42, y: 548, text: "In trên bao bì", fontSize: 12, fontWeight: 600, fontColor: C.primary, parentId: s3.id });
  await createFrame({ x: 198, y: 538, width: 160, height: 36, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 8, parentId: s3.id });
  await createText({ x: 210, y: 548, text: "Use-by (Sử dụng đến)", fontSize: 12, fontWeight: 600, fontColor: C.amberText, parentId: s3.id });

  // Opened on & Notes
  await createText({ x: 32, y: 588, text: "NGÀY MỞ NẮP & GHI CHÚ", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s3.id });
  await createFrame({ x: 32, y: 606, width: 326, height: 40, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s3.id });
  await createText({ x: 44, y: 618, text: "Mở nắp hôm nay • Để ở cánh cửa tủ lạnh", fontSize: 12, fontColor: C.subtext, parentId: s3.id });

  // Submit button
  await createFrame({ x: 32, y: 668, width: 326, height: 48, fillColor: C.primary, radius: 12, parentId: s3.id });
  await createText({ x: 118, y: 682, text: "LƯU VÀO KHO HÀNG", fontSize: 14, fontWeight: 700, fontColor: C.white, parentId: s3.id });

  // =========================================================================
  // SCREEN 4: WF-03 CHI TIẾT THỰC PHẨM & CỤM 3 CTA (x: 1290, y: 0)
  // =========================================================================
  console.log("Creating Screen 4 (WF-03): Food Detail with Core Action Triggers...");
  const s4 = await createFrame({
    x: 1290, y: 0, width: 390, height: 844,
    name: "WF-03: Chi tiết món (Food Detail)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s4.id);

  // Top Nav
  await createText({ x: 20, y: 50, text: "‹ Quay lại", fontSize: 14, fontWeight: 600, fontColor: C.primary, parentId: s4.id });
  await createText({ x: 135, y: 50, text: "Chi tiết món ăn", fontSize: 16, fontWeight: 700, fontColor: C.text, parentId: s4.id });
  await createText({ x: 332, y: 50, text: "Sửa ✎", fontSize: 14, fontWeight: 600, fontColor: C.primary, parentId: s4.id });

  // Food Hero Card
  await createFrame({ x: 20, y: 84, width: 350, height: 130, fillColor: C.white, strokeColor: C.border, radius: 20, parentId: s4.id });
  await createText({ x: 36, y: 100, text: "Sữa tươi thanh trùng Vinamilk", fontSize: 18, fontWeight: 800, fontColor: C.text, parentId: s4.id });
  await createText({ x: 36, y: 126, text: "Số lượng còn lại: 1 Hộp (900ml)", fontSize: 14, fontWeight: 700, fontColor: C.primary, parentId: s4.id });
  
  // Status Badge
  await createFrame({ x: 36, y: 154, width: 180, height: 32, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 16, parentId: s4.id });
  await createText({ x: 50, y: 162, text: "⚠️ CẬN HẠN (Còn 2 ngày)", fontSize: 12, fontWeight: 700, fontColor: C.amberText, parentId: s4.id });

  // Food Safety Reason Box (S3.33)
  await createFrame({ x: 20, y: 226, width: 350, height: 88, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 14, parentId: s4.id });
  await createText({ x: 34, y: 238, text: "LÝ DO CẢNH BÁO: HẠN SỬ DỤNG ĐẾN (USE-BY)", fontSize: 11, fontWeight: 800, fontColor: C.amberText, parentId: s4.id });
  await createText({ x: 34, y: 256, text: "Hạn ghi: 15/10/2026. Đây là mốc an toàn vi sinh nghiêm ngặt. Không nên sử dụng sau ngày này để bảo đảm sức khỏe.", fontSize: 11, fontColor: C.text, parentId: s4.id });

  // Lifecycle Specs Table Card
  await createFrame({ x: 20, y: 326, width: 350, height: 166, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s4.id });
  await createText({ x: 36, y: 342, text: "Vị trí bảo quản:", fontSize: 13, fontColor: C.subtext, parentId: s4.id });
  await createText({ x: 220, y: 342, text: "Ngăn mát tủ lạnh", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s4.id });
  await createRect({ x: 36, y: 366, width: 318, height: 1, fillColor: C.borderLight, parentId: s4.id });

  await createText({ x: 36, y: 378, text: "Nguồn gốc ngày:", fontSize: 13, fontColor: C.subtext, parentId: s4.id });
  await createText({ x: 220, y: 378, text: "In trên bao bì (OCR)", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s4.id });
  await createRect({ x: 36, y: 402, width: 318, height: 1, fillColor: C.borderLight, parentId: s4.id });

  await createText({ x: 36, y: 414, text: "Tình trạng mở nắp:", fontSize: 13, fontColor: C.subtext, parentId: s4.id });
  await createText({ x: 220, y: 414, text: "Đã mở 1 ngày trước", fontSize: 13, fontWeight: 600, fontColor: C.amberText, parentId: s4.id });
  await createRect({ x: 36, y: 438, width: 318, height: 1, fillColor: C.borderLight, parentId: s4.id });

  await createText({ x: 36, y: 450, text: "Ghi chú món ăn:", fontSize: 13, fontColor: C.subtext, parentId: s4.id });
  await createText({ x: 220, y: 450, text: "Để ở cánh cửa tủ", fontSize: 13, fontColor: C.text, parentId: s4.id });

  // ⭐⭐⭐ CỤM 3 NÚT ĐIỀU HƯỚNG THAO TÁC BIẾN ĐỘNG (CORE 3 ACTIONS) ⭐⭐⭐
  await createText({ x: 24, y: 510, text: "THAO TÁC BIẾN ĐỘNG SỐ LƯỢNG KHO", fontSize: 11, fontWeight: 800, fontColor: C.muted, parentId: s4.id });

  // Button 1: Đã dùng (Use)
  await createFrame({ x: 20, y: 530, width: 108, height: 64, fillColor: C.primary, radius: 14, parentId: s4.id });
  await createText({ x: 62, y: 542, text: "✓", fontSize: 18, fontWeight: 800, fontColor: C.white, parentId: s4.id });
  await createText({ x: 42, y: 566, text: "ĐÃ DÙNG", fontSize: 12, fontWeight: 700, fontColor: C.white, parentId: s4.id });

  // Button 2: Đã bỏ (Discard)
  await createFrame({ x: 140, y: 530, width: 108, height: 64, fillColor: C.redBg, strokeColor: C.redBorder, radius: 14, parentId: s4.id });
  await createText({ x: 184, y: 542, text: "🗑️", fontSize: 18, parentId: s4.id });
  await createText({ x: 168, y: 566, text: "ĐÃ BỎ", fontSize: 12, fontWeight: 700, fontColor: C.redText, parentId: s4.id });

  // Button 3: Kiểm lại (Recount)
  await createFrame({ x: 260, y: 530, width: 110, height: 64, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s4.id });
  await createText({ x: 304, y: 542, text: "⚖️", fontSize: 18, parentId: s4.id });
  await createText({ x: 284, y: 566, text: "KIỂM LẠI", fontSize: 12, fontWeight: 700, fontColor: C.text, parentId: s4.id });

  // History Shortcut
  await createFrame({ x: 20, y: 610, width: 350, height: 44, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s4.id });
  await createText({ x: 36, y: 624, text: "⏱️  Xem lịch sử biến động món này (2 lần)", fontSize: 13, fontWeight: 600, fontColor: C.primary, parentId: s4.id });
  await createText({ x: 346, y: 624, text: "›", fontSize: 16, fontColor: C.muted, parentId: s4.id });

  // Remove Record Button
  await createFrame({ x: 20, y: 670, width: 350, height: 44, fillColor: C.bg, strokeColor: C.redBorder, radius: 12, parentId: s4.id });
  await createText({ x: 110, y: 684, text: "Xóa bản ghi này khỏi danh sách", fontSize: 13, fontWeight: 600, fontColor: C.redText, parentId: s4.id });
  await createText({ x: 36, y: 722, text: "⚠️ Chuyển vào Thùng rác, không tính là đã dùng hoặc bỏ lãng phí.", fontSize: 10, fontColor: C.muted, parentId: s4.id });

  await addBottomNav(s4.id, "kho");

  // =========================================================================
  // SCREEN 5: WF-04 BẢNG THAO TÁC BIẾN ĐỘNG ACTION SHEET (x: 1720, y: 0)
  // =========================================================================
  console.log("Creating Screen 5 (WF-04): Stock Movement Action Sheet...");
  const s5 = await createFrame({
    x: 1720, y: 0, width: 390, height: 844,
    name: "WF-04: Thao tác kho (Stock Action Sheet)",
    fillColor: C.overlay, radius: 40
  });

  // Action Bottom Sheet
  await createFrame({
    x: 0, y: 220, width: 390, height: 624,
    name: "Modal Bottom Sheet",
    fillColor: C.white, radius: 32, parentId: s5.id
  });

  // Pull Handle
  await createRect({ x: 175, y: 232, width: 40, height: 4, fillColor: C.border, radius: 2, parentId: s5.id });

  // Header
  await createText({ x: 24, y: 252, text: "GHI NHẬN BIẾN ĐỘNG KHO", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s5.id });
  await createText({ x: 24, y: 270, text: "Ghi nhận: Đã dùng thực phẩm", fontSize: 20, fontWeight: 800, fontColor: C.text, parentId: s5.id });
  await createText({ x: 24, y: 298, text: "Món: Sữa tươi Vinamilk • Số lượng hiện có: 1 Hộp (900ml)", fontSize: 13, fontColor: C.subtext, parentId: s5.id });

  // Stepper / Amount Input
  await createText({ x: 24, y: 340, text: "SỐ LƯỢNG ĐÃ DÙNG (ml)", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s5.id });
  await createFrame({ x: 24, y: 358, width: 342, height: 64, fillColor: C.bg, strokeColor: C.border, radius: 14, parentId: s5.id });
  
  // Minus button
  await createFrame({ x: 36, y: 370, width: 40, height: 40, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s5.id });
  await createText({ x: 50, y: 378, text: "−", fontSize: 20, fontWeight: 700, fontColor: C.text, parentId: s5.id });

  // Amount display
  await createText({ x: 160, y: 376, text: "300 ml", fontSize: 22, fontWeight: 800, fontColor: C.primary, parentId: s5.id });

  // Plus button
  await createFrame({ x: 314, y: 370, width: 40, height: 40, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s5.id });
  await createText({ x: 326, y: 378, text: "+", fontSize: 20, fontWeight: 700, fontColor: C.text, parentId: s5.id });

  // Quick Action Pill: Dùng hết (S3.33: Không tự submit)
  await createFrame({ x: 24, y: 432, width: 140, height: 32, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 16, parentId: s5.id });
  await createText({ x: 36, y: 440, text: "⚡ Dùng hết 900ml", fontSize: 12, fontWeight: 700, fontColor: C.primary, parentId: s5.id });

  // Reason Input Field
  await createText({ x: 24, y: 484, text: "LÝ DO SỬ DỤNG (TÙY CHỌN)", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s5.id });
  await createFrame({ x: 24, y: 504, width: 342, height: 48, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s5.id });
  await createText({ x: 36, y: 518, text: "Uống ăn sáng cùng ngũ cốc...", fontSize: 13, fontColor: C.text, parentId: s5.id });

  // Balance calculation preview
  await createFrame({ x: 24, y: 568, width: 342, height: 48, fillColor: C.bg, radius: 10, parentId: s5.id });
  await createText({ x: 36, y: 582, text: "Số lượng sau khi trừ:", fontSize: 13, fontColor: C.subtext, parentId: s5.id });
  await createText({ x: 240, y: 582, text: "Còn lại 600 ml", fontSize: 13, fontWeight: 700, fontColor: C.text, parentId: s5.id });

  // Confirm and Cancel buttons
  await createFrame({ x: 24, y: 642, width: 342, height: 50, fillColor: C.primary, radius: 14, parentId: s5.id });
  await createText({ x: 104, y: 658, text: "XÁC NHẬN GHI NHẬN ( -300ml )", fontSize: 14, fontWeight: 700, fontColor: C.white, parentId: s5.id });

  await createFrame({ x: 24, y: 704, width: 342, height: 44, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s5.id });
  await createText({ x: 170, y: 716, text: "Hủy bỏ", fontSize: 13, fontWeight: 600, fontColor: C.subtext, parentId: s5.id });

  // =========================================================================
  // SCREEN 6: WF-05 LỊCH SỬ BIẾN ĐỘNG & THÙNG RÁC (x: 2150, y: 0)
  // =========================================================================
  console.log("Creating Screen 6 (WF-05): History & Trash View with Restore...");
  const s6 = await createFrame({
    x: 2150, y: 0, width: 390, height: 844,
    name: "WF-05: Lịch sử & Thùng rác (History & Trash)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s6.id);

  // Top Title
  await createText({ x: 20, y: 44, text: "NHẬT KÝ & PHỤC HỒI", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s6.id });
  await createText({ x: 20, y: 60, text: "Lịch sử & Thùng rác", fontSize: 24, fontWeight: 800, fontColor: C.text, parentId: s6.id });

  // Main Tabs: Timeline History vs Trash
  await createFrame({ x: 20, y: 102, width: 350, height: 42, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s6.id });
  await createFrame({ x: 196, y: 106, width: 170, height: 34, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 10, parentId: s6.id });
  await createText({ x: 44, y: 114, text: "⏱️ Lịch sử biến động", fontSize: 13, fontWeight: 600, fontColor: C.subtext, parentId: s6.id });
  await createText({ x: 230, y: 114, text: "🗑️ Thùng rác (2)", fontSize: 13, fontWeight: 700, fontColor: C.primary, parentId: s6.id });

  // Trash Info Card
  await createFrame({ x: 20, y: 156, width: 350, height: 56, fillColor: C.blueBg, strokeColor: C.blueBorder, radius: 12, parentId: s6.id });
  await createText({ x: 34, y: 166, text: "ℹ️  Món trong Thùng rác có thể khôi phục lại kho.", fontSize: 12, fontWeight: 700, fontColor: C.blueText, parentId: s6.id });
  await createText({ x: 34, y: 184, text: "Dữ liệu xóa nhầm không bị tính là đã dùng hoặc bỏ lãng phí.", fontSize: 11, fontColor: C.text, parentId: s6.id });

  // Trash Card 1
  await createFrame({ x: 20, y: 224, width: 350, height: 104, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s6.id });
  await createText({ x: 36, y: 238, text: "Bánh mì sandwich bơ", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s6.id });
  await createText({ x: 36, y: 260, text: "Số lượng khi xóa: 1 Túi (6 lát) • Ngăn mát", fontSize: 12, fontColor: C.subtext, parentId: s6.id });
  await createText({ x: 36, y: 280, text: "Đã chuyển vào thùng rác ngày 12/10/2026", fontSize: 11, fontColor: C.muted, parentId: s6.id });
  // Restore Button
  await createFrame({ x: 254, y: 242, width: 100, height: 34, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 10, parentId: s6.id });
  await createText({ x: 264, y: 251, text: "🔄 Khôi phục", fontSize: 12, fontWeight: 700, fontColor: C.primary, parentId: s6.id });

  // Trash Card 2
  await createFrame({ x: 20, y: 340, width: 350, height: 104, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s6.id });
  await createText({ x: 36, y: 354, text: "Súp gà ngô non", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s6.id });
  await createText({ x: 36, y: 376, text: "Số lượng khi xóa: 2 Hộp • Ngăn đông", fontSize: 12, fontColor: C.subtext, parentId: s6.id });
  await createText({ x: 36, y: 396, text: "Đã chuyển vào thùng rác ngày 09/10/2026", fontSize: 11, fontColor: C.muted, parentId: s6.id });
  // Restore Button
  await createFrame({ x: 254, y: 358, width: 100, height: 34, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 10, parentId: s6.id });
  await createText({ x: 264, y: 367, text: "🔄 Khôi phục", fontSize: 12, fontWeight: 700, fontColor: C.primary, parentId: s6.id });

  // Timeline Movement History Preview Section
  await createText({ x: 24, y: 464, text: "NHẬT KÝ BIẾN ĐỘNG GẦN ĐÂY (AUDIT LOG)", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s6.id });

  await createFrame({ x: 20, y: 486, width: 350, height: 76, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s6.id });
  await createText({ x: 36, y: 498, text: "Sữa tươi Vinamilk • Đã dùng −300 ml", fontSize: 13, fontWeight: 700, fontColor: C.text, parentId: s6.id });
  await createText({ x: 36, y: 518, text: "Hôm nay 08:30 • Còn 600 ml • Lý do: Bữa sáng", fontSize: 11, fontColor: C.subtext, parentId: s6.id });
  await createFrame({ x: 284, y: 498, width: 72, height: 24, fillColor: C.primaryLight, radius: 6, parentId: s6.id });
  await createText({ x: 294, y: 503, text: "Consume", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s6.id });

  await createFrame({ x: 20, y: 572, width: 350, height: 76, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s6.id });
  await createText({ x: 36, y: 584, text: "Phô mai Cheddar • Đã bỏ −1 Lát", fontSize: 13, fontWeight: 700, fontColor: C.redText, parentId: s6.id });
  await createText({ x: 36, y: 604, text: "Hôm qua 19:15 • Còn 4 lát • Lý do: Mốc cạnh", fontSize: 11, fontColor: C.subtext, parentId: s6.id });
  await createFrame({ x: 292, y: 584, width: 64, height: 24, fillColor: C.redBg, radius: 6, parentId: s6.id });
  await createText({ x: 304, y: 589, text: "Discard", fontSize: 11, fontWeight: 700, fontColor: C.redText, parentId: s6.id });

  await addBottomNav(s6.id, "history");

  // =========================================================================
  // SCREEN 7: WF-06 CÀI ĐẶT HỆ THỐNG & QUẢN TRỊ DỮ LIỆU (x: 2580, y: 0)
  // =========================================================================
  console.log("Creating Screen 7 (WF-06): Settings & Preferences...");
  const s7 = await createFrame({
    x: 2580, y: 0, width: 390, height: 844,
    name: "WF-06: Cài đặt hệ thống (Settings)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s7.id);

  // Title
  await createText({ x: 20, y: 44, text: "CẤU HÌNH & TÙY CHỌN", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s7.id });
  await createText({ x: 20, y: 60, text: "Cài đặt hệ thống", fontSize: 24, fontWeight: 800, fontColor: C.text, parentId: s7.id });

  // Section 1: Notification & Timezone
  await createText({ x: 24, y: 104, text: "CẤU HÌNH CẢNH BÁO HẠN DÙNG", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s7.id });
  await createFrame({ x: 20, y: 122, width: 350, height: 146, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s7.id });
  
  await createText({ x: 36, y: 138, text: "Múi giờ người dùng", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s7.id });
  await createText({ x: 200, y: 138, text: "Asia/Ho_Chi_Minh ▾", fontSize: 13, fontColor: C.primary, parentId: s7.id });
  await createRect({ x: 36, y: 166, width: 318, height: 1, fillColor: C.borderLight, parentId: s7.id });

  await createText({ x: 36, y: 180, text: "Số ngày cảnh báo trước", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s7.id });
  await createText({ x: 290, y: 180, text: "2 ngày ▾", fontSize: 13, fontWeight: 700, fontColor: C.primary, parentId: s7.id });
  await createText({ x: 36, y: 202, text: "Nhóm 'Sắp tới' (Soon) sẽ tính các món có hạn trong 2 ngày.", fontSize: 11, fontColor: C.muted, parentId: s7.id });
  
  await createFrame({ x: 36, y: 226, width: 318, height: 30, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 8, parentId: s7.id });
  await createText({ x: 120, y: 233, text: "Lưu cấu hình cảnh báo", fontSize: 12, fontWeight: 700, fontColor: C.primary, parentId: s7.id });

  // Section 2: Data Management
  await createText({ x: 24, y: 288, text: "QUẢN TRỊ DỮ LIỆU & BÁO CÁO", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s7.id });
  await createFrame({ x: 20, y: 306, width: 350, height: 110, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s7.id });
  
  await createText({ x: 36, y: 324, text: "📥  Xuất toàn bộ kho ra file CSV", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s7.id });
  await createText({ x: 36, y: 344, text: "Tải file bảng tính Excel để lưu trữ hoặc phân tích.", fontSize: 11, fontColor: C.subtext, parentId: s7.id });
  await createRect({ x: 36, y: 366, width: 318, height: 1, fillColor: C.borderLight, parentId: s7.id });

  await createText({ x: 36, y: 380, text: "🔄  Đặt lại dữ liệu mẫu (Reset Demo data)", fontSize: 13, fontWeight: 600, fontColor: C.redText, parentId: s7.id });

  // Section 3: Account & Session
  await createText({ x: 24, y: 436, text: "TÀI KHOẢN & BẢO MẬT", fontSize: 11, fontWeight: 700, fontColor: C.muted, parentId: s7.id });
  await createFrame({ x: 20, y: 454, width: 350, height: 154, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s7.id });

  await createText({ x: 36, y: 470, text: "Email đăng nhập:", fontSize: 13, fontColor: C.subtext, parentId: s7.id });
  await createText({ x: 170, y: 470, text: "nguyen.van.a@example.com", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s7.id });
  await createRect({ x: 36, y: 494, width: 318, height: 1, fillColor: C.borderLight, parentId: s7.id });

  await createText({ x: 36, y: 508, text: "🔑  Đổi mật khẩu tài khoản", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s7.id });
  await createText({ x: 334, y: 508, text: "›", fontSize: 16, fontColor: C.muted, parentId: s7.id });
  await createRect({ x: 36, y: 534, width: 318, height: 1, fillColor: C.borderLight, parentId: s7.id });

  await createText({ x: 36, y: 554, text: "🚪  Đăng xuất khỏi thiết bị này", fontSize: 13, fontWeight: 700, fontColor: C.redText, parentId: s7.id });

  await addBottomNav(s7.id, "settings");

  // Selection
  const allScreenIds = [s1.id, s2.id, s3.id, s4.id, s5.id, s6.id, s7.id];
  console.log("Selecting all 7 screens in Figma:", allScreenIds);
  await sendCmd("set_selections", { nodeIds: allScreenIds });

  console.log("🎉 ALL 7 SCREENS CREATED AND SELECTED IN FIGMA SUCCESSFULLY!");
  process.exit(0);
});

ws.on("error", (err) => {
  console.error("WebSocket connection error:", err.message);
  process.exit(1);
});
