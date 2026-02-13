import { getState, Mode, getCurrentScene } from "./state.js";

// ---------------------------------------------------------
// Main draw function
// ---------------------------------------------------------
function draw(ctx, w, h) {
  const state = getState();
  const scene = getCurrentScene();

  ctx.clearRect(0, 0, w, h);

  // Background always draws first
  drawBackground(ctx, w, h);

  // Start screen
  if (state.mode === Mode.START) {
    drawStartScreen(ctx, w, h);
    return;
  }

  if (state.mode === Mode.MENU) {
    state.menuButtons = drawMainMenu(ctx, w, h);
    return;
  }

  // Dialogue box
  drawDialogueBox(ctx, w, h);

  // Dialogue
  if (state.mode === Mode.DIALOGUE) {
    drawDialogue(ctx, scene);
  }

  // Choices
  if (state.mode === Mode.CHOICES) {
    state.choiceButtons = drawChoices(ctx, scene.choices);
    return;
  }

  // Timed choices
  if (state.mode === Mode.TIMED) {
    state.choiceButtons = drawChoices(ctx, scene.timedChoices.options);
    drawTimer(ctx, w, h, state.timeRemaining);
    return;
  }
}

// ---------------------------------------------------------
// Background
// ---------------------------------------------------------
function drawBackground(ctx, w, h) {
  const state = getState();
  const img =
    state.mode === Mode.START
      ? state.startBackground
      : state.sceneBackground || state.startBackground;

  if (!img || !img.complete) return;

  if (state.cover) updateBodyBackground(scene.cover);

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  // Scale image to cover the entire viewport
  const scale = Math.max(viewportW / img.width, viewportH / img.height);

  const scaledW = img.width * scale;
  const scaledH = img.height * scale;

  // Center the scaled image in the viewport
  const offsetX = (viewportW - scaledW) / 2;
  const offsetY = (viewportH - scaledH) / 2;

  // Canvas position on screen
  const rect = ctx.canvas.getBoundingClientRect();

  // Draw the correct slice of the global background
  ctx.drawImage(img, offsetX - rect.left, offsetY - rect.top, scaledW, scaledH);
}

function updateBodyBackground(src) {
  document.body.style.backgroundImage = `url('${src}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
}

// ---------------------------------------------------------
// Start Screen
// ---------------------------------------------------------
function drawStartScreen(ctx, w, h) {
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "64px serif";
  ctx.fillText("Inkbound", w / 2, h * 0.35);

  ctx.font = "28px sans-serif";
  ctx.fillText("Click to Begin", w / 2, h * 0.55);
}

// ---------------------------------------------------------
// Main Menu
// ---------------------------------------------------------
function drawMainMenu(ctx, w, h) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#fff";
  ctx.font = "36px serif";
  ctx.textAlign = "center";

  const options = ["Start", "Load", "Settings", "Exit"];
  const buttons = [];

  for (let i = 0; i < options.length; i++) {
    const text = options[i];
    const x = w / 2;
    const y = h * 0.3 + i * 60;

    ctx.fillText(text, x, y);

    // Compute bounding box for hit detection
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    const height = 36; // approximate text height

    buttons.push({
      text,
      action: text.toLowerCase(),
      x: x - width / 2,
      y: y - height,
      w: width,
      h: height * 1.4,
    });
  }

  return buttons;
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
function drawDialogue(ctx, scene) {
  const state = getState();
  const line = scene.dialogue[state.dialogueIndex];
  if (!line) return;

  ctx.fillStyle = "#fff";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "left";

  ctx.fillText(line.speaker + ":", 30, ctx.canvas.height - 160);
  ctx.fillText(line.text, 30, ctx.canvas.height - 120);
}

// ---------------------------------------------------------
// Choices
// ---------------------------------------------------------
function drawChoices(ctx, choices) {
  ctx.fillStyle = "#fff";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "left";

  const buttons = [];

  for (let i = 0; i < choices.length; i++) {
    const text = `${i + 1}. ${choices[i].text}`;
    const x = 40;
    const y = ctx.canvas.height - 150 + i * 32;

    ctx.fillText(text, x, y);

    // Measure text for hitbox
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    const height = 24; // approximate text height

    buttons.push({
      index: i,
      x,
      y: y - height,
      w: width,
      h: height * 1.4,
    });
  }

  return buttons;
}

// ---------------------------------------------------------
// Timer (for timed choices)
// ---------------------------------------------------------
function drawTimer(ctx, w, h, timeRemaining) {
  ctx.fillStyle = "red";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "right";

  ctx.fillText(`Time: ${timeRemaining}`, w - 40, h - 160);
}

// ---------------------------------------------------------
export { draw };
