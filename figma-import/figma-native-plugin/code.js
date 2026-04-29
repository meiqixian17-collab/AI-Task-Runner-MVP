const TOKENS = {
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  secondary: "#0F766E",
  background: "#F6F8FB",
  card: "#FFFFFF",
  text: "#111827",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  hover: "#EFF6FF",
  successBg: "#ECFDF5",
  warningBg: "#FFFBEB",
  blueBorder: "#BFDBFE",
  input: "#FBFDFF",
  muted: "#F8FAFC",
  blueSoft: "#DBEAFE"
};

function rgb(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255
  };
}

function solid(hex) {
  return [{ type: "SOLID", color: rgb(hex) }];
}

function setTextStyle(node, size, weight = 400, color = TOKENS.text, lineHeight = null) {
  node.fontName = { family: "Inter", style: weight >= 700 ? "Bold" : weight >= 600 ? "Semi Bold" : "Regular" };
  node.fontSize = size;
  node.fills = solid(color);
  node.lineHeight = lineHeight ? { unit: "PIXELS", value: lineHeight } : { unit: "AUTO" };
  node.letterSpacing = { unit: "PIXELS", value: 0 };
}

function makeFrame(parent, name, x, y, w, h, options = {}) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.resize(w, h);
  frame.fills = solid(options.fill || TOKENS.card);
  frame.strokes = options.stroke ? solid(options.stroke) : [];
  frame.strokeWeight = options.stroke ? 1 : 0;
  frame.cornerRadius = options.radius || 0;
  frame.clipsContent = false;
  if (options.shadow) {
    frame.effects = [
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
    ];
  }
  parent.appendChild(frame);
  return frame;
}

function makeRect(parent, name, x, y, w, h, options = {}) {
  const rect = figma.createRectangle();
  rect.name = name;
  rect.x = x;
  rect.y = y;
  rect.resize(w, h);
  rect.fills = solid(options.fill || TOKENS.card);
  rect.strokes = options.stroke ? solid(options.stroke) : [];
  rect.strokeWeight = options.stroke ? 1 : 0;
  rect.cornerRadius = options.radius || 0;
  parent.appendChild(rect);
  return rect;
}

async function makeText(parent, name, text, x, y, w, options = {}) {
  const node = figma.createText();
  node.name = name;
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  node.resize(w, 24);
  node.characters = text;
  setTextStyle(
    node,
    options.size || 15,
    options.weight || 400,
    options.color || TOKENS.text,
    options.lineHeight || null
  );
  if (options.align) node.textAlignHorizontal = options.align;
  if (options.autoHeight !== false) node.textAutoResize = "HEIGHT";
  return node;
}

async function build() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  const page = figma.currentPage;
  const root = makeFrame(page, "AI Task Runner - Editable Desktop UI", 120, 80, 1440, 900, {
    fill: TOKENS.background
  });

  const content = makeFrame(root, "Page Content", 130, 32, 1180, 780, {
    fill: TOKENS.background
  });

  await makeText(content, "Eyebrow", "AI Task Runner", 0, 0, 240, {
    size: 13,
    weight: 700,
    color: TOKENS.primary,
    lineHeight: 20
  });
  await makeText(content, "Page Title", "把任务推进到下一步", 0, 24, 520, {
    size: 24,
    weight: 700,
    lineHeight: 32
  });
  await makeText(
    content,
    "Subtitle",
    "输入一件想推进的事，系统会把它压缩成当前最容易开始的一小步。",
    0,
    64,
    600,
    { size: 15, color: TOKENS.textSecondary, lineHeight: 24 }
  );

  makeRect(content, "Status Pill / idle", 1054, 0, 76, 30, {
    fill: TOKENS.muted,
    stroke: TOKENS.border,
    radius: 15
  });
  await makeText(content, "Status Text", "待输入", 1070, 6, 46, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 18
  });

  const task = makeFrame(content, "Task Input Panel", 0, 112, 330, 392, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 8,
    shadow: true
  });
  await makeText(task, "Section Kicker", "任务输入", 18, 18, 180, {
    size: 13,
    weight: 700,
    color: TOKENS.primary,
    lineHeight: 20
  });
  await makeText(task, "Section Title", "今天先推进什么？", 18, 42, 220, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  await makeText(task, "Field Label", "待推进任务", 18, 82, 160, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 20
  });
  makeRect(task, "Textarea", 18, 120, 294, 120, {
    fill: TOKENS.input,
    stroke: TOKENS.border,
    radius: 8
  });
  await makeText(task, "Textarea Placeholder", "例如：准备一次产品演示，\n先搭出演示大纲", 34, 140, 250, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 24
  });
  await makeText(task, "Field Help", "保持自然语言描述即可，越具体\n越容易生成可执行步骤。", 18, 258, 285, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 24
  });
  makeRect(task, "Secondary Button", 18, 324, 294, 50, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 8
  });
  await makeText(task, "Secondary Button Label", "生成第一步", 18, 339, 294, {
    size: 15,
    weight: 700,
    align: "CENTER",
    lineHeight: 20
  });

  const action = makeFrame(content, "Current Action Card", 342, 112, 482, 430, {
    fill: TOKENS.card,
    stroke: TOKENS.blueBorder,
    radius: 8,
    shadow: true
  });
  await makeText(action, "Section Kicker", "当前行动", 24, 24, 180, {
    size: 13,
    weight: 700,
    color: TOKENS.primary,
    lineHeight: 20
  });
  await makeText(action, "Card Title", "先写下一件事", 24, 48, 240, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  makeRect(action, "Step Index Pill", 384, 24, 74, 30, {
    fill: TOKENS.muted,
    stroke: TOKENS.border,
    radius: 15
  });
  await makeText(action, "Step Index Text", "第 1 步", 398, 30, 48, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 18
  });
  await makeText(action, "Intro", "系统会把它拆成一个低阻力、能立刻开始的动作。", 24, 92, 430, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 24
  });
  makeRect(action, "Empty Panel Accent", 24, 151, 4, 76, {
    fill: TOKENS.border,
    radius: 2
  });
  await makeText(action, "Empty Panel Text", "输入任务后，行动卡会显示唯一优先的下一步。", 44, 166, 390, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 24
  });
  makeRect(action, "Step Focus Background", 24, 253, 434, 98, {
    fill: TOKENS.muted
  });
  makeRect(action, "Step Focus Accent", 24, 253, 4, 98, {
    fill: TOKENS.primary,
    radius: 2
  });
  await makeText(action, "Step Focus State", "准备执行", 44, 272, 80, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 20
  });
  makeRect(action, "AI Badge", 116, 263, 72, 28, {
    fill: TOKENS.hover,
    radius: 14
  });
  await makeText(action, "AI Badge Text", "AI 返回", 136, 269, 48, {
    size: 13,
    weight: 600,
    color: TOKENS.primary,
    lineHeight: 18
  });
  await makeText(action, "Current Step Text", "打开文档，先写下标题和一个小标题。", 44, 308, 390, {
    size: 22,
    weight: 700,
    lineHeight: 34
  });
  makeRect(action, "Primary Button", 24, 363, 434, 48, {
    fill: TOKENS.primary,
    stroke: TOKENS.primary,
    radius: 8
  });
  await makeText(action, "Primary Button Label", "开始执行", 24, 377, 434, {
    size: 15,
    weight: 700,
    color: "#FFFFFF",
    align: "CENTER",
    lineHeight: 20
  });

  const progress = makeFrame(content, "Progress Panel", 836, 112, 294, 300, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 8,
    shadow: true
  });
  await makeText(progress, "Section Kicker", "推进记录", 18, 18, 180, {
    size: 13,
    weight: 700,
    color: TOKENS.primary,
    lineHeight: 20
  });
  await makeText(progress, "Section Title", "当前进度", 18, 42, 160, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  makeRect(progress, "Current Step Metric Accent", 18, 96, 3, 50, {
    fill: TOKENS.border,
    radius: 2
  });
  await makeText(progress, "Current Step Label", "当前步骤", 31, 96, 90, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 20
  });
  await makeText(progress, "Current Step Value", "第 1 步", 31, 122, 100, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  makeRect(progress, "Completed Metric Accent", 151, 96, 3, 50, {
    fill: TOKENS.border,
    radius: 2
  });
  await makeText(progress, "Completed Label", "已完成", 164, 96, 80, {
    size: 13,
    weight: 600,
    color: TOKENS.textSecondary,
    lineHeight: 20
  });
  await makeText(progress, "Completed Value", "0 步", 164, 122, 80, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  makeRect(progress, "Empty Timeline Accent", 18, 182, 3, 60, {
    fill: TOKENS.border,
    radius: 2
  });
  await makeText(progress, "Empty Timeline Text", "完成第一步后，这里会形成\n清晰的推进轨迹。", 31, 178, 230, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 24
  });

  await makeText(content, "Component Kicker", "关键状态组件", 0, 626, 200, {
    size: 13,
    weight: 700,
    color: TOKENS.primary,
    lineHeight: 20
  });
  await makeText(
    content,
    "Component Description",
    "从代码里提取的按钮、状态、抗阻力面板和时间线样式，方便在 Figma 中继续组件化。",
    0,
    652,
    760,
    { size: 15, color: TOKENS.textSecondary, lineHeight: 24 }
  );

  const pillData = [
    ["待输入", TOKENS.muted, TOKENS.textSecondary, 0],
    ["生成中", TOKENS.hover, TOKENS.primary, 90],
    ["已完成", TOKENS.successBg, TOKENS.secondary, 180],
    ["已暂停", TOKENS.warningBg, "#B45309", 270]
  ];
  for (const [label, fill, color, x] of pillData) {
    makeRect(content, `Status Pill / ${label}`, x, 702, 78, 30, {
      fill,
      stroke: label === "待输入" ? TOKENS.border : null,
      radius: 15
    });
    await makeText(content, `Status Pill Label / ${label}`, label, x + 18, 708, 46, {
      size: 13,
      weight: 600,
      color,
      lineHeight: 18
    });
  }

  const resistance = makeFrame(content, "Resistance Panel Component", 424, 696, 360, 190, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 8,
    shadow: true
  });
  makeRect(resistance, "Panel Accent", 18, 22, 4, 146, { fill: TOKENS.blueSoft, radius: 2 });
  await makeText(resistance, "Panel Title", "卡住在哪里？", 36, 24, 160, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  makeRect(resistance, "Resistance Input", 36, 64, 250, 44, {
    fill: TOKENS.input,
    stroke: TOKENS.border,
    radius: 8
  });
  await makeText(resistance, "Resistance Placeholder", "比如：我怕老师骂我", 48, 75, 210, {
    size: 15,
    color: TOKENS.textSecondary,
    lineHeight: 22
  });
  makeRect(resistance, "Send Button", 296, 64, 44, 44, {
    fill: TOKENS.primary,
    stroke: TOKENS.primary,
    radius: 22
  });
  await makeText(resistance, "Send Button Icon", "→", 296, 73, 44, {
    size: 18,
    weight: 700,
    color: "#FFFFFF",
    align: "CENTER",
    lineHeight: 22
  });
  await makeText(resistance, "Options Title", "或者直接选择一种情况", 36, 116, 240, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  makeRect(resistance, "Option Button / too hard", 36, 148, 140, 32, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 8
  });
  await makeText(resistance, "Option Label / too hard", "这一步太难了", 48, 155, 112, {
    size: 13,
    weight: 600,
    lineHeight: 18
  });
  makeRect(resistance, "Option Button / dont want", 188, 148, 140, 32, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 8
  });
  await makeText(resistance, "Option Label / dont want", "我就是不想做", 200, 155, 112, {
    size: 13,
    weight: 600,
    lineHeight: 18
  });

  const timeline = makeFrame(content, "Timeline Component", 820, 696, 310, 190, {
    fill: TOKENS.card,
    stroke: TOKENS.border,
    radius: 8,
    shadow: true
  });
  await makeText(timeline, "Timeline Title", "推进轨迹示例", 18, 18, 160, {
    size: 16,
    weight: 700,
    lineHeight: 24
  });
  const items = [
    "打开文档，先写下标题。",
    "补一个粗略的小标题。",
    "继续生成下一步。"
  ];
  for (let i = 0; i < items.length; i += 1) {
    const cy = 76 + i * 46;
    const circle = figma.createEllipse();
    circle.name = `Timeline Number / ${i + 1}`;
    circle.x = 20;
    circle.y = cy - 14;
    circle.resize(28, 28);
    circle.fills = solid(TOKENS.successBg);
    timeline.appendChild(circle);
    await makeText(timeline, `Timeline Number Label / ${i + 1}`, String(i + 1), 20, cy - 9, 28, {
      size: 13,
      weight: 700,
      color: TOKENS.secondary,
      align: "CENTER",
      lineHeight: 18
    });
    await makeText(timeline, `Timeline Text / ${i + 1}`, items[i], 58, cy - 11, 220, {
      size: 15,
      color: TOKENS.textSecondary,
      lineHeight: 22
    });
  }

  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.closePlugin("AI Task Runner editable UI created.");
}

build().catch((error) => {
  figma.closePlugin(`Import failed: ${error.message}`);
});
