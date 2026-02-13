import {
  getState,
  Mode,
  setBook,
  getCurrentScreen,
} from "./js/state.js";

import { advance, handleAction } from "./js/engine.js";
import { draw } from "./js/render.js";

// ---------------------------------------------------------
// Canvas Setup (4:3, deterministic)
// ---------------------------------------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const mobileQuery = window.matchMedia("(max-width: 767px)");

function resizeCanvas() {
  const isMobile = mobileQuery.matches;

  if (isMobile) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    const aspect = 4 / 3;
    canvas.height = window.innerHeight;
    canvas.width = canvas.height * aspect;
  }

  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";

  draw(ctx, canvas.width, canvas.height);
}

// Listen to breakpoint changes directly
mobileQuery.addEventListener("change", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", () => {
  setTimeout(resizeCanvas, 50);
});

// ---------------------------------------------------------
// Click Position Helper
// ---------------------------------------------------------
function getCanvasClickPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

// ---------------------------------------------------------
// Hit Test Helper
// ---------------------------------------------------------
function hitTestButton(x, y, btn) {
  return x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h;
}

// ---------------------------------------------------------
// Input Handling
// ---------------------------------------------------------
canvas.addEventListener("click", async (event) => {
  const state = getState();
  const screen = getCurrentScreen();
  const { x, y } = getCanvasClickPosition(event);

  if (!screen) return;

  // Check if any buttons were clicked
  if (state.currentButtons && state.currentButtons.length > 0) {
    for (const btn of state.currentButtons) {
      if (hitTestButton(x, y, btn)) {
        if (btn.action) {
          await handleAction(btn.action);
        }
        return;
      }
    }
  }

  // If no button clicked, advance (for splash/dialogue screens)
  if (screen.type === "splash" || screen.type === "dialogue") {
    advance();
  }
});

// ---------------------------------------------------------
// Book Loader
// ---------------------------------------------------------
async function loadBook(path) {
  try {
    const response = await fetch(path);
    const bookData = await response.json();
    setBook(bookData);
  } catch (error) {
    console.error("Failed to load book:", error);
  }
}

// ---------------------------------------------------------
// Initialize - Load start screen
// ---------------------------------------------------------
loadBook("books/startmenu.json");

// ---------------------------------------------------------
// Main Loop
// ---------------------------------------------------------
function loop() {
  draw(ctx, canvas.width, canvas.height);
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------
resizeCanvas();
loop();