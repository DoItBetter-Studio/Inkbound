// -------------------------------------------------------
// Modes
// -------------------------------------------------------
const Mode = {
  START: "start",
  MENU: "menu",
  DIALOGUE: "dialogue",
  CHOICES: "choices",
  TIMED: "timed",
};

// -------------------------------------------------------
// Global State Object
// -------------------------------------------------------
const state = {
  mode: Mode.START,

  // Story Structure
  book: null,
  sceneId: null,
  dialogueIndex: 0,

  // Backgrounds / assets
  startBackground: null,
  sceneBackground: null,

  // Timed choice state
  timeRemaining: 0,
  timerRef: null,
};

// -------------------------------------------------------
// Getters
// -------------------------------------------------------
function getState() {
  return state;
}

// -------------------------------------------------------
// Book / Scene Management
// -------------------------------------------------------
function setBook(book) {
  state.book = book;
  state.sceneId = book.start;
  state.dialogueIndex = 0;
}

function setScene(id) {
  state.sceneId = id;
  state.dialogueIndex = 0;
}

function nextDialogue() {
  state.dialogueIndex++;
}

function getCurrentScene() {
  if (!state.book) return null;
  return state.book.story[state.sceneId];
}

// -------------------------------------------------------
// Mode Management
// -------------------------------------------------------
function setMode(mode) {
  state.mode = mode;
}

// -------------------------------------------------------
// Backgrounds
// -------------------------------------------------------
function setStartBackground(img) {
  state.startBackground = img;
}

function setSceneBackground(img) {
  state.sceneBackground = img;
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
  setMode,
  setBook,
  setScene,
  nextDialogue,
  getCurrentScene,
  setStartBackground,
  setSceneBackground,
  setTimer,
  clearTimer,
};
