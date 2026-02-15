import { getState } from "./state.js";

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

  const btnWidth = element.width
    ? element.width * w
    : ctx.measureText(element.text).width + 40;
  const btnHeight = element.height ? element.height * h : 50;

  const align = element.align || "left";
  let btnX = x;
  if (align === "center") {
    btnX = x - btnWidth / 2;
  }

  const btnY = y - btnHeight / 2;

  // Draw button background image (if provided)
  if (element.backgroundImage) {
    if (!element.backgroundImg) {
      const img = new Image();
      img.src = element.backgroundImage;
      element.backgroundImg = img;
    }

    if (element.backgroundImg.complete) {
      ctx.drawImage(element.backgroundImg, btnX, btnY, btnWidth, btnHeight);
    }
  }
  // Fallback to solid color background
  else if (element.background) {
    ctx.fillStyle = element.background;
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
  }

  // Draw optional overlay/tint
  if (element.overlay) {
    ctx.fillStyle = element.overlay;
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
  }

  // Draw button border
  if (element.border) {
    ctx.strokeStyle = element.borderColor || "#fff";
    ctx.lineWidth = element.borderWidth || 2;
    ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
  }

  // Draw icon (if provided)
  if (element.icon) {
    if (!element.iconImg) {
      const img = new Image();
      img.src = element.icon;
      element.iconImg = img;
    }

    if (element.iconImg.complete) {
      const iconSize = element.iconSize || btnHeight * 0.6;
      const iconX = btnX + 10;
      const iconY = btnY + (btnHeight - iconSize) / 2;
      ctx.drawImage(element.iconImg, iconX, iconY, iconSize, iconSize);
    }
  }

  // Draw button text
  if (element.text) {
    ctx.fillStyle = element.color || "#fff";
    ctx.font = element.font || "20px sans-serif";
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    
    // Adjust text position if there's an icon
    const textX = element.icon ? x + 40 : x;
    ctx.fillText(element.text, textX, y);
  }

  // Return hitbox
  return {
    action: element.action,
    x: btnX,
    y: btnY,
    w: btnWidth,
    h: btnHeight,
  };
}

function drawScrollView(ctx, element, w, h, scrollOffset) {
  const buttons = [];

  const x = toScreenX(element.x, w);
  const y = toScreenY(element.y, h);
  const width = element.width * w;
  const height = element.height * h;

  // Clip region
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  // Layout config
  const layout = element.layout || {};
  const columns = layout.columns || 1;
  const gap = layout.gap || 0.02;
  const rowHeight = layout.rowHeight || 0.15;

  const itemWidth = (width - (columns - 1) * (gap * w)) / columns;
  const itemHeight = rowHeight * h;

  const items = element.items || [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const col = i % columns;
    const row = Math.floor(i / columns);

    const itemX = x + col * (itemWidth + gap * w);
    const itemY = y + row * (itemHeight + gap * h) - scrollOffset * h;

    // Draw item background (optional)
    if (item.background) {
      ctx.fillStyle = item.background;
      ctx.fillRect(itemX, itemY, itemWidth, itemHeight);
    }

    // Draw cover image (optional)
    if (item.cover) {
      if (!item.coverImg) {
        const img = new Image();
        img.src = item.cover;
        item.coverImg = img;
      }

      if (item.coverImg.complete) {
        ctx.drawImage(item.coverImg, itemX, itemY, itemWidth, itemHeight);
      }
    }

    if (item.title) {
      ctx.fillStyle = item.color || "#fff";
      ctx.font = item.font || "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(item.title, itemX + itemWidth / 2, itemY + itemHeight - 10);
    }

    buttons.push({
      action: item.action,
      x: itemX,
      y: itemY,
      w: itemWidth,
      h: itemHeight,
    });
  }

  ctx.restore();
  return buttons;
}

function drawNavbar(ctx, navbar, w, h) {
    const buttons = [];
    const position = navbar.position || "bottom";
    const navHeight = (navbar.height || 0.1) * h;
    const navY = position === "bottom" ? h - navHeight : 0;

    ctx.fillStyle = navbar.background || "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, navY, w, navHeight);

    const items = navbar.items || [];
    const itemWidth = w / items.length;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const x = i * itemWidth;
        const centerX = x + itemWidth / 2;

        if (item.active) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(x, navY, itemWidth, navHeight);
        }

        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = item.active ? "#fff" : "rgba(255,255,255,0.6)";
        ctx.fillText(item.icon, centerX, navY + navHeight * 0.4);

        ctx.font = "14px sans-serif";
        ctx.fillText(item.text, centerX, navY + navHeight * 0.75);

        buttons.push({
            action: item.action,
            x: x,
            y: navY,
            w: itemWidth,
            h: navHeight
        });
    }

    return buttons;
}

// Render all elements from a screen
function renderElements(ctx, screen, w, h) {
  const buttons = [];

  if (screen.navbar) {
    const navButtons = drawNavbar(ctx, screen.navbar, w, h);
    buttons.push(...navButtons);
  }

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

      case "scroll":
        const scrollButtons = drawScrollView(
          ctx,
          element,
          w,
          h,
          getState().scrollOffset,
        );
        buttons.push(...scrollButtons);
        break;
    }
  }

  return buttons;
}

export { renderElements };
