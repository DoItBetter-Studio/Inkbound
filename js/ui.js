// js/ui.js

// Convert normalized (0-1) coords to canvas pixels
function toScreenX(normalized, w) {
  if (normalized === "center") return w / 2;
  return normalized * w;
}

function toScreenY(normalized, h) {
  return normalized * h;
}

// Draw a label element
function drawLabel(ctx, element, w, h) {
  const x = toScreenX(element.x, w);
  const y = toScreenY(element.y, h);

  ctx.fillStyle = element.color || "#fff";
  ctx.font = element.font || "20px sans-serif";
  ctx.textAlign = element.align || (element.x === "center" ? "center" : "left");
  ctx.textBaseline = "alphabetic";

  ctx.fillText(element.text, x, y);
}

// Draw a button and return hitbox
function drawButton(ctx, element, w, h) {
  const x = toScreenX(element.x, w);
  const y = toScreenY(element.y, h);
  
  const btnWidth = element.width ? element.width * w : ctx.measureText(element.text).width + 40;
  const btnHeight = element.height ? element.height * h : 50;

  const align = element.align || "left";
  let btnX = x;
  if (align === "center") {
    btnX = x - btnWidth / 2;
  }

  // Draw button background
  if (element.background) {
    ctx.fillStyle = element.background;
    ctx.fillRect(btnX, y - btnHeight / 2, btnWidth, btnHeight);
  }

  // Draw button border
  if (element.border) {
    ctx.strokeStyle = element.borderColor || "#fff";
    ctx.lineWidth = element.borderWidth || 2;
    ctx.strokeRect(btnX, y - btnHeight / 2, btnWidth, btnHeight);
  }

  // Draw button text
  ctx.fillStyle = element.color || "#fff";
  ctx.font = element.font || "20px sans-serif";
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(element.text, x, y);

  // Return hitbox
  return {
    action: element.action,
    x: btnX,
    y: y - btnHeight / 2,
    w: btnWidth,
    h: btnHeight,
  };
}

// Render all elements from a screen
function renderElements(ctx, screen, w, h) {
  const buttons = [];

  if (!screen.elements) return buttons;

  for (const element of screen.elements) {
    switch (element.type) {
      case "label":
        drawLabel(ctx, element, w, h);
        break;

      case "button":
        const btn = drawButton(ctx, element, w, h);
        buttons.push(btn);
        break;
    }
  }

  return buttons;
}

export { renderElements };