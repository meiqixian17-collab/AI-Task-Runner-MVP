const TOKENS = {
  primary: "#6157D8",
  primaryHover: "#5146C4",
  secondary: "#12A37F",
  background: "#F6F4FC",
  card: "#FFFFFF",
  text: "#111827",
  textSecondary: "#5F6F8A",
  border: "#DEDCF0",
  hover: "#EDE9FE",
  disabled: "#CBD5E1",
  disabledBg: "#E2E8F0",
  disabledText: "#94A3B8",
  success: "#12A37F",
  successBg: "#E8F8F1",
  warning: "#D97706",
  warningBg: "#FFF7DF",
  error: "#B42318",
  errorBg: "#FEF3F2",
  focusBg: "#FBFAFF",
  input: "#FBFDFF",
  muted: "#F8FAFC",
  importantBg: "#FFFAF0",
  importantBorder: "#F4D37A",
  resistanceBg: "#FFFDF6",
  resistanceBorder: "#F1DFB8",
  scrim: "#0F172A",
  white: "#FFFFFF"
};

const SHADOWS = {
  card: [
    {
      type: "DROP_SHADOW",
      color: { r: 15 / 255, g: 23 / 255, b: 42 / 255, a: 0.08 },
      offset: { x: 0, y: 10 },
      radius: 30,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    },
    {
      type: "DROP_SHADOW",
      color: { r: 15 / 255, g: 23 / 255, b: 42 / 255, a: 0.04 },
      offset: { x: 0, y: 1 },
      radius: 2,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }
  ],
  hover: [
    {
      type: "DROP_SHADOW",
      color: { r: 15 / 255, g: 23 / 255, b: 42 / 255, a: 0.12 },
      offset: { x: 0, y: 16 },
      radius: 40,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }
  ],
  modal: [
    {
      type: "DROP_SHADOW",
      color: { r: 15 / 255, g: 23 / 255, b: 42 / 255, a: 0.22 },
      offset: { x: 0, y: 24 },
      radius: 60,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }
  ],
  primary: [
    {
      type: "DROP_SHADOW",
      color: { r: 97 / 255, g: 87 / 255, b: 216 / 255, a: 0.24 },
      offset: { x: 0, y: 10 },
      radius: 22,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }
  ]
};

let FONTS = null;
let CURRENT_STAGE = "starting";

function rgb(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255
  };
}

function solid(hex, opacity = 1) {
  const paint = { type: "SOLID", color: rgb(hex) };
  if (opacity !== 1) {
    paint.opacity = opacity;
  }
  return [paint];
}

function cloneEffects(effects) {
  return JSON.parse(JSON.stringify(effects));
}

function safeRadius(radius, width, height) {
  if (!radius) return 0;
  return Math.min(radius, width / 2, height / 2);
}

async function setCurrentPage(page) {
  if (typeof figma.setCurrentPageAsync === "function") {
    await figma.setCurrentPageAsync(page);
    return;
  }

  figma.currentPage = page;
}

function findFont(fonts, families, styles) {
  for (const family of families) {
    const familyMatches = fonts.filter((font) => font.fontName.family === family);
    for (const style of styles) {
      const exact = familyMatches.find((font) => font.fontName.style === style);
      if (exact) return exact.fontName;
    }
    for (const style of styles) {
      const loose = familyMatches.find((font) =>
        font.fontName.style.toLowerCase().includes(style.toLowerCase())
      );
      if (loose) return loose.fontName;
    }
    if (familyMatches[0]) return familyMatches[0].fontName;
  }
  return fonts[0]?.fontName || { family: "Inter", style: "Regular" };
}

async function prepareFonts() {
  const fonts = await figma.listAvailableFontsAsync();
  const cnFamilies = [
    "Microsoft YaHei",
    "Microsoft YaHei UI",
    "Noto Sans CJK SC",
    "Noto Sans SC",
    "Source Han Sans SC",
    "PingFang SC",
    "Inter",
    "Arial"
  ];

  FONTS = {
    regular: findFont(fonts, cnFamilies, ["Regular", "Normal"]),
    medium: findFont(fonts, cnFamilies, ["Medium", "Regular", "Normal"]),
    semi: findFont(fonts, cnFamilies, ["Semi Bold", "Semibold", "Demi Bold", "Medium", "Bold"]),
    bold: findFont(fonts, cnFamilies, ["Bold", "Semi Bold", "Semibold", "Medium"])
  };

  const uniqueFonts = Array.from(
    new Map(Object.values(FONTS).map((font) => [`${font.family}/${font.style}`, font])).values()
  );
  for (const font of uniqueFonts) {
    await figma.loadFontAsync(font);
  }
}

function fontForWeight(weight = 400) {
  if (weight >= 700) return FONTS.bold;
  if (weight >= 600) return FONTS.semi;
  if (weight >= 500) return FONTS.medium;
  return FONTS.regular;
}

function markStage(stage) {
  CURRENT_STAGE = stage;
}

function safeFrame(parent, name, x, y, width, height, fillHex = TOKENS.card, strokeHex = null, radius = 0) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.resize(width, height);
  frame.fills = solid(fillHex);
  frame.strokes = strokeHex ? solid(strokeHex) : [];
  frame.strokeWeight = strokeHex ? 1 : 0;
  frame.cornerRadius = safeRadius(radius, width, height);
  parent.appendChild(frame);
  return frame;
}

function safeRect(parent, name, x, y, width, height, fillHex = TOKENS.card, strokeHex = null, radius = 0) {
  const rect = figma.createRectangle();
  rect.name = name;
  rect.x = x;
  rect.y = y;
  rect.resize(width, height);
  rect.fills = solid(fillHex);
  rect.strokes = strokeHex ? solid(strokeHex) : [];
  rect.strokeWeight = strokeHex ? 1 : 0;
  rect.cornerRadius = safeRadius(radius, width, height);
  parent.appendChild(rect);
  return rect;
}

function safeEllipse(parent, name, x, y, size, fillHex = TOKENS.card, strokeHex = null) {
  const ellipse = figma.createEllipse();
  ellipse.name = name;
  ellipse.x = x;
  ellipse.y = y;
  ellipse.resize(size, size);
  ellipse.fills = solid(fillHex);
  ellipse.strokes = strokeHex ? solid(strokeHex) : [];
  ellipse.strokeWeight = strokeHex ? 1 : 0;
  parent.appendChild(ellipse);
  return ellipse;
}

async function safeText(parent, name, text, x, y, width, size = 14, weight = 400, color = TOKENS.text, lineHeight = 22) {
  const node = figma.createText();
  node.name = name;
  node.fontName = fontForWeight(weight);
  node.fontSize = size;
  node.lineHeight = { unit: "PIXELS", value: lineHeight };
  node.fills = solid(color);
  node.x = x;
  node.y = y;
  node.resize(width, Math.max(lineHeight, 24));
  node.characters = text;
  parent.appendChild(node);
  return node;
}

function makeFrame(parent, name, x, y, width, height, options = {}) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.resize(width, height);
  frame.fills = options.transparent ? [] : solid(options.fill || TOKENS.card, options.opacity || 1);
  frame.strokes = options.stroke ? solid(options.stroke) : [];
  frame.strokeWeight = options.stroke ? options.strokeWeight || 1 : 0;
  frame.cornerRadius = safeRadius(options.radius || 0, width, height);
  frame.clipsContent = Boolean(options.clip);
  if (options.shadow) {
    try {
      frame.effects = cloneEffects(SHADOWS[options.shadow]);
    } catch {
      frame.effects = [];
    }
  }
  parent.appendChild(frame);
  return frame;
}

function makeRect(parent, name, x, y, width, height, options = {}) {
  const rect = figma.createRectangle();
  rect.name = name;
  rect.x = x;
  rect.y = y;
  rect.resize(width, height);
  rect.fills = options.transparent ? [] : solid(options.fill || TOKENS.card, options.opacity || 1);
  rect.strokes = options.stroke ? solid(options.stroke) : [];
  rect.strokeWeight = options.stroke ? options.strokeWeight || 1 : 0;
  rect.cornerRadius = safeRadius(options.radius || 0, width, height);
  if (options.shadow) {
    try {
      rect.effects = cloneEffects(SHADOWS[options.shadow]);
    } catch {
      rect.effects = [];
    }
  }
  parent.appendChild(rect);
  return rect;
}

function makeCircle(parent, name, x, y, size, options = {}) {
  const circle = figma.createEllipse();
  circle.name = name;
  circle.x = x;
  circle.y = y;
  circle.resize(size, size);
  circle.fills = options.transparent ? [] : solid(options.fill || TOKENS.card, options.opacity || 1);
  circle.strokes = options.stroke ? solid(options.stroke) : [];
  circle.strokeWeight = options.stroke ? options.strokeWeight || 1 : 0;
  if (options.shadow) {
    circle.effects = cloneEffects(SHADOWS[options.shadow]);
  }
  parent.appendChild(circle);
  return circle;
}

async function makeText(parent, name, text, x, y, width, options = {}) {
  const node = figma.createText();
  node.name = name;
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  node.fontName = fontForWeight(options.weight || 400);
  node.fontSize = options.size || 15;
  node.lineHeight = options.lineHeight
    ? { unit: "PIXELS", value: options.lineHeight }
    : { unit: "AUTO" };
  node.letterSpacing = { unit: "PIXELS", value: 0 };
  node.fills = solid(options.color || TOKENS.text, options.opacity || 1);
  node.textAlignHorizontal = options.align || "LEFT";
  node.resize(width, options.height || 24);
  node.characters = text;
  return node;
}

async function boardTitle(page, title, subtitle, x, y) {
  await makeText(page, `Board title / ${title}`, title, x, y, 360, {
    size: 18,
    weight: 700,
    lineHeight: 26
  });
  if (subtitle) {
    await makeText(page, `Board note / ${title}`, subtitle, x, y + 28, 360, {
      size: 12,
      weight: 500,
      color: TOKENS.textSecondary,
      lineHeight: 18
    });
  }
}

async function drawPhone(page, title, subtitle, x, y, drawContent) {
  await boardTitle(page, title, subtitle, x, y);
  const phone = makeFrame(page, title, x, y + 60, 390, 844, {
    fill: TOKENS.background,
    stroke: "#ECEAF7",
    radius: 0,
    clip: false
  });
  await drawContent(phone);
  return phone;
}

async function drawHeader(phone, options = {}) {
  if (options.back) {
    makeCircle(phone, "Back icon button", 16, 28, 42, { fill: TOKENS.card });
    await makeText(phone, "Back icon", "<", 29, 35, 16, {
      size: 20,
      weight: 700,
      color: "#000000",
      lineHeight: 24
    });
    return;
  }

  await makeText(phone, "Page title", options.title || "我的任务", 24, 31, 220, {
    size: 24,
    weight: 700,
    lineHeight: 32
  });
  if (options.create !== false) {
    makeCircle(phone, "Create task button", 324, 28, 42, { fill: TOKENS.card });
    await makeText(phone, "Create task plus", "+", 336, 32, 18, {
      size: 28,
      weight: 700,
      color: TOKENS.text,
      lineHeight: 34,
      align: "CENTER"
    });
  }
}

async function drawButton(parent, name, label, x, y, width, type = "primary", options = {}) {
  const isPrimary = type === "primary";
  const isDanger = type === "danger";
  const isSolidDanger = type === "solid-danger";
  const disabled = Boolean(options.disabled);
  const fill = disabled
    ? TOKENS.disabledBg
    : isPrimary
      ? TOKENS.primary
      : isSolidDanger
        ? TOKENS.error
        : TOKENS.card;
  const stroke = disabled
    ? TOKENS.disabled
    : isPrimary
      ? TOKENS.primary
      : isSolidDanger
        ? TOKENS.error
        : isDanger
          ? "#FECACA"
          : TOKENS.border;
  const color = disabled
    ? TOKENS.disabledText
    : isPrimary || isSolidDanger
      ? TOKENS.white
      : isDanger
        ? TOKENS.error
        : TOKENS.text;

  makeRect(parent, name, x, y, width, options.height || 50, {
    fill,
    stroke,
    radius: options.radius || 26,
    shadow: isPrimary && !disabled ? "primary" : null
  });
  await makeText(parent, `${name} label`, label, x + 12, y + 14, width - 24, {
    size: options.size || 15,
    weight: 700,
    color,
    align: "CENTER",
    lineHeight: 20
  });
}

async function drawPill(parent, name, label, x, y, tone = "neutral", width = 76) {
  const tones = {
    neutral: { fill: TOKENS.muted, color: TOKENS.textSecondary, stroke: TOKENS.border },
    active: { fill: TOKENS.hover, color: TOKENS.primary, stroke: null },
    success: { fill: TOKENS.successBg, color: "#0F766E", stroke: null },
    warning: { fill: TOKENS.warningBg, color: TOKENS.warning, stroke: null },
    error: { fill: TOKENS.errorBg, color: TOKENS.error, stroke: null }
  };
  const toneDef = tones[tone] || tones.neutral;
  makeRect(parent, name, x, y, width, 28, {
    fill: toneDef.fill,
    stroke: toneDef.stroke,
    radius: 999
  });
  await makeText(parent, `${name} label`, label, x, y + 5, width, {
    size: 13,
    weight: 600,
    color: toneDef.color,
    lineHeight: 18,
    align: "CENTER"
  });
}

async function drawSurfaceCard(parent, name, x, y, width, height, options = {}) {
  return makeFrame(parent, name, x, y, width, height, {
    fill: options.fill || TOKENS.card,
    stroke: options.stroke || TOKENS.border,
    radius: options.radius || 12,
    shadow: options.shadow === false ? null : "card"
  });
}

async function drawEmptyTasks(phone, title, body, showButton = true) {
  const card = await drawSurfaceCard(phone, "Empty task state card", 24, 92, 342, 180);
  await makeText(card, "Empty title", title, 16, 42, 310, {
    size: 18,
    weight: 700,
    lineHeight: 28,
    align: "CENTER"
  });
  await makeText(card, "Empty body", body, 30, 76, 282, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 24,
    align: "CENTER"
  });
  if (showButton) {
    await drawButton(card, "Create first task", "创建第一个任务", 24, 118, 294, "primary");
  }
}

async function drawTaskItem(parent, task, x, y, options = {}) {
  const item = makeFrame(parent, `Task item / ${task.title}`, x, y, 342, 72, {
    fill: options.important ? TOKENS.importantBg : TOKENS.card,
    stroke: options.important ? TOKENS.importantBorder : TOKENS.border,
    radius: 14,
    shadow: null
  });
  const toneColor =
    task.tone === "success"
      ? TOKENS.success
      : task.tone === "warning"
        ? TOKENS.warning
        : task.tone === "active"
          ? TOKENS.primary
          : TOKENS.textSecondary;
  await makeText(item, "Status icon", task.icon || "•", 10, 14, 24, {
    size: 18,
    weight: 700,
    color: toneColor,
    lineHeight: 24,
    align: "CENTER"
  });
  await makeText(item, "Task title", `${options.important ? "★ " : ""}${task.title}`, 40, 13, 270, {
    size: 15,
    weight: 700,
    lineHeight: 22
  });
  await makeText(item, "Task summary", task.summary, 40, 40, 210, {
    size: 13,
    color: TOKENS.textSecondary,
    lineHeight: 20
  });
  await makeText(item, "Task time", task.time || "刚刚", 268, 40, 54, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 20,
    align: "RIGHT"
  });
}

async function drawCompletedBlock(parent, x, y, open = false, onlyCompleted = false) {
  const height = open ? 210 : 64;
  const card = makeFrame(parent, open ? "Completed tasks expanded" : "Completed tasks collapsed", x, y, 342, height, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 12
  });
  await makeText(card, "Completed title", "已完成任务", 20, 20, 150, {
    size: 14,
    weight: 800,
    lineHeight: 22
  });
  await makeText(card, "Completed count", open ? "2 个  >" : "2 个  >", 254, 20, 68, {
    size: 13,
    weight: 700,
    color: TOKENS.textSecondary,
    lineHeight: 20,
    align: "RIGHT"
  });
  if (!open) return;

  const row1 = makeFrame(card, "Completed row / portfolio", 8, 58, 326, 60, {
    fill: "#FBFDFF",
    radius: 16
  });
  await makeText(row1, "Completed task title", onlyCompleted ? "回复老师消息" : "整理作品集文案", 12, 18, 200, {
    size: 14,
    weight: 700,
    lineHeight: 22
  });
  await drawPill(row1, "Completed task pill", "已完成", 226, 16, "success", 76);

  const row2 = makeFrame(card, "Completed row / report", 8, 124, 326, 60, {
    fill: "#FBFDFF",
    radius: 16
  });
  await makeText(row2, "Completed task title", "复习英语单词", 12, 18, 200, {
    size: 14,
    weight: 700,
    lineHeight: 22
  });
  await drawPill(row2, "Completed task pill", "已完成", 226, 16, "success", 76);
}

async function drawTaskListFilled(phone) {
  await makeText(phone, "Task list hint", "长按任务可编辑", 24, 82, 180, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 20
  });
  await drawTaskItem(
    phone,
    {
      title: "写作品集项目介绍",
      summary: "可执行 - 第 2 步 - 补一个粗略的小标题",
      tone: "active",
      icon: "•",
      time: "刚刚"
    },
    24,
    112,
    { important: true }
  );
  await drawTaskItem(
    phone,
    {
      title: "回复老师消息",
      summary: "执行中 - 第 1 步 - 先打开草稿",
      tone: "active",
      icon: "•",
      time: "5 分钟"
    },
    24,
    192
  );
  await drawTaskItem(
    phone,
    {
      title: "整理论文选题",
      summary: "已暂停 - 第 3 步 - 下次从判断标准开始",
      tone: "warning",
      icon: "!",
      time: "昨天"
    },
    24,
    272
  );
  await drawCompletedBlock(phone, 24, 368, false);
}

async function drawOnlyCompletedList(phone) {
  await drawEmptyTasks(phone, "暂无未完成任务", "新的任务会继续出现在这里。", false);
  await drawCompletedBlock(phone, 24, 292, true, true);
}

async function drawActionSheetOverlay(phone) {
  makeRect(phone, "Modal scrim", 0, 0, 390, 844, {
    fill: TOKENS.scrim,
    opacity: 0.34
  });
  const sheet = makeFrame(phone, "Task action sheet", 18, 666, 354, 160, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 16,
    shadow: "modal"
  });
  await makeText(sheet, "Sheet title", "写作品集项目介绍", 16, 16, 300, {
    size: 14,
    weight: 700,
    color: TOKENS.textSecondary,
    lineHeight: 22
  });
  await drawButton(sheet, "Toggle important action", "取消重要", 12, 48, 330, "secondary", {
    height: 40,
    radius: 14,
    size: 14
  });
  await drawButton(sheet, "Delete task action", "删除任务", 12, 92, 330, "danger", {
    height: 40,
    radius: 14,
    size: 14
  });
  await makeText(sheet, "Cancel action", "取消", 26, 134, 120, {
    size: 14,
    weight: 700,
    lineHeight: 20
  });
}

async function drawDeleteDialogOverlay(phone) {
  makeRect(phone, "Modal scrim", 0, 0, 390, 844, {
    fill: TOKENS.scrim,
    opacity: 0.34
  });
  const dialog = makeFrame(phone, "Delete confirm dialog", 34, 328, 322, 188, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 16,
    shadow: "modal"
  });
  await makeText(dialog, "Dialog title", "确定删除这个任务吗？", 20, 20, 260, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  await makeText(dialog, "Dialog body", "删除后无法恢复。", 20, 56, 260, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 24
  });
  await drawButton(dialog, "Cancel delete", "取消", 20, 118, 132, "secondary", {
    height: 48,
    radius: 24
  });
  await drawButton(dialog, "Confirm delete", "删除", 170, 118, 132, "solid-danger", {
    height: 48,
    radius: 24
  });
}

async function drawTaskPanel(parent, state = "idle", y = 82) {
  const compact = state !== "idle";
  const panel = await drawSurfaceCard(parent, compact ? "Task summary panel" : "Task input panel", 16, y, 358, compact ? 96 : 250, {
    radius: 12
  });
  if (!compact) {
    await makeText(panel, "Panel kicker", "任务输入", 16, 16, 180, {
      size: 13,
      weight: 700,
      color: TOKENS.primary,
      lineHeight: 20
    });
    await makeText(panel, "Panel title", "今天先推进什么？", 16, 40, 220, {
      size: 16,
      weight: 700,
      lineHeight: 24
    });
    await makeText(panel, "Field label", "待推进任务", 16, 78, 120, {
      size: 13,
      weight: 600,
      color: TOKENS.textSecondary,
      lineHeight: 20
    });
    makeRect(panel, "Task textarea", 16, 110, 326, 86, {
      fill: TOKENS.input,
      stroke: TOKENS.border,
      radius: 10
    });
    await makeText(
      panel,
      "Task placeholder",
      "例如：写作品集项目介绍 / 回复老师消息 / 整理论文选题",
      30,
      126,
      286,
      { size: 14, color: TOKENS.textSecondary, lineHeight: 22 }
    );
    await drawButton(panel, "Generate first step", "生成第一步", 16, 210, 326, "primary", {
      height: 44
    });
    return panel;
  }

  const tone = state === "paused" ? "warning" : state === "completed" ? "success" : "active";
  const dotColor = tone === "warning" ? TOKENS.warning : tone === "success" ? TOKENS.success : TOKENS.primary;
  makeCircle(panel, "Task summary dot", 16, 42, 10, { fill: dotColor });
  await makeText(panel, "Task summary label", state === "completed" ? "已完成任务" : "当前任务", 36, 22, 160, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 18
  });
  await makeText(panel, "Task summary text", "写作品集项目介绍", 36, 44, 210, {
    size: 14,
    weight: 700,
    lineHeight: 20
  });
  await makeText(panel, "Autosave note", "自动保存", 278, 38, 64, {
    size: 13,
    weight: 700,
    color: TOKENS.textSecondary,
    lineHeight: 20,
    align: "RIGHT"
  });
  return panel;
}

async function drawStepCardHeader(card, mode, statusTone = "active", pill = "可执行") {
  const headerMap = {
    idle: ["当前行动", "先写下一件事"],
    loading: ["当前行动", "正在找到最小可执行动作"],
    ready: ["当前行动", "这一步已经可以开始"],
    executing: ["当前行动", "专注完成当前一步"],
    paused: ["当前行动", "入口已为你保留"],
    exited: ["当前行动", "本次推进已结束"],
    clarification: ["信息补充", "需要补充信息"],
    completion: ["完成确认", "确认是否收尾"],
    checklist: ["收尾检查", "确认完成边界"],
    completed: ["当前行动", "这轮推进已经闭环"]
  };
  const [kicker, title] = headerMap[mode] || headerMap.ready;
  await makeText(card, "Step card kicker", kicker, 16, 16, 150, {
    size: 13,
    weight: 700,
    color: TOKENS.primary,
    lineHeight: 20
  });
  await makeText(card, "Step card title", title, 16, 40, 210, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  await drawPill(card, "Status pill", pill, 220, 18, statusTone, 62);
  await drawPill(card, "Step index pill", "第 1 步", 290, 18, "neutral", 58);
}

async function drawLoadingPanel(parent, x, y, width, text) {
  makeRect(parent, "Loading accent", x, y, 4, 72, { fill: TOKENS.primary, radius: 2 });
  makeRect(parent, "Loading track", x + 16, y + 14, width - 16, 6, {
    fill: "#E3E4FB",
    radius: 999
  });
  makeRect(parent, "Loading bar", x + 16, y + 14, (width - 16) * 0.42, 6, {
    fill: TOKENS.primary,
    radius: 999
  });
  await makeText(parent, "Loading text", text, x + 16, y + 32, width - 20, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 24
  });
}

async function drawStepFocus(parent, y, options = {}) {
  const height = options.height || 138;
  makeRect(parent, "Step focus background", 16, y, 326, height, {
    fill: TOKENS.focusBg
  });
  makeRect(parent, "Step focus accent", 16, y, 4, height, {
    fill: options.accent || TOKENS.primary,
    radius: 2
  });
  await makeText(parent, "Step focus label", options.label || "准备执行", 34, y + 18, 110, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 20
  });
  if (options.badge) {
    await drawPill(parent, "Source badge", options.badge, 128, y + 14, options.badgeTone || "active", 74);
  }
  if (options.fallbackBadge) {
    await drawPill(parent, "Fallback badge", "低阻力版", 208, y + 14, "success", 84);
  }
  await makeText(parent, "Current step text", options.text || "打开文档，先写下标题和一个小标题。", 34, y + 52, 290, {
    size: 20,
    weight: 700,
    lineHeight: 30
  });
}

async function drawStepCard(parent, x, y, variant) {
  const heightMap = {
    idle: 268,
    loading: 250,
    ready: 336,
    clarification: 390,
    completion: 348,
    checklist: 408,
    executing: 396,
    resistance: 684,
    resolving: 306,
    paused: 430,
    exited: 304,
    error: 392,
    completed: 304
  };
  const card = await drawSurfaceCard(parent, `StepCard / ${variant}`, x, y, 358, heightMap[variant] || 336, {
    stroke: "#D7D8F7",
    radius: 12
  });

  if (variant === "idle") {
    await drawStepCardHeader(card, "idle", "neutral", "待输入");
    makeRect(card, "Empty accent", 16, 96, 4, 76, { fill: TOKENS.border, radius: 2 });
    await makeText(
      card,
      "Empty panel text",
      "把任务写在上方，生成后这里会出现当前只做的一步。",
      34,
      110,
      292,
      { size: 15, color: TOKENS.textSecondary, lineHeight: 24 }
    );
    return card;
  }

  if (variant === "loading") {
    await drawStepCardHeader(card, "loading", "active", "生成中");
    await drawLoadingPanel(card, 16, 98, 326, "正在生成第一步...");
    return card;
  }

  if (variant === "ready") {
    await drawStepCardHeader(card, "ready", "active", "可执行");
    await drawStepFocus(card, 96, { badge: "AI 返回" });
    await drawButton(card, "Start executing", "开始执行", 16, 258, 326, "primary", { height: 50 });
    return card;
  }

  if (variant === "clarification") {
    await drawStepCardHeader(card, "clarification", "active", "待补充");
    await drawStepFocus(card, 96, {
      label: "需要补充信息",
      text: "这个品牌主要卖什么？",
      height: 118
    });
    makeRect(card, "Clarification input row", 34, 236, 290, 54, {
      fill: TOKENS.input,
      stroke: TOKENS.border,
      radius: 26
    });
    await makeText(card, "Clarification placeholder", "例如：咖啡 / 手作饰品", 50, 251, 210, {
      size: 14,
      color: TOKENS.textSecondary,
      lineHeight: 22
    });
    makeCircle(card, "Clarification send", 274, 241, 44, {
      fill: TOKENS.primary,
      stroke: TOKENS.primary
    });
    await makeText(card, "Clarification send icon", "✓", 285, 251, 22, {
      size: 16,
      weight: 700,
      color: TOKENS.white,
      lineHeight: 18,
      align: "CENTER"
    });
    await makeText(card, "Clarification error", "请先输入内容。", 36, 306, 220, {
      size: 13,
      weight: 700,
      color: TOKENS.error,
      lineHeight: 20
    });
    return card;
  }

  if (variant === "completion") {
    await drawStepCardHeader(card, "completion", "active", "待确认");
    await drawStepFocus(card, 96, {
      label: "完成边界确认",
      text: "这个任务是否已经可以收尾？",
      height: 118
    });
    await drawButton(card, "Confirm complete", "标记整个任务完成", 16, 238, 326, "primary", {
      height: 48
    });
    await drawButton(card, "Need one more step", "还差一步", 16, 298, 326, "secondary", {
      height: 48
    });
    return card;
  }

  if (variant === "checklist") {
    await drawStepCardHeader(card, "checklist", "active", "待检查");
    await drawStepFocus(card, 96, {
      label: "收尾清单",
      text: "确认提交前，检查这三件事：",
      height: 186
    });
    const items = ["标题和正文都已写上", "没有遗漏收件人", "先保存一版草稿"];
    for (let i = 0; i < items.length; i += 1) {
      await makeText(card, `Checklist item ${i + 1}`, `${i + 1}. ${items[i]}`, 52, 190 + i * 26, 250, {
        size: 14,
        weight: 600,
        color: TOKENS.textSecondary,
        lineHeight: 22
      });
    }
    await drawButton(card, "Checklist complete", "标记整个任务完成", 16, 304, 326, "primary", {
      height: 48
    });
    await drawButton(card, "Checklist one more", "还差一步", 16, 362, 326, "secondary", {
      height: 40
    });
    return card;
  }

  if (variant === "executing" || variant === "resistance") {
    await drawStepCardHeader(card, "executing", "active", "执行中");
    await drawStepFocus(card, 96, {
      label: "执行中",
      text: "只完成当前这一步，不处理后面的部分。",
      height: 128
    });
    await drawButton(card, "Complete current step", "完成当前步骤", 16, 248, 326, "primary", {
      height: 48
    });
    await makeText(card, "Resistance link", "我卡住了", 18, 316, 120, {
      size: 15,
      weight: 700,
      color: TOKENS.textSecondary,
      lineHeight: 24
    });

    if (variant === "resistance") {
      makeRect(card, "Resistance accent", 16, 356, 4, 196, {
        fill: "#F5C467",
        radius: 2
      });
      await makeText(card, "Resistance title", "选一个最接近的卡点", 34, 356, 180, {
        size: 15,
        weight: 700,
        lineHeight: 24
      });
      const options = ["这一步太难了", "我就是不想做", "我不确定还要不要继续", "我现在状态不适合做"];
      for (let i = 0; i < options.length; i += 1) {
        const oy = 390 + i * 38;
        makeRect(card, `Resistance option ${i + 1}`, 34, oy, 290, 32, {
          fill: TOKENS.resistanceBg,
          stroke: TOKENS.resistanceBorder,
          radius: 16
        });
        await makeText(card, `Resistance option label ${i + 1}`, options[i], 48, oy + 7, 240, {
          size: 13,
          weight: 600,
          lineHeight: 18
        });
      }
      await makeText(card, "Resistance text label", "也可以补充一句", 34, 544, 150, {
        size: 14,
        weight: 700,
        lineHeight: 22
      });
      makeRect(card, "Resistance input row", 34, 574, 290, 46, {
        fill: TOKENS.input,
        stroke: TOKENS.border,
        radius: 26
      });
      await makeText(card, "Resistance input placeholder", "例如：怕写得不好", 48, 586, 200, {
        size: 13,
        color: TOKENS.textSecondary,
        lineHeight: 20
      });
      makeCircle(card, "Resistance send", 274, 575, 44, {
        fill: TOKENS.primary,
        stroke: TOKENS.primary
      });
      await makeText(card, "Resistance result", "已降低启动门槛，先做一个 60 分版本。", 34, 632, 286, {
        size: 13,
        weight: 700,
        color: TOKENS.secondary,
        lineHeight: 20
      });
    }
    return card;
  }

  if (variant === "resolving") {
    await drawStepCardHeader(card, "executing", "active", "执行中");
    await drawLoadingPanel(card, 16, 98, 326, "正在根据卡点生成更容易继续的一步...");
    return card;
  }

  if (variant === "paused") {
    await drawStepCardHeader(card, "paused", "warning", "已暂停");
    await drawStepFocus(card, 96, {
      label: "已暂停",
      text: "先保存入口，下次回来从这里继续。",
      height: 124,
      accent: TOKENS.warning
    });
    makeRect(card, "Paused result accent", 16, 246, 4, 116, {
      fill: TOKENS.warning,
      radius: 2
    });
    await makeText(card, "Paused result text", "现在不适合继续，已保留恢复入口。", 34, 252, 286, {
      size: 15,
      color: TOKENS.textSecondary,
      lineHeight: 24
    });
    await drawButton(card, "Resume step", "继续当前步骤", 34, 306, 290, "primary", {
      height: 44
    });
    await drawButton(card, "Back from pause", "返回我的任务", 34, 362, 290, "secondary", {
      height: 44
    });
    return card;
  }

  if (variant === "exited") {
    await drawStepCardHeader(card, "exited", "neutral", "已退出");
    makeRect(card, "Exited accent", 16, 98, 4, 92, {
      fill: TOKENS.warning,
      radius: 2
    });
    await makeText(card, "Exited summary", "本次任务已退出，上下文会保留在任务列表中。", 34, 104, 286, {
      size: 15,
      color: TOKENS.textSecondary,
      lineHeight: 24
    });
    await drawButton(card, "Exited back", "返回我的任务", 34, 208, 290, "secondary", {
      height: 48
    });
    return card;
  }

  if (variant === "error") {
    await drawStepCardHeader(card, "ready", "active", "可执行");
    await drawStepFocus(card, 96, {
      badge: "AI 返回",
      text: "打开文档，先写下标题和一个小标题。",
      height: 128
    });
    await drawButton(card, "Start executing", "开始执行", 16, 248, 326, "primary", {
      height: 48
    });
    makeRect(card, "Inline error background", 16, 322, 326, 44, {
      fill: TOKENS.errorBg,
      radius: 10
    });
    await makeText(card, "Inline error text", "网络异常，已改用本地低阻力步骤。", 28, 334, 290, {
      size: 13,
      weight: 700,
      color: TOKENS.error,
      lineHeight: 20
    });
    return card;
  }

  if (variant === "completed") {
    await drawStepCardHeader(card, "completed", "success", "已完成");
    makeRect(card, "Completed accent", 16, 98, 4, 92, {
      fill: TOKENS.success,
      radius: 2
    });
    await makeText(card, "Completed summary", "这轮推进已经闭环，可以回到任务列表。", 34, 104, 286, {
      size: 15,
      color: TOKENS.textSecondary,
      lineHeight: 24
    });
    await drawButton(card, "Completed back", "返回我的任务", 34, 208, 290, "secondary", {
      height: 48
    });
    return card;
  }

  return card;
}

async function drawProgress(parent, y, open = false, count = 0) {
  const height = open ? 208 : 72;
  const panel = makeFrame(parent, open ? "Progress expanded" : "Progress collapsed", 16, y, 358, height, {
    fill: TOKENS.background,
    transparent: true
  });
  await makeText(panel, "Progress kicker", "进度记录", 10, 8, 160, {
    size: 13,
    weight: 700,
    color: TOKENS.primary,
    lineHeight: 20
  });
  await makeText(panel, "Progress title", `已完成 ${count} 步`, 10, 32, 160, {
    size: 15,
    weight: 700,
    lineHeight: 22
  });
  await makeText(panel, "Progress meta", count === 0 ? "暂无记录  >" : "查看记录  >", 226, 28, 112, {
    size: 13,
    weight: 700,
    color: TOKENS.textSecondary,
    lineHeight: 20,
    align: "RIGHT"
  });
  if (!open || count === 0) return panel;

  makeRect(panel, "Timeline divider", 10, 72, 326, 1, { fill: TOKENS.border });
  const items = ["打开文档并写下标题", "补一个粗略的小标题", "保存 60 分草稿"];
  for (let i = 0; i < items.length; i += 1) {
    const yy = 92 + i * 36;
    makeCircle(panel, `Timeline number ${i + 1}`, 10, yy, 28, { fill: TOKENS.successBg });
    await makeText(panel, `Timeline number text ${i + 1}`, String(i + 1), 10, yy + 5, 28, {
      size: 13,
      weight: 700,
      color: TOKENS.success,
      lineHeight: 18,
      align: "CENTER"
    });
    await makeText(panel, `Timeline item ${i + 1}`, items[i], 48, yy + 3, 260, {
      size: 14,
      color: TOKENS.textSecondary,
      lineHeight: 22
    });
  }
  return panel;
}

async function drawExecutionState(phone, status, options = {}) {
  await drawHeader(phone, { back: true });
  const panelState =
    status === "idle"
      ? "idle"
      : status === "paused"
        ? "paused"
        : status === "completed"
          ? "completed"
          : "active";
  await drawTaskPanel(phone, panelState, 82);

  if (status !== "completed") {
    const stepY = status === "idle" ? 350 : 194;
    await drawStepCard(phone, 16, stepY, status);
    const progressY = stepY + (options.progressOffset || (status === "resistance" ? 610 : 420));
    await drawProgress(phone, progressY, options.progressOpen || false, options.progressCount || 0);
  } else {
    makeRect(phone, "Completed hero accent", 16, 200, 4, 100, {
      fill: TOKENS.success,
      radius: 2
    });
    await makeText(phone, "Completed page title", "本次任务已完成", 36, 198, 260, {
      size: 22,
      weight: 700,
      lineHeight: 32
    });
    await makeText(phone, "Completed page body", "已完成 3 步，任务会移入已完成列表。", 36, 240, 280, {
      size: 15,
      color: TOKENS.textSecondary,
      lineHeight: 24
    });
    await drawProgress(phone, 332, true, 3);
  }
}

async function createStateBoards(page) {
  const startX = 80;
  const startY = 80;
  const gapX = 460;
  const gapY = 980;
  const cells = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      cells.push({ x: startX + col * gapX, y: startY + row * gapY });
    }
  }

  await drawPhone(page, "列表 / 空任务", "tasks.length === 0", cells[0].x, cells[0].y, async (phone) => {
    await drawHeader(phone, { title: "我的任务" });
    await drawEmptyTasks(phone, "还没有任务", "创建一个任务，让 AI 帮你迈出第一步。");
  });

  await drawPhone(page, "列表 / 进行中任务", "activeTasks + completed collapsed", cells[1].x, cells[1].y, async (phone) => {
    await drawHeader(phone, { title: "我的任务" });
    await drawTaskListFilled(phone);
  });

  await drawPhone(page, "列表 / 已完成展开", "activeTasks.length === 0 + completedOpen", cells[2].x, cells[2].y, async (phone) => {
    await drawHeader(phone, { title: "我的任务" });
    await drawOnlyCompletedList(phone);
  });

  await drawPhone(page, "列表 / 长按操作", "task action sheet", cells[3].x, cells[3].y, async (phone) => {
    await drawHeader(phone, { title: "我的任务" });
    await drawTaskListFilled(phone);
    await drawActionSheetOverlay(phone);
  });

  await drawPhone(page, "列表 / 删除确认", "alertdialog", cells[4].x, cells[4].y, async (phone) => {
    await drawHeader(phone, { title: "我的任务" });
    await drawTaskListFilled(phone);
    await drawDeleteDialogOverlay(phone);
  });

  await drawPhone(page, "执行 / Idle 输入", "APP_STATUS.IDLE", cells[5].x, cells[5].y, async (phone) => {
    await drawExecutionState(phone, "idle", { progressOffset: 286 });
  });

  await drawPhone(page, "执行 / Loading", "生成第一步", cells[6].x, cells[6].y, async (phone) => {
    await drawExecutionState(phone, "loading");
  });

  await drawPhone(page, "执行 / Ready 普通步骤", "可开始执行", cells[7].x, cells[7].y, async (phone) => {
    await drawExecutionState(phone, "ready", { progressCount: 1 });
  });

  await drawPhone(page, "执行 / 澄清问题", "step_type === clarification", cells[8].x, cells[8].y, async (phone) => {
    await drawExecutionState(phone, "clarification", { progressCount: 0 });
  });

  await drawPhone(page, "执行 / 完成确认", "completion_confirmation", cells[9].x, cells[9].y, async (phone) => {
    await drawExecutionState(phone, "completion", { progressCount: 2 });
  });

  await drawPhone(page, "执行 / 收尾清单", "closing_checklist", cells[10].x, cells[10].y, async (phone) => {
    await drawExecutionState(phone, "checklist", { progressCount: 2 });
  });

  await drawPhone(page, "执行 / 执行中", "APP_STATUS.EXECUTING", cells[11].x, cells[11].y, async (phone) => {
    await drawExecutionState(phone, "executing", { progressCount: 1 });
  });

  await drawPhone(page, "执行 / 卡点面板", "resistancePanelOpen", cells[12].x, cells[12].y, async (phone) => {
    await drawExecutionState(phone, "resistance", { progressOffset: 720, progressCount: 1 });
  });

  await drawPhone(page, "执行 / 卡点生成中", "isResolvingResistance", cells[13].x, cells[13].y, async (phone) => {
    await drawExecutionState(phone, "resolving", { progressCount: 1 });
  });

  await drawPhone(page, "执行 / 暂停恢复", "APP_STATUS.PAUSED", cells[14].x, cells[14].y, async (phone) => {
    await drawExecutionState(phone, "paused", { progressCount: 2 });
  });

  await drawPhone(page, "执行 / 已退出", "APP_STATUS.EXITED", cells[15].x, cells[15].y, async (phone) => {
    await drawExecutionState(phone, "exited", { progressCount: 2 });
  });

  await drawPhone(page, "执行 / 已完成页", "APP_STATUS.COMPLETED", cells[16].x, cells[16].y, async (phone) => {
    await drawExecutionState(phone, "completed");
  });

  await drawPhone(page, "组件 / 错误提示", "inline-error", cells[17].x, cells[17].y, async (phone) => {
    await drawHeader(phone, { back: true });
    await drawTaskPanel(phone, "active", 82);
    await drawStepCard(phone, 16, 194, "error");
    await drawProgress(phone, 610, false, 1);
  });

  await drawPhone(page, "组件 / StepCard 完成态", "component branch coverage", cells[18].x, cells[18].y, async (phone) => {
    await drawHeader(phone, { back: true });
    await drawTaskPanel(phone, "completed", 82);
    await drawStepCard(phone, 16, 194, "completed");
    await drawProgress(phone, 530, true, 3);
  });
}

async function createDesignSystemPage(page) {
  await makeText(page, "Design system title", "AI Task Runner Design System", 80, 80, 520, {
    size: 28,
    weight: 700,
    lineHeight: 38
  });
  await makeText(
    page,
    "Design system intro",
    "从 client/src/App.css 与 React 状态分支提取。所有色块、按钮、状态胶囊、任务列表项和 StepCard 结构都是原生可编辑图层。",
    80,
    124,
    760,
    { size: 15, color: TOKENS.textSecondary, lineHeight: 24 }
  );

  await makeText(page, "Color section", "Colors", 80, 190, 180, {
    size: 18,
    weight: 700,
    lineHeight: 26
  });
  const swatches = [
    ["Primary", TOKENS.primary],
    ["Primary Hover", TOKENS.primaryHover],
    ["Secondary", TOKENS.secondary],
    ["Background", TOKENS.background],
    ["Card", TOKENS.card],
    ["Text", TOKENS.text],
    ["Text Secondary", TOKENS.textSecondary],
    ["Border", TOKENS.border],
    ["Hover", TOKENS.hover],
    ["Success BG", TOKENS.successBg],
    ["Warning BG", TOKENS.warningBg],
    ["Error BG", TOKENS.errorBg]
  ];
  for (let i = 0; i < swatches.length; i += 1) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 80 + col * 200;
    const y = 230 + row * 82;
    makeRect(page, `Swatch / ${swatches[i][0]}`, x, y, 48, 48, {
      fill: swatches[i][1],
      stroke: TOKENS.border,
      radius: 10
    });
    await makeText(page, `Swatch label / ${swatches[i][0]}`, swatches[i][0], x + 62, y + 2, 120, {
      size: 13,
      weight: 700,
      lineHeight: 20
    });
    await makeText(page, `Swatch value / ${swatches[i][0]}`, swatches[i][1], x + 62, y + 24, 120, {
      size: 12,
      color: TOKENS.textSecondary,
      lineHeight: 18
    });
  }

  await makeText(page, "Controls section", "Controls", 80, 520, 180, {
    size: 18,
    weight: 700,
    lineHeight: 26
  });
  await drawButton(page, "Button / Primary", "生成第一步", 80, 566, 180, "primary");
  await drawButton(page, "Button / Secondary", "返回我的任务", 280, 566, 180, "secondary");
  await drawButton(page, "Button / Danger", "删除任务", 480, 566, 180, "danger");
  await drawButton(page, "Button / Disabled", "生成中", 680, 566, 180, "primary", {
    disabled: true
  });

  await makeText(page, "Status section", "Status Pills", 80, 660, 180, {
    size: 18,
    weight: 700,
    lineHeight: 26
  });
  await drawPill(page, "Pill / Neutral", "待输入", 80, 706, "neutral", 76);
  await drawPill(page, "Pill / Active", "可执行", 176, 706, "active", 76);
  await drawPill(page, "Pill / Success", "已完成", 272, 706, "success", 76);
  await drawPill(page, "Pill / Warning", "已暂停", 368, 706, "warning", 76);
  await drawPill(page, "Pill / Error", "错误", 464, 706, "error", 64);

  await makeText(page, "Component section", "Reusable Patterns", 80, 800, 220, {
    size: 18,
    weight: 700,
    lineHeight: 26
  });
  await drawTaskItem(
    page,
    {
      title: "写作品集项目介绍",
      summary: "可执行 - 第 2 步 - 补一个粗略的小标题",
      tone: "active",
      icon: "•",
      time: "刚刚"
    },
    80,
    846,
    { important: true }
  );
  await drawStepCard(page, 480, 820, "ready");
  await drawStepCard(page, 880, 820, "resistance");

  await makeText(page, "Branch coverage section", "Branch Coverage Details", 80, 1560, 280, {
    size: 18,
    weight: 700,
    lineHeight: 26
  });
  await makeText(
    page,
    "Branch coverage note",
    "覆盖代码里的细分文案分支：重复步骤确认、简单任务确认、普通完成确认，以及已完成任务的操作 sheet。",
    80,
    1594,
    720,
    { size: 14, color: TOKENS.textSecondary, lineHeight: 22 }
  );
  await drawButton(page, "Completion action / duplicate", "跳过重复点", 80, 1646, 180, "primary");
  await drawButton(page, "Completion action / simple", "已经完成", 280, 1646, 180, "primary");
  await drawButton(page, "Completion action / normal", "标记整个任务完成", 480, 1646, 200, "primary");
  await drawButton(page, "Completion action / continue", "还差一步", 700, 1646, 180, "secondary");

  const completedSheet = makeFrame(page, "Completed task action sheet variant", 80, 1738, 354, 116, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 16,
    shadow: "modal"
  });
  await makeText(completedSheet, "Completed sheet title", "复习英语单词", 16, 16, 300, {
    size: 14,
    weight: 700,
    color: TOKENS.textSecondary,
    lineHeight: 22
  });
  await drawButton(completedSheet, "Completed sheet delete", "删除任务", 12, 48, 330, "danger", {
    height: 40,
    radius: 14,
    size: 14
  });
  await makeText(completedSheet, "Completed sheet cancel", "取消", 26, 91, 120, {
    size: 14,
    weight: 700,
    lineHeight: 20
  });

  await makeText(page, "Task list status section", "Task List Status Variants", 520, 1738, 280, {
    size: 18,
    weight: 700,
    lineHeight: 26
  });
  await drawTaskItem(
    page,
    {
      title: "未命名任务",
      summary: "待输入 - 第 1 步 - 等待生成第一步",
      tone: "neutral",
      icon: "○",
      time: "刚刚"
    },
    520,
    1784
  );
  await drawTaskItem(
    page,
    {
      title: "准备产品演示",
      summary: "生成中 - 第 1 步 - 正在生成第一步",
      tone: "active",
      icon: "•",
      time: "1 分钟"
    },
    520,
    1868
  );
  await drawTaskItem(
    page,
    {
      title: "提交申请材料",
      summary: "已退出 - 已完成 1 步 - 上下文已保留",
      tone: "neutral",
      icon: "○",
      time: "今天"
    },
    520,
    1952
  );
}

async function getBatchPage(name) {
  const existing = figma.root.children.find((page) => page.name === name);
  if (existing) {
    await setCurrentPage(existing);
    return existing;
  }

  const page = figma.createPage();
  page.name = name;
  await setCurrentPage(page);
  return page;
}

function makeCells(startX, startY, count, columns = 3, gapX = 460, gapY = 980) {
  return Array.from({ length: count }, (_, index) => ({
    x: startX + (index % columns) * gapX,
    y: startY + Math.floor(index / columns) * gapY
  }));
}

async function drawListHeaderSafe(phone) {
  await safeText(phone, "Page title", "我的任务", 24, 30, 180, 24, 700, TOKENS.text, 32);
  safeEllipse(phone, "Create task button", 324, 28, 42, TOKENS.card);
  await safeText(phone, "Create plus", "+", 336, 31, 20, 28, 700, TOKENS.text, 34);
}

async function drawTaskRowSafe(parent, y, title, summary, tone = "active", important = false) {
  const fill = important ? TOKENS.importantBg : TOKENS.card;
  const stroke = important ? TOKENS.importantBorder : TOKENS.border;
  const row = safeFrame(parent, `Task row / ${title}`, 24, y, 342, 72, fill, stroke, 14);
  const iconColor = tone === "warning" ? TOKENS.warning : tone === "success" ? TOKENS.success : TOKENS.primary;
  await safeText(row, "Task status icon", tone === "warning" ? "!" : "•", 12, 15, 22, 18, 700, iconColor, 24);
  await safeText(row, "Task title", `${important ? "★ " : ""}${title}`, 40, 13, 260, 15, 700, TOKENS.text, 22);
  await safeText(row, "Task summary", summary, 40, 40, 220, 13, 400, TOKENS.textSecondary, 20);
  await safeText(row, "Task time", "刚刚", 282, 40, 44, 13, 600, TOKENS.textSecondary, 20);
}

async function drawCompletedSafe(parent, y, open = false) {
  const height = open ? 204 : 64;
  const card = safeFrame(parent, open ? "Completed tasks expanded" : "Completed tasks collapsed", 24, y, 342, height, TOKENS.card, TOKENS.border, 12);
  await safeText(card, "Completed title", "已完成任务", 20, 19, 160, 14, 700, TOKENS.text, 22);
  await safeText(card, "Completed count", "2 个  >", 252, 19, 70, 13, 700, TOKENS.textSecondary, 20);
  if (!open) return;

  const row1 = safeFrame(card, "Completed row 1", 8, 58, 326, 56, "#FBFDFF", null, 16);
  await safeText(row1, "Completed row title", "整理作品集文案", 12, 17, 190, 14, 700, TOKENS.text, 22);
  safeRect(row1, "Completed pill", 228, 15, 76, 28, TOKENS.successBg, null, 14);
  await safeText(row1, "Completed pill label", "已完成", 244, 20, 48, 13, 600, "#0F766E", 18);

  const row2 = safeFrame(card, "Completed row 2", 8, 120, 326, 56, "#FBFDFF", null, 16);
  await safeText(row2, "Completed row title", "复习英语单词", 12, 17, 190, 14, 700, TOKENS.text, 22);
  safeRect(row2, "Completed pill", 228, 15, 76, 28, TOKENS.successBg, null, 14);
  await safeText(row2, "Completed pill label", "已完成", 244, 20, 48, 13, 600, "#0F766E", 18);
}

async function drawListContentSafe(phone, variant) {
  await drawListHeaderSafe(phone);

  if (variant === "empty") {
    const card = safeFrame(phone, "Empty task state card", 24, 92, 342, 180, TOKENS.card, TOKENS.border, 12);
    await safeText(card, "Empty title", "还没有任务", 116, 42, 110, 18, 700, TOKENS.text, 28);
    await safeText(card, "Empty body", "创建一个任务，让 AI 帮你迈出第一步。", 54, 78, 234, 15, 400, TOKENS.textSecondary, 24);
    safeRect(card, "Primary button", 24, 118, 294, 50, TOKENS.primary, TOKENS.primary, 25);
    await safeText(card, "Primary button label", "创建第一个任务", 112, 132, 120, 15, 700, TOKENS.white, 20);
    return;
  }

  if (variant === "completed-open") {
    const empty = safeFrame(phone, "No active tasks card", 24, 92, 342, 180, TOKENS.card, TOKENS.border, 12);
    await safeText(empty, "No active tasks title", "暂无未完成任务", 98, 54, 160, 18, 700, TOKENS.text, 28);
    await safeText(empty, "No active tasks body", "新的任务会继续出现在这里。", 76, 92, 210, 15, 400, TOKENS.textSecondary, 24);
    await drawCompletedSafe(phone, 292, true);
    return;
  }

  await safeText(phone, "Task list hint", "长按任务可编辑", 24, 82, 160, 13, 600, TOKENS.textSecondary, 20);
  await drawTaskRowSafe(phone, 112, "写作品集项目介绍", "可执行 - 第 2 步 - 补一个粗略的小标题", "active", true);
  await drawTaskRowSafe(phone, 192, "回复老师消息", "执行中 - 第 1 步 - 先打开草稿", "active", false);
  await drawTaskRowSafe(phone, 272, "整理论文选题", "已暂停 - 第 3 步 - 下次从判断标准开始", "warning", false);
  await drawCompletedSafe(phone, 368, false);

  if (variant === "action-sheet") {
    safeRect(phone, "Modal scrim", 0, 0, 390, 844, TOKENS.scrim, null, 0).opacity = 0.34;
    const sheet = safeFrame(phone, "Task action sheet", 18, 666, 354, 160, TOKENS.card, TOKENS.border, 16);
    await safeText(sheet, "Sheet title", "写作品集项目介绍", 16, 16, 260, 14, 700, TOKENS.textSecondary, 22);
    safeRect(sheet, "Important action", 12, 48, 330, 40, TOKENS.card, TOKENS.border, 14);
    await safeText(sheet, "Important action label", "取消重要", 26, 57, 120, 14, 600, TOKENS.text, 20);
    safeRect(sheet, "Delete action", 12, 92, 330, 40, TOKENS.card, "#FECACA", 14);
    await safeText(sheet, "Delete action label", "删除任务", 26, 101, 120, 14, 600, TOKENS.error, 20);
    await safeText(sheet, "Cancel action", "取消", 26, 136, 80, 14, 600, TOKENS.text, 20);
  }

  if (variant === "delete-dialog") {
    safeRect(phone, "Modal scrim", 0, 0, 390, 844, TOKENS.scrim, null, 0).opacity = 0.34;
    const dialog = safeFrame(phone, "Delete confirm dialog", 34, 328, 322, 188, TOKENS.card, TOKENS.border, 16);
    await safeText(dialog, "Dialog title", "确定删除这个任务吗？", 20, 20, 220, 16, 700, TOKENS.text, 24);
    await safeText(dialog, "Dialog body", "删除后无法恢复。", 20, 56, 200, 15, 400, TOKENS.textSecondary, 24);
    safeRect(dialog, "Cancel button", 20, 118, 132, 48, TOKENS.card, TOKENS.border, 24);
    await safeText(dialog, "Cancel label", "取消", 70, 132, 40, 15, 700, TOKENS.text, 20);
    safeRect(dialog, "Delete button", 170, 118, 132, 48, TOKENS.error, TOKENS.error, 24);
    await safeText(dialog, "Delete label", "删除", 220, 132, 40, 15, 700, TOKENS.white, 20);
  }
}

async function drawListPhoneSafe(page, title, subtitle, x, y, variant) {
  await safeText(page, `Board title / ${title}`, title, x, y, 360, 18, 700, TOKENS.text, 26);
  await safeText(page, `Board subtitle / ${title}`, subtitle, x, y + 28, 360, 12, 500, TOKENS.textSecondary, 18);
  const phone = safeFrame(page, title, x, y + 60, 390, 844, TOKENS.background, "#ECEAF7", 0);
  await drawListContentSafe(phone, variant);
  return phone;
}

async function createListStateBatch(page) {
  const cells = makeCells(80, 80, 5, 3);

  markStage("list / empty task");
  await drawListPhoneSafe(page, "列表 / 空任务", "tasks.length === 0", cells[0].x, cells[0].y, "empty");

  markStage("list / active tasks");
  await drawListPhoneSafe(page, "列表 / 进行中任务", "activeTasks + completed collapsed", cells[1].x, cells[1].y, "active");

  markStage("list / completed expanded");
  await drawListPhoneSafe(page, "列表 / 已完成展开", "activeTasks.length === 0 + completedOpen", cells[2].x, cells[2].y, "completed-open");

  markStage("list / action sheet");
  await drawListPhoneSafe(page, "列表 / 长按操作", "task action sheet", cells[3].x, cells[3].y, "action-sheet");

  markStage("list / delete dialog");
  await drawListPhoneSafe(page, "列表 / 删除确认", "alertdialog", cells[4].x, cells[4].y, "delete-dialog");
}

async function createExecutionBatchA(page) {
  const cells = makeCells(80, 80, 6, 3);
  const boards = [
    ["执行 / Idle 输入", "APP_STATUS.IDLE", "idle", { progressOffset: 286 }],
    ["执行 / Loading", "生成第一步", "loading", {}],
    ["执行 / Ready 普通步骤", "可开始执行", "ready", { progressCount: 1 }],
    ["执行 / 澄清问题", "step_type === clarification", "clarification", { progressCount: 0 }],
    ["执行 / 完成确认", "completion_confirmation", "completion", { progressCount: 2 }],
    ["执行 / 收尾清单", "closing_checklist", "checklist", { progressCount: 2 }]
  ];

  for (let index = 0; index < boards.length; index += 1) {
    const [title, subtitle, status, options] = boards[index];
    markStage(`execution A / ${status}`);
    await drawPhone(page, title, subtitle, cells[index].x, cells[index].y, async (phone) => {
      await drawExecutionState(phone, status, options);
    });
  }
}

async function createExecutionBatchB(page) {
  const cells = makeCells(80, 80, 8, 3);
  const boards = [
    ["执行 / 执行中", "APP_STATUS.EXECUTING", "executing", { progressCount: 1 }],
    ["执行 / 卡点面板", "resistancePanelOpen", "resistance", { progressOffset: 720, progressCount: 1 }],
    ["执行 / 卡点生成中", "isResolvingResistance", "resolving", { progressCount: 1 }],
    ["执行 / 暂停恢复", "APP_STATUS.PAUSED", "paused", { progressCount: 2 }],
    ["执行 / 已退出", "APP_STATUS.EXITED", "exited", { progressCount: 2 }],
    ["执行 / 已完成页", "APP_STATUS.COMPLETED", "completed", {}],
    ["组件 / 错误提示", "inline-error", "error", { progressCount: 1 }],
    ["组件 / StepCard 完成态", "component branch coverage", "completed-card", {}]
  ];

  for (let index = 0; index < boards.length; index += 1) {
    const [title, subtitle, status, options] = boards[index];
    markStage(`execution B / ${status}`);
    await drawPhone(page, title, subtitle, cells[index].x, cells[index].y, async (phone) => {
      if (status === "completed-card") {
        await drawHeader(phone, { back: true });
        await drawTaskPanel(phone, "completed", 82);
        await drawStepCard(phone, 16, 194, "completed");
        await drawProgress(phone, 530, true, 3);
        return;
      }
      await drawExecutionState(phone, status, options);
    });
  }
}

async function createErrorReport(error) {
  try {
    if (!FONTS) {
      await prepareFonts();
    }
    const message = error && error.stack ? error.stack : error.message || String(error);
    const frame = makeFrame(figma.currentPage, "AI Task Runner Import Error", 80, 80, 560, 220, {
      fill: TOKENS.errorBg,
      stroke: TOKENS.error,
      radius: 12
    });
    await makeText(frame, "Error title", "主导入器运行失败", 24, 24, 420, {
      size: 20,
      weight: 700,
      color: TOKENS.error,
      lineHeight: 30
    });
    await makeText(frame, "Error stage", `失败阶段：${CURRENT_STAGE}`, 24, 66, 500, {
      size: 14,
      weight: 700,
      color: TOKENS.text,
      lineHeight: 22
    });
    await makeText(frame, "Error message", String(message).slice(0, 360), 24, 100, 500, {
      size: 12,
      color: TOKENS.textSecondary,
      lineHeight: 18
    });
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
  } catch {
    // If the error reporter itself fails, fall back to closePlugin only.
  }
}

async function build() {
  await prepareFonts();

  const statesPage = figma.createPage();
  statesPage.name = "AI Task Runner - All UI States";
  await setCurrentPage(statesPage);
  await createStateBoards(statesPage);

  const systemPage = figma.createPage();
  systemPage.name = "Design Tokens + Components";
  await setCurrentPage(systemPage);
  await createDesignSystemPage(systemPage);

  await setCurrentPage(statesPage);
  const firstFrame = statesPage.children.find((node) => node.type === "FRAME");
  if (firstFrame) {
    figma.currentPage.selection = [firstFrame];
    figma.viewport.scrollAndZoomIntoView([firstFrame]);
  }
  figma.closePlugin("AI Task Runner 全状态可编辑 UI 已生成。");
}

async function runImporter() {
  const command = figma.command || "list-states";
  await prepareFonts();

  if (command === "list-states" || command === "all") {
    markStage("creating list states on current page");
    await createListStateBatch(figma.currentPage);
  }

  if (command === "execution-a" || command === "all") {
    markStage("creating execution states A page");
    const executionAPage = await getBatchPage("AI Task Runner - 2 Execution States A");
    await createExecutionBatchA(executionAPage);
  }

  if (command === "execution-b" || command === "all") {
    markStage("creating execution states B page");
    const executionBPage = await getBatchPage("AI Task Runner - 3 Execution States B");
    await createExecutionBatchB(executionBPage);
  }

  if (command === "design-system" || command === "all") {
    markStage("creating design system page");
    const systemPage = await getBatchPage("AI Task Runner - 4 Tokens + Components");
    await createDesignSystemPage(systemPage);
  }

  const firstFrame = figma.currentPage.children.find((node) => node.type === "FRAME");
  if (firstFrame) {
    figma.currentPage.selection = [firstFrame];
    figma.viewport.scrollAndZoomIntoView([firstFrame]);
  }
  figma.closePlugin(`AI Task Runner import finished: ${command}`);
}

runImporter().catch((error) => {
  console.error(error);
  const message = error && error.stack ? error.stack : error.message;
  createErrorReport(error).finally(() => {
    figma.closePlugin(`Import failed at ${CURRENT_STAGE}: ${String(message).slice(0, 220)}`);
  });
});
