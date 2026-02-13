import { getState, Mode, getCurrentScreen } from "./state.js";
import { renderElements } from "./ui.js";

// ---------------------------------------------------------
// Main draw function
// ---------------------------------------------------------
function draw(ctx, w, h) {
  const state = getState();
  const screen = getCurrentScreen();

  ctx.clearRect(0, 0, w, h);

  // Background always draws first
  drawBackground(ctx, w, h);

  if (!screen) return;

  // Handle different screen types
  switch (screen.type) {
    case "splash":
      state.currentButtons = renderElements(ctx, screen, w, h);
      break;

    case "ui":
      state.currentButtons = renderElements(ctx, screen, w, h);
      break;

    case "dialogue":
      drawDialogueBox(ctx, w, h);
      drawDialogue(ctx, screen, state.dialogueIndex);
      state.currentButtons = []; // No buttons in dialogue mode
      break;

    case "choices":
      drawDialogueBox(ctx, w, h);
      if (screen.dialogue) {
        drawDialogue(ctx, screen, state.dialogueIndex);
      }
      state.currentButtons = drawChoiceButtons(ctx, screen.elements, w, h);
      break;

    case "timed":
      drawDialogueBox(ctx, w, h);
      if (screen.dialogue) {
        drawDialogue(ctx, screen, state.dialogueIndex);
      }
      state.currentButtons = drawChoiceButtons(ctx, screen.elements, w, h);
      drawTimer(ctx, w, h, state.timeRemaining);
      break;
  }
}

// ---------------------------------------------------------
// Background
// ---------------------------------------------------------
function drawBackground(ctx, w, h) {
  const state = getState();
  const img = state.currentBackground;

  if (!img || !img.complete) return;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const scale = Math.max(viewportW / img.width, viewportH / img.height);

  const scaledW = img.width * scale;
  const scaledH = img.height * scale;

  const offsetX = (viewportW - scaledW) / 2;
  const offsetY = (viewportH - scaledH) / 2;

  const rect = ctx.canvas.getBoundingClientRect();

  ctx.drawImage(img, offsetX - rect.left, offsetY - rect.top, scaledW, scaledH);
}

// ---------------------------------------------------------
// Dialogue Box
// ---------------------------------------------------------
function drawDialogueBox(ctx, w, h) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, h - 200, w, 200);
}

// ---------------------------------------------------------
// Dialogue Text
// ---------------------------------------------------------
function drawDialogue(ctx, screen, index) {
  if (!screen.dialogue || !screen.dialogue[index]) return;

  const line = screen.dialogue[index];

  ctx.fillStyle = "#fff";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "left";

  ctx.fillText(line.speaker + ":", 30, ctx.canvas.height - 160);
  ctx.fillText(line.text, 30, ctx.canvas.height - 120);
}

// ---------------------------------------------------------
// Choice Buttons (from elements array)
// ---------------------------------------------------------
function drawChoiceButtons(ctx, elements, w, h) {
  const buttons = [];

  if (!elements) return buttons;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.type !== "button") continue;

    const x = element.x * w;
    const y = element.y * h;
    const btnWidth = element.width ? element.width * w : w * 0.8;
    const btnHeight = element.height ? element.height * h : 50;

    // Draw button background
    ctx.fillStyle = element.background || "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(x, y, btnWidth, btnHeight);

    // Draw button border
    if (element.border) {
      ctx.strokeStyle = element.borderColor || "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, btnWidth, btnHeight);
    }

    // Draw button text
    ctx.fillStyle = element.color || "#fff";
    ctx.font = element.font || "20px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(element.text, x + 20, y + btnHeight / 2);

    buttons.push({
      action: element.action,
      index: i,
      x,
      y,
      w: btnWidth,
      h: btnHeight,
    });
  }

  return buttons;
}

// ---------------------------------------------------------
// Timer
// ---------------------------------------------------------
function drawTimer(ctx, w, h, timeRemaining) {
  ctx.fillStyle = "red";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "right";

  ctx.fillText(`Time: ${timeRemaining}`, w - 40, h - 160);
}

// ---------------------------------------------------------
export { draw };