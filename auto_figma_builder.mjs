import WebSocket from "ws";
import fs from "fs";

const LOG_FILE = "/home/pro/.gemini/antigravity-ide/brain/db551f8d-b678-4eb7-95cd-6f24b3d44cb1/.system_generated/tasks/task-131.log";

// Function to find the latest channel joined by the Figma browser plugin
function getLatestFigmaChannel() {
  if (!fs.existsSync(LOG_FILE)) return null;
  const content = fs.readFileSync(LOG_FILE, "utf-8");
  const matches = [...content.matchAll(/Type:\s*join,\s*Channel:\s*([a-zA-Z0-9]+)/g)];
  if (matches.length === 0) return null;
  return matches[matches.length - 1][1];
}

console.log("Detecting latest Figma channel from socket logs...");
let channel = getLatestFigmaChannel();
console.log("Current latest channel in log:", channel);

let seq = 0;
function sendCmd(ws, command, params, targetChannel, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const id = "cmd-" + (++seq);
    let timer = setTimeout(() => {
      ws.off("message", handler);
      reject(new Error(`Timeout waiting for response to ${command} on channel "${targetChannel}"`));
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
      channel: targetChannel,
      message: { id, command, params: { ...params, commandId: id } }
    }));
  });
}

// Helpers
function createHelpers(ws, targetChannel) {
  return {
    async createFrame(opts) {
      const f = await sendCmd(ws, "create_frame", {
        x: opts.x,
        y: opts.y,
        width: opts.width,
        height: opts.height,
        name: opts.name || "Frame",
        parentId: opts.parentId,
        fillColor: opts.fillColor || { r: 1, g: 1, b: 1, a: 1 },
        strokeColor: opts.strokeColor,
        strokeWeight: opts.strokeWeight || (opts.strokeColor ? 1 : 0),
      }, targetChannel);
      if (opts.radius) {
        await sendCmd(ws, "set_corner_radius", { nodeId: f.id, radius: opts.radius }, targetChannel);
      }
      return f;
    },
    async createText(opts) {
      const t = await sendCmd(ws, "create_text", {
        x: opts.x,
        y: opts.y,
        text: opts.text || "Text",
        fontSize: opts.fontSize || 14,
        fontWeight: opts.fontWeight || 400,
        fontColor: opts.fontColor || { r: 0.06, g: 0.09, b: 0.16, a: 1 },
        name: opts.name || opts.text?.slice(0, 20) || "Text",
        parentId: opts.parentId,
      }, targetChannel);
      if (opts.text) {
        await sendCmd(ws, "set_text_content", { nodeId: t.id, text: opts.text }, targetChannel);
      }
      return t;
    },
    async createRect(opts) {
      const r = await sendCmd(ws, "create_rectangle", {
        x: opts.x,
        y: opts.y,
        width: opts.width,
        height: opts.height,
        name: opts.name || "Rectangle",
        parentId: opts.parentId,
      }, targetChannel);
      if (opts.fillColor) {
        await sendCmd(ws, "set_fill_color", { nodeId: r.id, color: opts.fillColor }, targetChannel);
      }
      if (opts.strokeColor) {
        await sendCmd(ws, "set_stroke_color", { nodeId: r.id, color: opts.strokeColor, weight: opts.strokeWeight || 1 }, targetChannel);
      }
      if (opts.radius) {
        await sendCmd(ws, "set_corner_radius", { nodeId: r.id, radius: opts.radius }, targetChannel);
      }
      return r;
    }
  };
}

const C = {
  bg: { r: 0.97, g: 0.98, b: 0.99, a: 1 },
  white: { r: 1, g: 1, b: 1, a: 1 },
  text: { r: 0.06, g: 0.09, b: 0.16, a: 1 },
  subtext: { r: 0.39, g: 0.45, b: 0.55, a: 1 },
  muted: { r: 0.58, g: 0.64, b: 0.72, a: 1 },
  border: { r: 0.88, g: 0.91, b: 0.94, a: 1 },
  primary: { r: 0.02, g: 0.59, b: 0.41, a: 1 },
  primaryLight: { r: 0.92, g: 0.99, b: 0.96, a: 1 },
  primaryBorder: { r: 0.65, g: 0.95, b: 0.82, a: 1 },
  amberBg: { r: 0.99, g: 0.95, b: 0.78, a: 1 },
  amberBorder: { r: 0.99, g: 0.83, b: 0.30, a: 1 },
  amberText: { r: 0.85, g: 0.47, b: 0.02, a: 1 },
  redBg: { r: 0.99, g: 0.88, b: 0.88, a: 1 },
  redBorder: { r: 0.99, g: 0.70, b: 0.70, a: 1 },
  redText: { r: 0.86, g: 0.15, b: 0.15, a: 1 },
  blueBg: { r: 0.86, g: 0.93, b: 1, a: 1 },
  blueText: { r: 0.15, g: 0.39, b: 0.92, a: 1 },
};

async function executeDesign(ws, targetChannel) {
  const { createFrame, createText, createRect } = createHelpers(ws, targetChannel);

  console.log(`Connecting to channel "${targetChannel}" to build design...`);
  ws.send(JSON.stringify({ type: "join", channel: targetChannel, id: "builder-join" }));
  await new Promise(r => setTimeout(r, 600));

  console.log("Cleaning old canvas frames...");
  try {
    const doc = await sendCmd(ws, "get_document_info", {}, targetChannel);
    for (const c of (doc.children || [])) {
      await sendCmd(ws, "delete_node", { nodeId: c.id }, targetChannel);
    }
  } catch (e) {
    console.log("Notice during clean:", e.message);
  }

  const addStatusBar = (parentId) => Promise.all([
    createText({ x: 28, y: 14, text: "9:41", fontSize: 13, fontWeight: 700, fontColor: C.text, parentId }),
    createText({ x: 310, y: 14, text: "5G  89%", fontSize: 12, fontWeight: 600, fontColor: C.text, parentId })
  ]);

  const addBottomNav = (parentId, activeTab = "kho") => {
    const navY = 765;
    const p = [];
    p.push(createRect({ x: 0, y: navY, width: 390, height: 79, fillColor: C.white, strokeColor: C.border, parentId }));
    
    // Tabs
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

  // -------------------------------------------------------------------------
  // SCREEN 1: WF-01 INVENTORY CÓ DẤU + TO NHẤT Ở ĐẦU
  // -------------------------------------------------------------------------
  console.log("Building Screen 1: Inventory with Giant + Button at top...");
  const s1 = await createFrame({
    x: 0, y: 0, width: 390, height: 844,
    name: "WF-01: Kho thực phẩm (Inventory)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s1.id);

  // Top Title Bar
  await createText({ x: 20, y: 44, text: "EXPIRY MANAGEMENT", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s1.id });
  await createText({ x: 20, y: 60, text: "Kho thực phẩm", fontSize: 24, fontWeight: 800, fontColor: C.text, parentId: s1.id });
  
  // Header circular add
  await createFrame({ x: 276, y: 52, width: 38, height: 38, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 19, parentId: s1.id });
  await createText({ x: 288, y: 56, text: "+", fontSize: 22, fontWeight: 800, fontColor: C.primary, parentId: s1.id });
  // Avatar
  await createFrame({ x: 326, y: 52, width: 38, height: 38, fillColor: C.white, strokeColor: C.border, radius: 19, parentId: s1.id });
  await createText({ x: 334, y: 62, text: "HA", fontSize: 13, fontWeight: 700, fontColor: C.text, parentId: s1.id });

  // ⭐⭐⭐ HERO GIANT ADD BUTTON AT THE VERY TOP ⭐⭐⭐
  await createFrame({
    x: 20, y: 102, width: 350, height: 88,
    name: "Hero Add Card (Dấu + To Nhất)",
    fillColor: C.primary, radius: 22, parentId: s1.id
  });
  // Giant white circle + symbol
  await createFrame({ x: 34, y: 116, width: 60, height: 60, fillColor: C.white, radius: 30, parentId: s1.id });
  await createText({ x: 48, y: 113, text: "+", fontSize: 46, fontWeight: 900, fontColor: C.primary, parentId: s1.id });

  // Main Text
  await createText({ x: 108, y: 122, text: "THÊM THỰC PHẨM MỚI", fontSize: 17, fontWeight: 800, fontColor: C.white, parentId: s1.id });
  await createText({ x: 108, y: 146, text: "Chạm để nhập món • Quét AI OCR bao bì", fontSize: 12, fontWeight: 500, fontColor: C.primaryLight, parentId: s1.id });
  await createText({ x: 340, y: 132, text: "›", fontSize: 26, fontWeight: 600, fontColor: C.white, parentId: s1.id });

  // Attention Alert Banner
  await createFrame({ x: 20, y: 202, width: 350, height: 56, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 14, parentId: s1.id });
  await createText({ x: 34, y: 212, text: "⚠️  2 món cần chú ý gấp", fontSize: 13, fontWeight: 700, fontColor: C.amberText, parentId: s1.id });
  await createText({ x: 34, y: 232, text: "1 món quá hạn • 1 món cận hạn trong 2 ngày", fontSize: 12, fontColor: C.text, parentId: s1.id });

  // Search input
  await createFrame({ x: 20, y: 268, width: 350, height: 40, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s1.id });
  await createText({ x: 34, y: 279, text: "🔍  Tìm kiếm món ăn, vị trí lưu trữ...", fontSize: 13, fontColor: C.muted, parentId: s1.id });

  // Filter Chips
  await createFrame({ x: 20, y: 316, width: 84, height: 30, fillColor: C.text, radius: 15, parentId: s1.id });
  await createText({ x: 32, y: 323, text: "Tất cả (5)", fontSize: 12, fontWeight: 600, fontColor: C.white, parentId: s1.id });
  await createFrame({ x: 110, y: 316, width: 94, height: 30, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 15, parentId: s1.id });
  await createText({ x: 120, y: 323, text: "Cần chú ý (2)", fontSize: 12, fontWeight: 600, fontColor: C.amberText, parentId: s1.id });
  await createFrame({ x: 210, y: 316, width: 90, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: s1.id });
  await createText({ x: 220, y: 323, text: "Ngăn mát (3)", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createFrame({ x: 306, y: 316, width: 64, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: s1.id });
  await createText({ x: 314, y: 323, text: "Đông (1)", fontSize: 12, fontColor: C.subtext, parentId: s1.id });

  // Food Cards
  await createFrame({ x: 20, y: 354, width: 350, height: 92, fillColor: C.white, strokeColor: C.redBorder, radius: 16, parentId: s1.id });
  await createText({ x: 36, y: 366, text: "Phô mai lát Cheddar", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s1.id });
  await createText({ x: 36, y: 388, text: "Còn 4 lát • Ngăn mát tủ lạnh", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createText({ x: 36, y: 410, text: "HSD: 06/10/2026 (Quá hạn 7 ngày)", fontSize: 12, fontWeight: 600, fontColor: C.redText, parentId: s1.id });
  await createFrame({ x: 278, y: 368, width: 76, height: 28, fillColor: C.redBg, strokeColor: C.redBorder, radius: 8, parentId: s1.id });
  await createText({ x: 288, y: 374, text: "Bỏ hỏng", fontSize: 11, fontWeight: 700, fontColor: C.redText, parentId: s1.id });

  await createFrame({ x: 20, y: 454, width: 350, height: 92, fillColor: C.white, strokeColor: C.amberBorder, radius: 16, parentId: s1.id });
  await createText({ x: 36, y: 466, text: "Trứng gà Ba Huân", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s1.id });
  await createText({ x: 36, y: 488, text: "Còn 6 quả • Ngăn mát", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createText({ x: 36, y: 510, text: "HSD: 12/10/2026 (Hôm nay hết hạn!)", fontSize: 12, fontWeight: 600, fontColor: C.amberText, parentId: s1.id });
  await createFrame({ x: 278, y: 468, width: 76, height: 28, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 8, parentId: s1.id });
  await createText({ x: 288, y: 474, text: "Dùng món", fontSize: 11, fontWeight: 700, fontColor: C.amberText, parentId: s1.id });

  await createFrame({ x: 20, y: 554, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s1.id });
  await createText({ x: 36, y: 566, text: "Sữa tươi Dalat Milk 450ml", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s1.id });
  await createText({ x: 36, y: 588, text: "Còn 350 ml • Cánh tủ mát • Đã mở", fontSize: 12, fontColor: C.subtext, parentId: s1.id });
  await createText({ x: 36, y: 610, text: "HSD: 15/10/2026 (Còn 3 ngày)", fontSize: 12, fontWeight: 600, fontColor: C.primary, parentId: s1.id });
  await createFrame({ x: 278, y: 568, width: 76, height: 28, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 8, parentId: s1.id });
  await createText({ x: 288, y: 574, text: "Chi tiết", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s1.id });

  await createFrame({ x: 20, y: 654, width: 350, height: 86, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s1.id });
  await createText({ x: 36, y: 666, text: "Chuối sứ chín", fontSize: 15, fontWeight: 600, fontColor: C.text, parentId: s1.id });
  await createText({ x: 36, y: 688, text: "5 quả • Kệ bếp • HSD ước tính: 18/10", fontSize: 12, fontColor: C.subtext, parentId: s1.id });

  await addBottomNav(s1.id, "kho");

  // -------------------------------------------------------------------------
  // SCREEN 2: WF-02 ENTRY FORM
  // -------------------------------------------------------------------------
  console.log("Building Screen 2: Add Entry Form...");
  const s2 = await createFrame({
    x: 430, y: 0, width: 390, height: 844,
    name: "WF-02: Thêm món mới (Entry Form)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s2.id);

  await createText({ x: 20, y: 52, text: "Hủy", fontSize: 15, fontColor: C.subtext, parentId: s2.id });
  await createText({ x: 135, y: 50, text: "Thêm thực phẩm", fontSize: 17, fontWeight: 700, fontColor: C.text, parentId: s2.id });
  await createText({ x: 335, y: 52, text: "Lưu", fontSize: 15, fontWeight: 700, fontColor: C.primary, parentId: s2.id });

  await createFrame({ x: 20, y: 92, width: 350, height: 46, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 12, parentId: s2.id });
  await createText({ x: 36, y: 106, text: "📸  Quét thông tin nhanh từ bao bì / hóa đơn", fontSize: 13, fontWeight: 600, fontColor: C.primary, parentId: s2.id });

  await createText({ x: 20, y: 154, text: "Tên thực phẩm *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 20, y: 174, width: 350, height: 44, fillColor: C.white, strokeColor: C.primaryBorder, radius: 10, parentId: s2.id });
  await createText({ x: 34, y: 187, text: "Sữa chua Hy Lạp Lucas", fontSize: 14, fontWeight: 500, fontColor: C.text, parentId: s2.id });

  await createText({ x: 20, y: 232, text: "Số lượng ban đầu *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 20, y: 252, width: 165, height: 44, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s2.id });
  await createText({ x: 34, y: 265, text: "4", fontSize: 15, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 205, y: 252, width: 165, height: 44, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s2.id });
  await createText({ x: 220, y: 265, text: "Hộp  ▾", fontSize: 14, fontColor: C.text, parentId: s2.id });

  await createText({ x: 20, y: 310, text: "Vị trí lưu trữ *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 20, y: 330, width: 88, height: 32, fillColor: C.primary, radius: 16, parentId: s2.id });
  await createText({ x: 30, y: 338, text: "Ngăn mát", fontSize: 12, fontWeight: 600, fontColor: C.white, parentId: s2.id });
  await createFrame({ x: 116, y: 330, width: 92, height: 32, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s2.id });
  await createText({ x: 126, y: 338, text: "Ngăn đông", fontSize: 12, fontColor: C.subtext, parentId: s2.id });
  await createFrame({ x: 216, y: 330, width: 80, height: 32, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s2.id });
  await createText({ x: 226, y: 338, text: "Kệ bếp", fontSize: 12, fontColor: C.subtext, parentId: s2.id });
  await createFrame({ x: 304, y: 330, width: 66, height: 32, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s2.id });
  await createText({ x: 314, y: 338, text: "Tủ khô", fontSize: 12, fontColor: C.subtext, parentId: s2.id });

  await createText({ x: 20, y: 380, text: "Hạn sử dụng theo dõi *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 20, y: 400, width: 350, height: 110, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s2.id });
  await createText({ x: 34, y: 414, text: "📅  18 / 10 / 2026", fontSize: 15, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createText({ x: 34, y: 446, text: "Độ tin cậy của ngày:", fontSize: 12, fontColor: C.subtext, parentId: s2.id });
  await createFrame({ x: 34, y: 468, width: 140, height: 28, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 8, parentId: s2.id });
  await createText({ x: 42, y: 474, text: "✓ In trên bao bì (HSD)", fontSize: 11, fontWeight: 600, fontColor: C.primary, parentId: s2.id });
  await createFrame({ x: 182, y: 468, width: 100, height: 28, fillColor: C.bg, radius: 8, parentId: s2.id });
  await createText({ x: 190, y: 474, text: "Tự ước tính", fontSize: 11, fontColor: C.subtext, parentId: s2.id });

  await createText({ x: 20, y: 526, text: "Ngày mở nắp (Tùy chọn)", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 20, y: 546, width: 350, height: 42, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s2.id });
  await createText({ x: 34, y: 558, text: "Hôm nay (13/10/2026)", fontSize: 14, fontColor: C.text, parentId: s2.id });

  await createText({ x: 20, y: 602, text: "Ghi chú bổ sung", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s2.id });
  await createFrame({ x: 20, y: 622, width: 350, height: 60, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s2.id });
  await createText({ x: 34, y: 636, text: "Mua lốc 4 hộp tại Co.opMart...", fontSize: 13, fontColor: C.muted, parentId: s2.id });

  await createFrame({ x: 20, y: 720, width: 350, height: 50, fillColor: C.primary, radius: 14, parentId: s2.id });
  await createText({ x: 125, y: 735, text: "Lưu vào kho thực phẩm", fontSize: 15, fontWeight: 700, fontColor: C.white, parentId: s2.id });

  // -------------------------------------------------------------------------
  // SCREEN 3: WF-03 DETAIL VIEW
  // -------------------------------------------------------------------------
  console.log("Building Screen 3: Detail View...");
  const s3 = await createFrame({
    x: 860, y: 0, width: 390, height: 844,
    name: "WF-03: Chi tiết món (Food Detail)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s3.id);

  await createText({ x: 20, y: 52, text: "‹ Quay lại", fontSize: 15, fontWeight: 600, fontColor: C.primary, parentId: s3.id });
  await createText({ x: 150, y: 50, text: "Chi tiết món", fontSize: 17, fontWeight: 700, fontColor: C.text, parentId: s3.id });
  await createText({ x: 330, y: 52, text: "Sửa", fontSize: 15, fontWeight: 600, fontColor: C.primary, parentId: s3.id });

  await createText({ x: 20, y: 92, text: "Sữa tươi Dalat Milk 450ml", fontSize: 22, fontWeight: 700, fontColor: C.text, parentId: s3.id });
  await createText({ x: 20, y: 120, text: "📍 Vị trí: Cánh tủ mát • Nhập kho 12/10", fontSize: 13, fontColor: C.subtext, parentId: s3.id });

  await createFrame({ x: 20, y: 150, width: 350, height: 68, fillColor: C.amberBg, strokeColor: C.amberBorder, radius: 14, parentId: s3.id });
  await createText({ x: 36, y: 162, text: "⚠️  CẬN HẠN: Cần dùng trong 2 ngày", fontSize: 14, fontWeight: 700, fontColor: C.amberText, parentId: s3.id });
  await createText({ x: 36, y: 184, text: "Hạn sử dụng: 15/10/2026 (Nguồn OCR bao bì)", fontSize: 12, fontColor: C.text, parentId: s3.id });

  await createFrame({ x: 20, y: 232, width: 168, height: 74, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s3.id });
  await createText({ x: 34, y: 244, text: "Lượng còn lại", fontSize: 12, fontColor: C.subtext, parentId: s3.id });
  await createText({ x: 34, y: 266, text: "350 ml", fontSize: 18, fontWeight: 700, fontColor: C.text, parentId: s3.id });

  await createFrame({ x: 202, y: 232, width: 168, height: 74, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s3.id });
  await createText({ x: 216, y: 244, text: "Lượng ban đầu", fontSize: 12, fontColor: C.subtext, parentId: s3.id });
  await createText({ x: 216, y: 266, text: "450 ml", fontSize: 18, fontWeight: 600, fontColor: C.subtext, parentId: s3.id });

  await createFrame({ x: 20, y: 318, width: 168, height: 74, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s3.id });
  await createText({ x: 34, y: 330, text: "Ngày mở nắp", fontSize: 12, fontColor: C.subtext, parentId: s3.id });
  await createText({ x: 34, y: 352, text: "13/10/2026", fontSize: 15, fontWeight: 600, fontColor: C.text, parentId: s3.id });

  await createFrame({ x: 202, y: 318, width: 168, height: 74, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s3.id });
  await createText({ x: 216, y: 330, text: "Độ tin cậy HSD", fontSize: 12, fontColor: C.subtext, parentId: s3.id });
  await createText({ x: 216, y: 352, text: "Chính xác (OCR)", fontSize: 15, fontWeight: 600, fontColor: C.primary, parentId: s3.id });

  await createText({ x: 20, y: 410, text: "THAO TÁC VỚI THỰC PHẨM", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: s3.id });

  await createFrame({ x: 20, y: 432, width: 350, height: 48, fillColor: C.primary, radius: 12, parentId: s3.id });
  await createText({ x: 125, y: 446, text: "Dùng một phần (-ml)", fontSize: 15, fontWeight: 700, fontColor: C.white, parentId: s3.id });

  await createFrame({ x: 20, y: 490, width: 350, height: 46, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s3.id });
  await createText({ x: 130, y: 504, text: "Ghi nhận dùng hết", fontSize: 14, fontWeight: 600, fontColor: C.text, parentId: s3.id });

  await createFrame({ x: 20, y: 546, width: 350, height: 46, fillColor: C.redBg, strokeColor: C.redBorder, radius: 12, parentId: s3.id });
  await createText({ x: 120, y: 560, text: "Bỏ món (Hỏng / Quá hạn)", fontSize: 14, fontWeight: 600, fontColor: C.redText, parentId: s3.id });

  await createText({ x: 20, y: 614, text: "NHẬT KÝ BIẾN ĐỘNG GẦN ĐÂY", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: s3.id });
  await createFrame({ x: 20, y: 634, width: 350, height: 110, fillColor: C.white, strokeColor: C.border, radius: 12, parentId: s3.id });
  await createText({ x: 34, y: 648, text: "• 13/10 08:30: Dùng 100ml (Pha cà phê sáng)", fontSize: 13, fontColor: C.text, parentId: s3.id });
  await createText({ x: 44, y: 668, text: "Còn lại: 350 ml (Phiên bản 2)", fontSize: 11, fontColor: C.subtext, parentId: s3.id });
  await createText({ x: 34, y: 692, text: "• 12/10 14:00: Nhập kho mới (+450ml)", fontSize: 13, fontColor: C.text, parentId: s3.id });

  // -------------------------------------------------------------------------
  // SCREEN 4: WF-04 ACTION SHEET
  // -------------------------------------------------------------------------
  console.log("Building Screen 4: Movement Action Sheet...");
  const s4 = await createFrame({
    x: 1290, y: 0, width: 390, height: 844,
    name: "WF-04: Thao tác kho (Stock Action Sheet)",
    fillColor: { r: 0.15, g: 0.20, b: 0.27, a: 1 }, radius: 40
  });
  await addStatusBar(s4.id);

  await createText({ x: 20, y: 90, text: "‹ Quay lại", fontSize: 15, fontColor: C.subtext, parentId: s4.id });
  await createText({ x: 20, y: 130, text: "Sữa tươi Dalat Milk 450ml", fontSize: 22, fontWeight: 700, fontColor: { r: 0.5, g: 0.6, b: 0.7, a: 1 }, parentId: s4.id });

  await createFrame({
    x: 0, y: 260, width: 390, height: 584,
    name: "Action Bottom Sheet",
    fillColor: C.white, radius: 28, parentId: s4.id
  });
  await createRect({ x: 175, y: 274, width: 40, height: 4, fillColor: C.border, radius: 2, parentId: s4.id });

  await createText({ x: 24, y: 298, text: "Ghi nhận sử dụng món", fontSize: 19, fontWeight: 700, fontColor: C.text, parentId: s4.id });
  await createText({ x: 24, y: 324, text: "Món: Sữa tươi Dalat Milk • Hiện còn: 350 ml", fontSize: 13, fontColor: C.subtext, parentId: s4.id });

  await createFrame({ x: 24, y: 356, width: 166, height: 38, fillColor: C.primary, radius: 10, parentId: s4.id });
  await createText({ x: 50, y: 366, text: "Dùng thực phẩm", fontSize: 13, fontWeight: 700, fontColor: C.white, parentId: s4.id });
  await createFrame({ x: 200, y: 356, width: 166, height: 38, fillColor: C.bg, radius: 10, parentId: s4.id });
  await createText({ x: 240, y: 366, text: "Bỏ do hỏng", fontSize: 13, fontColor: C.subtext, parentId: s4.id });

  await createText({ x: 24, y: 418, text: "Số lượng sử dụng (ml) *", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s4.id });
  await createFrame({ x: 24, y: 440, width: 342, height: 60, fillColor: C.bg, strokeColor: C.border, radius: 14, parentId: s4.id });
  await createFrame({ x: 36, y: 450, width: 40, height: 40, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s4.id });
  await createText({ x: 50, y: 460, text: "-", fontSize: 20, fontWeight: 700, fontColor: C.text, parentId: s4.id });
  await createText({ x: 145, y: 456, text: "100  ml", fontSize: 22, fontWeight: 700, fontColor: C.text, parentId: s4.id });
  await createFrame({ x: 314, y: 450, width: 40, height: 40, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s4.id });
  await createText({ x: 328, y: 460, text: "+", fontSize: 20, fontWeight: 700, fontColor: C.text, parentId: s4.id });

  await createFrame({ x: 24, y: 512, width: 70, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: s4.id });
  await createText({ x: 38, y: 519, text: "50 ml", fontSize: 12, fontColor: C.text, parentId: s4.id });
  await createFrame({ x: 102, y: 512, width: 78, height: 30, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 15, parentId: s4.id });
  await createText({ x: 114, y: 519, text: "100 ml ✓", fontSize: 12, fontWeight: 600, fontColor: C.primary, parentId: s4.id });
  await createFrame({ x: 188, y: 512, width: 70, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: s4.id });
  await createText({ x: 202, y: 519, text: "200 ml", fontSize: 12, fontColor: C.text, parentId: s4.id });
  await createFrame({ x: 266, y: 512, width: 100, height: 30, fillColor: C.white, strokeColor: C.border, radius: 15, parentId: s4.id });
  await createText({ x: 274, y: 519, text: "Hết (350ml)", fontSize: 12, fontColor: C.text, parentId: s4.id });

  await createText({ x: 24, y: 560, text: "Lý do / Mục đích sử dụng", fontSize: 13, fontWeight: 600, fontColor: C.text, parentId: s4.id });
  await createFrame({ x: 24, y: 582, width: 342, height: 44, fillColor: C.white, strokeColor: C.border, radius: 10, parentId: s4.id });
  await createText({ x: 38, y: 595, text: "Pha cà phê sáng", fontSize: 14, fontColor: C.text, parentId: s4.id });

  await createFrame({ x: 24, y: 642, width: 342, height: 42, fillColor: C.primaryLight, radius: 10, parentId: s4.id });
  await createText({ x: 38, y: 654, text: "✓ Sau khi trừ: Kho còn 250 ml (Đủ cho 2 ngày tới)", fontSize: 12, fontWeight: 600, fontColor: C.primary, parentId: s4.id });

  await createFrame({ x: 24, y: 702, width: 342, height: 50, fillColor: C.primary, radius: 14, parentId: s4.id });
  await createText({ x: 110, y: 717, text: "Xác nhận trừ kho (100ml)", fontSize: 15, fontWeight: 700, fontColor: C.white, parentId: s4.id });

  await createText({ x: 175, y: 764, text: "Hủy bỏ", fontSize: 14, fontWeight: 500, fontColor: C.subtext, parentId: s4.id });

  // -------------------------------------------------------------------------
  // SCREEN 5: WF-05 AUDIT LOG / HISTORY
  // -------------------------------------------------------------------------
  console.log("Building Screen 5: History / Audit Log...");
  const s5 = await createFrame({
    x: 1720, y: 0, width: 390, height: 844,
    name: "WF-05: Lịch sử biến động (Audit Log)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s5.id);

  await createText({ x: 24, y: 46, text: "NHẬT KÝ KHO HÀNG", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s5.id });
  await createText({ x: 24, y: 64, text: "Lịch sử biến động", fontSize: 24, fontWeight: 700, fontColor: C.text, parentId: s5.id });

  await createFrame({ x: 20, y: 104, width: 350, height: 72, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s5.id });
  await createText({ x: 42, y: 118, text: "Đã dùng", fontSize: 11, fontColor: C.subtext, parentId: s5.id });
  await createText({ x: 46, y: 136, text: "8 lần", fontSize: 17, fontWeight: 700, fontColor: C.primary, parentId: s5.id });
  await createText({ x: 160, y: 118, text: "Nhập mới", fontSize: 11, fontColor: C.subtext, parentId: s5.id });
  await createText({ x: 165, y: 136, text: "3 món", fontSize: 17, fontWeight: 700, fontColor: C.blueText, parentId: s5.id });
  await createText({ x: 280, y: 118, text: "Hủy hỏng", fontSize: 11, fontColor: C.subtext, parentId: s5.id });
  await createText({ x: 288, y: 136, text: "1 món", fontSize: 17, fontWeight: 700, fontColor: C.redText, parentId: s5.id });

  await createFrame({ x: 20, y: 192, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s5.id });
  await createFrame({ x: 34, y: 206, width: 50, height: 24, fillColor: C.primaryLight, radius: 6, parentId: s5.id });
  await createText({ x: 40, y: 211, text: "DÙNG", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s5.id });
  await createText({ x: 92, y: 210, text: "Sữa tươi Dalat Milk (-100ml)", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s5.id });
  await createText({ x: 34, y: 238, text: "Lượng: 450ml → 350ml • Lý do: Pha cà phê", fontSize: 12, fontColor: C.subtext, parentId: s5.id });
  await createText({ x: 34, y: 256, text: "🕒 13/10/2026 - 08:30 sáng", fontSize: 11, fontColor: C.muted, parentId: s5.id });

  await createFrame({ x: 20, y: 298, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s5.id });
  await createFrame({ x: 34, y: 312, width: 56, height: 24, fillColor: C.redBg, radius: 6, parentId: s5.id });
  await createText({ x: 40, y: 317, text: "BỎ HỎNG", fontSize: 10, fontWeight: 700, fontColor: C.redText, parentId: s5.id });
  await createText({ x: 98, y: 316, text: "Phô mai lát Cheddar (-2)", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s5.id });
  await createText({ x: 34, y: 344, text: "Lượng: 6 → 4 lát • Lý do: Quá hạn mốc", fontSize: 12, fontColor: C.subtext, parentId: s5.id });
  await createText({ x: 34, y: 362, text: "🕒 12/10/2026 - 18:00", fontSize: 11, fontColor: C.muted, parentId: s5.id });

  await createFrame({ x: 20, y: 404, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s5.id });
  await createFrame({ x: 34, y: 418, width: 62, height: 24, fillColor: C.blueBg, radius: 6, parentId: s5.id });
  await createText({ x: 40, y: 423, text: "NHẬP KHO", fontSize: 10, fontWeight: 700, fontColor: C.blueText, parentId: s5.id });
  await createText({ x: 104, y: 422, text: "Sữa tươi Dalat Milk (+450ml)", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s5.id });
  await createText({ x: 34, y: 450, text: "Khởi tạo mới • Vị trí: Cánh tủ mát", fontSize: 12, fontColor: C.subtext, parentId: s5.id });
  await createText({ x: 34, y: 468, text: "🕒 12/10/2026 - 14:00", fontSize: 11, fontColor: C.muted, parentId: s5.id });

  await createFrame({ x: 20, y: 510, width: 350, height: 92, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s5.id });
  await createFrame({ x: 34, y: 524, width: 60, height: 24, fillColor: C.amberBg, radius: 6, parentId: s5.id });
  await createText({ x: 40, y: 529, text: "KIỂM KÊ", fontSize: 11, fontWeight: 700, fontColor: C.amberText, parentId: s5.id });
  await createText({ x: 102, y: 528, text: "Trứng gà Ba Huân (+2)", fontSize: 15, fontWeight: 700, fontColor: C.text, parentId: s5.id });
  await createText({ x: 34, y: 556, text: "Điều chỉnh thực tế: 4 → 6 quả", fontSize: 12, fontColor: C.subtext, parentId: s5.id });
  await createText({ x: 34, y: 574, text: "🕒 10/10/2026 - 09:15", fontSize: 11, fontColor: C.muted, parentId: s5.id });

  await addBottomNav(s5.id, "history");

  // -------------------------------------------------------------------------
  // SCREEN 6: WF-06 SETTINGS
  // -------------------------------------------------------------------------
  console.log("Building Screen 6: Settings...");
  const s6 = await createFrame({
    x: 2150, y: 0, width: 390, height: 844,
    name: "WF-06: Cài đặt hệ thống (Settings)",
    fillColor: C.bg, radius: 40
  });
  await addStatusBar(s6.id);

  await createText({ x: 24, y: 46, text: "TÙY CHỈNH HỆ THỐNG", fontSize: 11, fontWeight: 700, fontColor: C.primary, parentId: s6.id });
  await createText({ x: 24, y: 64, text: "Cài đặt", fontSize: 24, fontWeight: 700, fontColor: C.text, parentId: s6.id });

  await createFrame({ x: 20, y: 104, width: 350, height: 76, fillColor: C.white, strokeColor: C.border, radius: 16, parentId: s6.id });
  await createFrame({ x: 36, y: 120, width: 44, height: 44, fillColor: C.primaryLight, strokeColor: C.primaryBorder, radius: 22, parentId: s6.id });
  await createText({ x: 47, y: 133, text: "HA", fontSize: 16, fontWeight: 700, fontColor: C.primary, parentId: s6.id });
  await createText({ x: 92, y: 122, text: "Phạm Hoàng An", fontSize: 16, fontWeight: 700, fontColor: C.text, parentId: s6.id });
  await createText({ x: 92, y: 144, text: "Múi giờ: Asia/Ho_Chi_Minh (+07:00)", fontSize: 12, fontColor: C.subtext, parentId: s6.id });

  await createText({ x: 24, y: 198, text: "CẢNH BÁO HẠN SỬ DỤNG", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: s6.id });
  await createFrame({ x: 20, y: 218, width: 350, height: 140, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s6.id });
  await createText({ x: 36, y: 234, text: "Báo trước hạn (Lead days)", fontSize: 14, fontWeight: 500, fontColor: C.text, parentId: s6.id });
  await createText({ x: 295, y: 234, text: "2 ngày ▾", fontSize: 14, fontWeight: 600, fontColor: C.primary, parentId: s6.id });
  await createRect({ x: 36, y: 264, width: 318, height: 1, fillColor: C.border, parentId: s6.id });

  await createText({ x: 36, y: 280, text: "Khung giờ thông báo", fontSize: 14, fontWeight: 500, fontColor: C.text, parentId: s6.id });
  await createText({ x: 295, y: 280, text: "08:00 sáng", fontSize: 14, fontColor: C.subtext, parentId: s6.id });
  await createRect({ x: 36, y: 310, width: 318, height: 1, fillColor: C.border, parentId: s6.id });

  await createText({ x: 36, y: 326, text: "Thông báo đẩy thiết bị", fontSize: 14, fontWeight: 500, fontColor: C.text, parentId: s6.id });
  await createFrame({ x: 300, y: 322, width: 44, height: 24, fillColor: C.primary, radius: 12, parentId: s6.id });
  await createFrame({ x: 322, y: 324, width: 20, height: 20, fillColor: C.white, radius: 10, parentId: s6.id });

  await createText({ x: 24, y: 376, text: "VỊ TRÍ LƯU TRỮ TRONG KHO", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: s6.id });
  await createFrame({ x: 20, y: 396, width: 350, height: 124, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s6.id });
  await createText({ x: 36, y: 412, text: "❄️ Ngăn mát tủ lạnh", fontSize: 14, fontColor: C.text, parentId: s6.id });
  await createText({ x: 310, y: 412, text: "3 món", fontSize: 13, fontColor: C.subtext, parentId: s6.id });
  await createRect({ x: 36, y: 436, width: 318, height: 1, fillColor: C.border, parentId: s6.id });
  await createText({ x: 36, y: 450, text: "🧊 Ngăn đông", fontSize: 14, fontColor: C.text, parentId: s6.id });
  await createText({ x: 310, y: 450, text: "1 món", fontSize: 13, fontColor: C.subtext, parentId: s6.id });
  await createRect({ x: 36, y: 474, width: 318, height: 1, fillColor: C.border, parentId: s6.id });
  await createText({ x: 36, y: 488, text: "🥫 Kệ bếp / Tủ khô", fontSize: 14, fontColor: C.text, parentId: s6.id });
  await createText({ x: 310, y: 488, text: "1 món", fontSize: 13, fontColor: C.subtext, parentId: s6.id });

  await createText({ x: 24, y: 538, text: "QUẢN TRỊ DỮ LIỆU", fontSize: 12, fontWeight: 700, fontColor: C.muted, parentId: s6.id });
  await createFrame({ x: 20, y: 558, width: 350, height: 96, fillColor: C.white, strokeColor: C.border, radius: 14, parentId: s6.id });
  await createText({ x: 36, y: 574, text: "📥 Xuất dữ liệu kho (CSV)", fontSize: 14, fontWeight: 600, fontColor: C.primary, parentId: s6.id });
  await createRect({ x: 36, y: 602, width: 318, height: 1, fillColor: C.border, parentId: s6.id });
  await createText({ x: 36, y: 618, text: "🔄 Đặt lại dữ liệu mẫu (Demo reset)", fontSize: 14, fontWeight: 500, fontColor: C.redText, parentId: s6.id });

  await addBottomNav(s6.id, "settings");

  const screenIds = [s1.id, s2.id, s3.id, s4.id, s5.id, s6.id];
  console.log("Focusing all screens in Figma:", screenIds);
  await sendCmd(ws, "set_selections", { nodeIds: screenIds }, targetChannel);
  console.log("🎉 ALL 6 SCREENS COMPLETED AND SELECTED IN FIGMA!");
}

// Socket listener
const ws = new WebSocket("ws://localhost:3055");
ws.on("open", async () => {
  console.log("Connected to local socket server at ws://localhost:3055");
  
  // Try connecting with latest known channel
  if (channel) {
    try {
      console.log(`Checking if Figma plugin is alive on channel "${channel}"...`);
      ws.send(JSON.stringify({ type: "join", channel, id: "probe-join" }));
      await new Promise(r => setTimeout(r, 500));
      await sendCmd(ws, "get_document_info", {}, channel, 3500);
      console.log(`✓ Channel "${channel}" is ACTIVE! Starting design build...`);
      await executeDesign(ws, channel);
      process.exit(0);
    } catch (e) {
      console.log(`Channel "${channel}" is not active (${e.message}). Listening for plugin...`);
    }
  }

  // Watch socket log for new connection
  console.log("Watching for Figma plugin connection in logs...");
  let lastSize = fs.existsSync(LOG_FILE) ? fs.statSync(LOG_FILE).size : 0;
  let isExecuting = false;
  
  const interval = setInterval(async () => {
    if (isExecuting || !fs.existsSync(LOG_FILE)) return;
    const currentSize = fs.statSync(LOG_FILE).size;
    if (currentSize > lastSize) {
      const newContent = fs.readFileSync(LOG_FILE, "utf-8").slice(lastSize);
      lastSize = currentSize;
      
      const matches = [...newContent.matchAll(/Type:\s*join,\s*Channel:\s*([a-zA-Z0-9]+)/g)];
      for (const m of matches) {
        const detectedChannel = m[1];
        // Ignore internal joins
        if (newContent.includes('"id": "builder-join"') || newContent.includes('"id": "probe-join"')) {
          continue;
        }
        console.log(`⚡ Detected Figma plugin joined channel: "${detectedChannel}"! Starting build...`);
        isExecuting = true;
        clearInterval(interval);
        try {
          await executeDesign(ws, detectedChannel);
          process.exit(0);
        } catch (err) {
          console.error("Execution error:", err);
          process.exit(1);
        }
      }
    }
  }, 800);

  setTimeout(() => {
    console.log("Timeout waiting for active Figma plugin connection (120s).");
    clearInterval(interval);
    process.exit(1);
  }, 120000);
});
