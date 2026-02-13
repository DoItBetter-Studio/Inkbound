import {
  getState,
  setScreen,
  setModeFromScreen,
  nextDialogue,
  getCurrentScreen,
  setBook,
} from "./state.js";

// ---------------------------------------------------------
// Navigate to next screen
// ---------------------------------------------------------
function navigate(screenId) {
  setScreen(screenId);
  setModeFromScreen();
}

// ---------------------------------------------------------
// Handle button/screen actions
// ---------------------------------------------------------
async function handleAction(action) {
  if (!action) return;

  switch (action.type) {
    case "navigate":
      navigate(action.screen);
      break;

    case "loadBook":
      const response = await fetch(action.path);
      const bookData = await response.json();
      setBook(bookData);
      setModeFromScreen();
      break;

    case "advance":
      advance();
      break;
  }
}

// ---------------------------------------------------------
// Advance dialogue/story
// ---------------------------------------------------------
async function advance() {
  const state = getState();
  const screen = getCurrentScreen();
  if (!screen) return;

  // SPLASH/UI with action → execute action
  if ((screen.type === "splash" || screen.type === "ui") && screen.action) {
    await handleAction(screen.action);
    return;
  }

  // SPLASH/UI with next → navigate
  if ((screen.type === "splash" || screen.type === "ui") && screen.next) {
    navigate(screen.next);
    return;
  }

  // DIALOGUE MODE
  if (screen.type === "dialogue") {
    const atEnd = state.dialogueIndex >= screen.dialogue.length - 1;

    if (!atEnd) {
      nextDialogue();
      return;
    }

    // Dialogue finished → check for action or next
    if (screen.action) {
      await handleAction(screen.action);
      return;
    }

    if (screen.next) {
      navigate(screen.next);
      return;
    }
  }

  // CHOICES/TIMED handled by button clicks only
}

// ---------------------------------------------------------
export { advance, handleAction };