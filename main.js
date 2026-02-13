import {
  getState,
  Mode,
  setMode,
  setStartBackground,
  setSceneBackground,
  setBook,
} from "./js/state.js";

import { advance, choose, chooseTimed } from "./js/engine.js";
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

// ---------------------------------------------------------
// Background Loader
// ---------------------------------------------------------
function loadBackground(src, callback) {
  const img = new Image();
  img.src = src;
  img.onload = () => callback(img);
}

// Load start screen background
loadBackground("assets/inkbound.png", setStartBackground);

// ---------------------------------------------------------
// Scene Background Loader
// ---------------------------------------------------------
function loadSceneBackgroundIfNeeded() {
  const state = getState();
  const scene = state.book?.story[state.sceneId];

  if (!scene || !scene.background) {
    setSceneBackground(null);
    return;
  }

  loadBackground(scene.background, (img) => {
    setSceneBackground(img);
  });
}

window.onSceneChanged = loadSceneBackgroundIfNeeded;

// ---------------------------------------------------------
// Menu Button Layout (temporary static version)
// ---------------------------------------------------------
function getCanvasClickPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function hitTestButton(x, y, btn) {
  return x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h;
}

function handleMenuAction(action) {
  switch (action) {
    case "start":
      setMode(Mode.DIALOGUE);
      break;

    case "load":
      console.log("Load not implemented yet");
      break;

    case "settings":
      console.log("Settings not implemented yet");
      break;

    case "exit":
      console.log("Exit not implemented yet");
      break;
  }
}

// ---------------------------------------------------------
// Input Handling
// ---------------------------------------------------------
canvas.addEventListener("click", (event) => {
  const state = getState();
  const { x, y } = getCanvasClickPosition(event);

  // START SCREEN → MAIN MENU
  if (state.mode === Mode.START) {
    setMode(Mode.MENU);
    return;
  }

  // MAIN MENU BUTTONS
  if (state.mode === Mode.MENU) {
    const { x, y } = getCanvasClickPosition(event);

    for (const btn of state.menuButtons || []) {
      if (hitTestButton(x, y, btn)) {
        handleMenuAction(btn.action);
        return;
      }
    }

    return;
  }

  // CHOICE MODE
  if (state.mode === Mode.CHOICES) {
    const { x, y } = getCanvasClickPosition(event);

    for (const btn of state.choiceButtons || []) {
      if (hitTestButton(x, y, btn)) {
        choose(btn.index);
        return;
      }
    }
    return;
  }

  // TIMED CHOICE MODE
  if (state.mode === Mode.TIMED) {
    const { x, y } = getCanvasClickPosition(event);

    for (const btn of state.choiceButtons || []) {
      if (hitTestButton(x, y, btn)) {
        chooseTimed(btn.index);
        return;
      }
    }
    return;
  }

  // DIALOGUE MODE
  advance();
});

// ---------------------------------------------------------
// Story Setup
// ---------------------------------------------------------
const testBook = {
  cover: "",
  start: "intro",
  story: {
    intro: {
      background: "assets/forest.png",
      dialogue: [
        { speaker: "Narrator", text: "Welcome to your visual novel." },
        { speaker: "Narrator", text: "Click to continue." },
      ],
      next: "choice_scene",
    },
    choice_scene: {
      background: "assets/cave.png",
      dialogue: [{ speaker: "Narrator", text: "Make a choice." }],
      choices: [
        { text: "Option A", next: "end" },
        { text: "Option B", next: "end" },
      ],
    },
    end: {
      background: "assets/ending.png",
      dialogue: [{ speaker: "Narrator", text: "The End." }],
    },
  },
};

setBook(testBook);
loadSceneBackgroundIfNeeded();

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
