async function loadAnyFont() {
  const fonts = await figma.listAvailableFontsAsync();
  const preferred =
    fonts.find((font) => font.fontName.family === "Inter" && font.fontName.style === "Regular") ||
    fonts.find((font) => font.fontName.style === "Regular") ||
    fonts[0];

  if (!preferred) {
    throw new Error("No fonts are available in this Figma file.");
  }

  await figma.loadFontAsync(preferred.fontName);
  return preferred.fontName;
}

async function buildSmokeTest() {
  const fontName = await loadAnyFont();

  const frame = figma.createFrame();
  frame.name = "AI Task Runner Import Smoke Test";
  frame.x = 80;
  frame.y = 80;
  frame.resize(390, 240);
  frame.fills = [{ type: "SOLID", color: { r: 246 / 255, g: 244 / 255, b: 252 / 255 } }];

  const card = figma.createFrame();
  card.name = "Editable card";
  card.x = 24;
  card.y = 40;
  card.resize(342, 144);
  card.cornerRadius = 12;
  card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  card.strokes = [{ type: "SOLID", color: { r: 222 / 255, g: 220 / 255, b: 240 / 255 } }];
  card.strokeWeight = 1;
  frame.appendChild(card);

  const title = figma.createText();
  title.name = "Editable title";
  title.fontName = fontName;
  title.fontSize = 20;
  title.lineHeight = { unit: "PIXELS", value: 30 };
  title.fills = [{ type: "SOLID", color: { r: 17 / 255, g: 24 / 255, b: 39 / 255 } }];
  title.x = 20;
  title.y = 24;
  title.resize(300, 32);
  title.characters = "导入环境正常";
  card.appendChild(title);

  const body = figma.createText();
  body.name = "Editable body";
  body.fontName = fontName;
  body.fontSize = 14;
  body.lineHeight = { unit: "PIXELS", value: 22 };
  body.fills = [{ type: "SOLID", color: { r: 95 / 255, g: 111 / 255, b: 138 / 255 } }];
  body.x = 20;
  body.y = 68;
  body.resize(300, 48);
  body.characters = "如果你能看到这个画板，说明本地 manifest 插件可以正常运行。";
  card.appendChild(body);

  figma.currentPage.appendChild(frame);
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  figma.closePlugin("Smoke test created.");
}

buildSmokeTest().catch((error) => {
  console.error(error);
  const message = error && error.stack ? error.stack : error.message;
  figma.closePlugin(`Smoke test failed: ${String(message).slice(0, 260)}`);
});
