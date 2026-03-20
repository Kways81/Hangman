// ── Word fetching ─────────────────────────────────────────
// Fetches a random word from the Node server

// ── Game state ────────────────────────────────────────────
let word = "";
let guessed = new Set();
let lives = 6;
let difficulty = "easy";

// ── Body parts revealed in order as lives are lost ────────
const BODY_PARTS = ["h-head", "h-body", "h-arm-l", "h-arm-r", "h-leg-l", "h-leg-r"];

// ── Grab elements we'll need repeatedly ──────────────────
const screens = {
  start: document.getElementById("screen-start"),
  game:  document.getElementById("screen-game"),
  end:   document.getElementById("screen-end"),
};

// ── Screen switching ──────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ── Start a new game ──────────────────────────────────────
// async because we fetch the word from the server
async function startGame() {
  const res  = await fetch(`/word?difficulty=${difficulty}`);
  const data = await res.json();
  word = data.word;

  guessed = new Set();
  lives = 6;

  updateLivesDisplay();
  updateWordDisplay();
  updateWrongLetters();
  resetHangman();
  buildKeyboard();

  showScreen("game");
}

// ── Update the lives counter ──────────────────────────────
function updateLivesDisplay() {
  document.getElementById("lives-count").textContent = lives;
}

// ── Update the word display (blanks and revealed letters) ─
function updateWordDisplay() {
  const container = document.getElementById("word-display");
  container.innerHTML = "";

  word.split("").forEach(letter => {
    const span = document.createElement("span");
    span.classList.add("letter");
    if (guessed.has(letter)) {
      span.textContent = letter;
    } else {
      span.textContent = "_";
      span.classList.add("blank");
    }
    container.appendChild(span);
  });
}

// ── Update the wrong guesses list ─────────────────────────
function updateWrongLetters() {
  const wrong = [...guessed].filter(l => !word.includes(l));
  const el = document.getElementById("wrong-letters");
  el.textContent = wrong.length > 0 ? wrong.join(", ") : "—";
}

// ── Show the next hangman body part ───────────────────────
function revealNextBodyPart() {
  const partsShown = 6 - lives;
  const partId = BODY_PARTS[partsShown - 1];
  if (partId) {
    document.getElementById(partId).classList.remove("hidden");
  }
}

// ── Reset hangman drawing for a new game ──────────────────
function resetHangman() {
  BODY_PARTS.forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
}

// ── Build the A–Z keyboard ────────────────────────────────
function buildKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";

  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const btn = document.createElement("button");
    btn.classList.add("key");
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.addEventListener("click", () => handleGuess(letter, btn));
    keyboard.appendChild(btn);
  }
}

// ── Handle a letter guess ─────────────────────────────────
function handleGuess(letter, btn) {
  guessed.add(letter);
  btn.disabled = true;

  if (word.includes(letter)) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    lives--;
    updateLivesDisplay();
    revealNextBodyPart();
  }

  updateWordDisplay();
  updateWrongLetters();
  checkEndCondition();
}

// ── Check if the game is won or lost ─────────────────────
function checkEndCondition() {
  const allRevealed = word.split("").every(l => guessed.has(l));

  if (allRevealed) {
    endGame(true);
  } else if (lives <= 0) {
    endGame(false);
  }
}

// ── End the game ──────────────────────────────────────────
function endGame(won) {
  const badge   = document.getElementById("end-badge");
  const msg     = document.getElementById("end-msg");
  const endWord = document.getElementById("end-word");

  endWord.textContent = word;
  msg.textContent = "The word was";

  if (won) {
    badge.textContent = "You win!";
    badge.className = "badge badge-win";
  } else {
    badge.textContent = "Game Over";
    badge.className = "badge badge-lose";
  }

  showScreen("end");
}

// ── Button listeners ──────────────────────────────────────

// Difficulty toggle on start screen
document.querySelectorAll(".diff-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    difficulty = btn.dataset.diff;
  });
});

// Start game button
document.getElementById("btn-start").addEventListener("click", startGame);

// Back to menu from game screen
document.getElementById("btn-back").addEventListener("click", () => showScreen("start"));

// Play again from end screen
document.getElementById("btn-again").addEventListener("click", startGame);

// Back to menu from end screen
document.getElementById("btn-menu").addEventListener("click", () => showScreen("start"));