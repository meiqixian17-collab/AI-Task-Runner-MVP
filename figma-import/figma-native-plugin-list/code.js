const TOKENS = {
  primary: "#6157D8",
  background: "#F6F4FC",
  card: "#FFFFFF",
  text: "#111827",
  textSecondary: "#5F6F8A",
  border: "#DEDCF0",
  success: "#12A37F",
  successBg: "#E8F8F1",
  warning: "#D97706",
  error: "#B42318",
  importantBg: "#FFFAF0",
  importantBorder: "#F4D37A",
  scrim: "#0F172A",
  white: "#FFFFFF"
};

let FONT = null;

function rgb(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255
  };
}

function solid(hex, opacity) {
  const paint = { type: "SOLID", color: rgb(hex) };
  if (opacity !== undefined) {
    paint.opacity = opacity;
  }
  return [paint];
}

function radius(value, width, height) {
  return Math.min(value || 0, width / 2, height / 2);
}

async function loadFont() {
  const fonts = await figma.listAvailableFontsAsync();
  const preferred =
    fonts.find((font) => font.fontName.family === "Microsoft YaHei" && font.fontName.style === "Regular") ||
    fonts.find((font) => font.fontName.family === "Inter" && font.fontName.style === "Regular") ||
    fonts.find((font) => font.fontName.style === "Regular") ||
    fonts[0];

  if (!preferred) {
    throw new Error("No available fonts.");
  }

  FONT = preferred.fontName;
  await figma.loadFontAsync(FONT);
}

function frame(parent, name, x, y, width, height, fill, stroke, corner) {
  const node = figma.createFrame();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(width, height);
  node.fills = solid(fill || TOKENS.card);
  node.strokes = stroke ? solid(stroke) : [];
  node.strokeWeight = stroke ? 1 : 0;
  node.cornerRadius = radius(corner, width, height);
  parent.appendChild(node);
  return node;
}

function rect(parent, name, x, y, width, height, fill, stroke, corner, opacity) {
  const node = figma.createRectangle();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(width, height);
  node.fills = solid(fill || TOKENS.card, opacity);
  node.strokes = stroke ? solid(stroke) : [];
  node.strokeWeight = stroke ? 1 : 0;
  node.cornerRadius = radius(corner, width, height);
  parent.appendChild(node);
  return node;
}

function ellipse(parent, name, x, y, size, fill, stroke) {
  const node = figma.createEllipse();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(size, size);
  node.fills = solid(fill || TOKENS.card);
  node.strokes = stroke ? solid(stroke) : [];
  node.strokeWeight = stroke ? 1 : 0;
  parent.appendChild(node);
  return node;
}

async function text(parent, name, value, x, y, width, size, color, lineHeight) {
  const node = figma.createText();
  node.name = name;
  node.fontName = FONT;
  node.fontSize = size || 14;
  node.lineHeight = { unit: "PIXELS", value: lineHeight || 22 };
  node.fills = solid(color || TOKENS.text);
  node.x = x;
  node.y = y;
  node.resize(width, Math.max(lineHeight || 22, 24));
  node.characters = value;
  parent.appendChild(node);
  return node;
}

async function header(phone) {
  await text(phone, "Page title", "我的任务", 24, 30, 180, 24, TOKENS.text, 32);
  ellipse(phone, "Create task button", 324, 28, 42, TOKENS.card);
  await text(phone, "Create plus", "+", 336, 31, 20, 28, TOKENS.text, 34);
}

async function taskRow(parent, y, title, summary, tone, important) {
  const row = frame(
    parent,
    `Task row / ${title}`,
    24,
    y,
    342,
    72,
    important ? TOKENS.importantBg : TOKENS.card,
    important ? TOKENS.importantBorder : TOKENS.border,
    14
  );
  const iconColor = tone === "warning" ? TOKENS.warning : TOKENS.primary;
  await text(row, "Status icon", tone === "warning" ? "!" : "•", 12, 15, 22, 18, iconColor, 24);
  await text(row, "Task title", `${important ? "★ " : ""}${title}`, 40, 13, 260, 15, TOKENS.text, 22);
  await text(row, "Task summary", summary, 40, 40, 220, 13, TOKENS.textSecondary, 20);
  await text(row, "Time", "刚刚", 282, 40, 44, 13, TOKENS.textSecondary, 20);
}

async function completed(parent, y, open) {
  const card = frame(parent, open ? "Completed tasks expanded" : "Completed tasks collapsed", 24, y, 342, open ? 204 : 64, TOKENS.card, TOKENS.border, 12);
  await text(card, "Completed title", "已完成任务", 20, 19, 150, 14, TOKENS.text, 22);
  await text(card, "Completed count", "2 个  >", 252, 19, 70, 13, TOKENS.textSecondary, 20);

  if (!open) return;

  for (let index = 0; index < 2; index += 1) {
    const row = frame(card, `Completed row ${index + 1}`, 8, 58 + index * 62, 326, 56, "#FBFDFF", null, 16);
    await text(row, "Completed row title", index === 0 ? "整理作品集文案" : "复习英语单词", 12, 17, 190, 14, TOKENS.text, 22);
    rect(row, "Completed pill", 228, 15, 76, 28, TOKENS.successBg, null, 14);
    await text(row, "Completed pill label", "已完成", 244, 20, 48, 13, "#0F766E", 18);
  }
}

async function phoneBoard(page, title, subtitle, x, y, variant) {
  await text(page, `Board title / ${title}`, title, x, y, 360, 18, TOKENS.text, 26);
  await text(page, `Board subtitle / ${title}`, subtitle, x, y + 28, 360, 12, TOKENS.textSecondary, 18);

  const phone = frame(page, title, x, y + 60, 390, 844, TOKENS.background, "#ECEAF7", 0);
  await header(phone);

  if (variant === "empty") {
    const card = frame(phone, "Empty task state card", 24, 92, 342, 180, TOKENS.card, TOKENS.border, 12);
    await text(card, "Empty title", "还没有任务", 116, 42, 120, 18, TOKENS.text, 28);
    await text(card, "Empty body", "创建一个任务，让 AI 帮你迈出第一步。", 54, 78, 240, 15, TOKENS.textSecondary, 24);
    rect(card, "Primary button", 24, 118, 294, 50, TOKENS.primary, TOKENS.primary, 25);
    await text(card, "Primary button label", "创建第一个任务", 112, 132, 120, 15, TOKENS.white, 20);
    return phone;
  }

  if (variant === "completed-open") {
    const empty = frame(phone, "No active tasks card", 24, 92, 342, 180, TOKENS.card, TOKENS.border, 12);
    await text(empty, "No active title", "暂无未完成任务", 98, 54, 170, 18, TOKENS.text, 28);
    await text(empty, "No active body", "新的任务会继续出现在这里。", 76, 92, 220, 15, TOKENS.textSecondary, 24);
    await completed(phone, 292, true);
    return phone;
  }

  await text(phone, "Task list hint", "长按任务可编辑", 24, 82, 160, 13, TOKENS.textSecondary, 20);
  await taskRow(phone, 112, "写作品集项目介绍", "可执行 - 第 2 步 - 补一个粗略的小标题", "active", true);
  await taskRow(phone, 192, "回复老师消息", "执行中 - 第 1 步 - 先打开草稿", "active", false);
  await taskRow(phone, 272, "整理论文选题", "已暂停 - 第 3 步 - 下次从判断标准开始", "warning", false);
  await completed(phone, 368, false);

  if (variant === "action-sheet") {
    rect(phone, "Modal scrim", 0, 0, 390, 844, TOKENS.scrim, null, 0, 0.34);
    const sheet = frame(phone, "Task action sheet", 18, 666, 354, 160, TOKENS.card, TOKENS.border, 16);
    await text(sheet, "Sheet title", "写作品集项目介绍", 16, 16, 260, 14, TOKENS.textSecondary, 22);
    rect(sheet, "Important action", 12, 48, 330, 40, TOKENS.card, TOKENS.border, 14);
    await text(sheet, "Important label", "取消重要", 26, 57, 120, 14, TOKENS.text, 20);
    rect(sheet, "Delete action", 12, 92, 330, 40, TOKENS.card, "#FECACA", 14);
    await text(sheet, "Delete label", "删除任务", 26, 101, 120, 14, TOKENS.error, 20);
    await text(sheet, "Cancel label", "取消", 26, 136, 80, 14, TOKENS.text, 20);
  }

  if (variant === "delete-dialog") {
    rect(phone, "Modal scrim", 0, 0, 390, 844, TOKENS.scrim, null, 0, 0.34);
    const dialog = frame(phone, "Delete confirm dialog", 34, 328, 322, 188, TOKENS.card, TOKENS.border, 16);
    await text(dialog, "Dialog title", "确定删除这个任务吗？", 20, 20, 220, 16, TOKENS.text, 24);
    await text(dialog, "Dialog body", "删除后无法恢复。", 20, 56, 200, 15, TOKENS.textSecondary, 24);
    rect(dialog, "Cancel button", 20, 118, 132, 48, TOKENS.card, TOKENS.border, 24);
    await text(dialog, "Cancel label", "取消", 70, 132, 40, 15, TOKENS.text, 20);
    rect(dialog, "Delete button", 170, 118, 132, 48, TOKENS.error, TOKENS.error, 24);
    await text(dialog, "Delete label", "删除", 220, 132, 40, 15, TOKENS.white, 20);
  }

  return phone;
}

async function build() {
  await loadFont();

  const cells = [
    { x: 80, y: 80 },
    { x: 540, y: 80 },
    { x: 1000, y: 80 },
    { x: 80, y: 1060 },
    { x: 540, y: 1060 }
  ];

  await phoneBoard(figma.currentPage, "列表 / 空任务", "tasks.length === 0", cells[0].x, cells[0].y, "empty");
  await phoneBoard(figma.currentPage, "列表 / 进行中任务", "activeTasks + completed collapsed", cells[1].x, cells[1].y, "active");
  await phoneBoard(figma.currentPage, "列表 / 已完成展开", "activeTasks.length === 0 + completedOpen", cells[2].x, cells[2].y, "completed-open");
  await phoneBoard(figma.currentPage, "列表 / 长按操作", "task action sheet", cells[3].x, cells[3].y, "action-sheet");
  const last = await phoneBoard(figma.currentPage, "列表 / 删除确认", "alertdialog", cells[4].x, cells[4].y, "delete-dialog");

  figma.currentPage.selection = [last];
  figma.viewport.scrollAndZoomIntoView([last]);
  figma.closePlugin("List states created.");
}

build().catch((error) => {
  console.error(error);
  figma.closePlugin(`List importer failed: ${error && error.message ? error.message : String(error)}`);
});
