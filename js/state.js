// -------------------------------------------------------
// Modes
// -------------------------------------------------------
const Mode = {
  SPLASH: "splash",
  UI: "ui",
  DIALOGUE: "dialogue",
  CHOICE: "choices",
  TIMED: "timed",
};

// -------------------------------------------------------
// Global State Object
// -------------------------------------------------------
const state = {
  mode: Mode.SPLASH,

  // Book/Screen Structure
  book: null,
  screenId: null,
  dialogueIndex: 0,

  // UI elements (buttons, etc.)
  currentButtons: [],

  // Backgrounds / assets
  currentBackground: null,

  // Timed choice state
  timeRemaining: 0,
  timerRef: null,

  scrollOffset: 0,
};

// -------------------------------------------------------
// Getters
// -------------------------------------------------------
function getState() {
  return state;
}

// -------------------------------------------------------
// Book / Screen Management
// -------------------------------------------------------
function setBook(book) {
  state.book = book;
  state.screenId = book.start;
  state.dialogueIndex = 0;
  loadScreenBackground();
  setModeFromScreen();
}

function setScreen(id) {
  state.screenId = id;
  state.dialogueIndex = 0;
  state.scrollOffset = 0;
  loadScreenBackground();
  setModeFromScreen();
}

function nextDialogue() {
  state.dialogueIndex++;
}

function getCurrentScreen() {
  if (!state.book) return null;
  return state.book.screens[state.screenId];
}

// -------------------------------------------------------
// Mode Management (auto-set based on screen type)
// -------------------------------------------------------
function setModeFromScreen() {
  const screen = getCurrentScreen();
  if (!screen) return;

  switch (screen.type) {
    case "splash":
      state.mode = Mode.SPLASH;
      break;
    case "ui":
      state.mode = Mode.UI;
      break;
    case "dialogue":
      state.mode = Mode.DIALOGUE;
      break;
    case "choices":
      state.mode = Mode.CHOICE;
      break;
    case "timed":
      state.mode = Mode.TIMED;
      break;
  }
}

// -------------------------------------------------------
// Backgrounds
// -------------------------------------------------------
function loadScreenBackground() {
  const screen = getCurrentScreen();
  if (!screen) {
    state.currentBackground = null;
    return;
  }

  const src = screen.cover || screen.background;
  if (!src) {
    state.currentBackground = null;
    return;
  }

  const img = new Image();
  img.src = src;
  img.onload = () => {
    state.currentBackground = img;

    if (screen.cover) {
      document.body.style.backgroundImage = `url('${src}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    }
  };
}

function setBackground(img) {
  state.currentBackground = img;
}

// -------------------------------------------------------
// Timed Choices
// -------------------------------------------------------
function setTimer(seconds, tickCallback, endCallback) {
  clearTimer();

  state.timeRemaining = seconds;

  state.timerRef = setInterval(() => {
    state.timeRemaining--;

    if (tickCallback) tickCallback(state.timeRemaining);

    if (state.timeRemaining <= 0) {
      clearTimer();
      if (endCallback) endCallback();
    }
  }, 1000);
}

function clearTimer() {
  if (state.timerRef) {
    clearInterval(state.timerRef);
    state.timerRef = null;
  }
}

// -------------------------------------------------------
// Exports
// -------------------------------------------------------
export {
  Mode,
  getState,
  setBook,
  setScreen,
  setModeFromScreen,
  nextDialogue,
  getCurrentScreen,
  setBackground,
  setTimer,
  clearTimer,
};