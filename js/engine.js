import {
  getState,
  Mode,
  setMode,
  setScene,
  nextDialogue,
  getCurrentScene,
  clearTimer,
  setTimer,
} from "./state.js";

// ---------------------------------------------------------
// Advance the story based on current mode
// ---------------------------------------------------------
function advance() {
  const state = getState();
  const scene = getCurrentScene();
  if (!scene) return;

  // START → DIALOGUE
  if (state.mode === Mode.START) {
    setMode(Mode.DIALOGUE);
    return;
  }

  // DIALOGUE MODE
  if (state.mode === Mode.DIALOGUE) {
    const atEnd = state.dialogueIndex >= scene.dialogue.length - 1;

    if (!atEnd) {
      nextDialogue();
      return;
    }

    // Dialogue finished → choices?
    if (scene.choices) {
      setMode(Mode.CHOICES);
      return;
    }

    // Timed choices?
    if (scene.timedChoices) {
      startTimedChoices(scene);
      return;
    }

    // Next scene?
    if (scene.next) {
      setScene(scene.next);
      if (window.onSceneChanged) window.onSceneChanged();
      setMode(Mode.DIALOGUE);
      return;
    }

    return;
  }

  // CHOICE MODE — handled externally
  if (state.mode === Mode.CHOICES) return;

  // TIMED MODE — handled externally
  if (state.mode === Mode.TIMED) return;
}

// ---------------------------------------------------------
// Handle a choice selection
// ---------------------------------------------------------
function choose(index) {
  const scene = getCurrentScene();
  if (!scene || !scene.choices) return;

  const choice = scene.choices[index];
  if (!choice) return;

  setScene(choice.next);
  if (window.onSceneChanged) window.onSceneChanged();
  setMode(Mode.DIALOGUE);
}

// ---------------------------------------------------------
// Timed Choices
// ---------------------------------------------------------
function startTimedChoices(scene) {
  setMode(Mode.TIMED);

  const data = scene.timedChoices;
  const duration = data.time || 5;

  clearTimer();

  setTimer(duration, null, () => {
    const fallback = data.defaultIndex || 0;
    chooseTimed(fallback);
  });
}

function chooseTimed(index) {
  clearTimer();

  const scene = getCurrentScene();
  if (!scene || !scene.timedChoices) return;

  const choice = scene.timedChoices.options[index];
  if (!choice) return;

  setScene(choice.next);
  if (window.onSceneChanged) window.onSceneChanged();
  setMode(Mode.DIALOGUE);
}

// ---------------------------------------------------------
export { advance, choose, chooseTimed };
