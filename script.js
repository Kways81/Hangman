// ── Word fetching ─────────────────────────────────────────
// Fetches a random word from the Node server

// ── Game state ────────────────────────────────────────────
let word = "";
let category = "";
let guessed = new Set();
let lives = 6;
let difficulty = "easy";
let wins = 0;
let losses = 0;

async function loadScores() {
  const res = await fetch("/score");
  const data = await res.json();
  wins = data.wins;
  losses = data.losses;
  document.getElementById("score-wins").textContent = wins;
  document.getElementById("score-losses").textContent = losses;
}

async function saveScores() {
  await fetch("/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wins, losses }),
  });
}

loadScores();

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
  word     = data.word;
  category = data.category;

  guessed = new Set();
  lives = 6;

  document.getElementById("hint-value").textContent = category;

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

// ── Hangman Keyboard — Custom Element ────────────────────
// Uses all three web component features:
//   1. <template>  — the keyboard HTML lives in index.html as a template
//   2. Shadow DOM  — styles are scoped inside the component
//   3. Custom Element — registered as <hangman-keyboard>

class HangmanKeyboard extends HTMLElement {
  connectedCallback() {
    // 1. Clone the template content
    const template = document.getElementById("keyboard-template");
    const shadow   = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    // 2. Build the A–Z buttons inside the shadow DOM
    const grid = shadow.querySelector(".grid");
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i);
      const btn    = document.createElement("button");
      btn.textContent    = letter;
      btn.dataset.letter = letter;

      // 3. Fire a custom event when a key is clicked
      // script.js listens for this — the component doesn't need to know about game logic
      btn.addEventListener("click", () => {
        btn.disabled = true;
        this.dispatchEvent(new CustomEvent("letter-guessed", {
          detail: { letter },
          bubbles: true,
        }));
      });

      grid.appendChild(btn);
    }
  }

  // Mark a key as correct or wrong from outside the component
  markKey(letter, result) {
    const shadow = this.shadowRoot;
    const btn = [...shadow.querySelectorAll("button")]
      .find(b => b.dataset.letter === letter);
    if (btn) {
      btn.classList.add(result); // "correct" or "wrong"
      btn.disabled = true;
    }
  }

  // Reset all keys for a new game
  reset() {
    const shadow = this.shadowRoot;
    shadow.querySelectorAll("button").forEach(btn => {
      btn.classList.remove("correct", "wrong");
      btn.disabled = false;
    });
  }
}

customElements.define("hangman-keyboard", HangmanKeyboard);

// ── Build the keyboard — now just calls reset() on the component ──
function buildKeyboard() {
  document.getElementById("keyboard").reset();
}

// ── Handle a letter guess ─────────────────────────────────
function handleGuess(letter) {
  guessed.add(letter);
  const keyboard = document.getElementById("keyboard");

  if (word.includes(letter)) {
    keyboard.markKey(letter, "correct");
  } else {
    keyboard.markKey(letter, "wrong");
    lives--;
    updateLivesDisplay();
    revealNextBodyPart();
  }

  updateWordDisplay();
  updateWrongLetters();
  checkEndCondition();
}

// Listen for the custom event fired by <hangman-keyboard>
document.getElementById("keyboard").addEventListener("letter-guessed", (e) => {
  handleGuess(e.detail.letter);
});

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

  if (won) {
    wins++;
    badge.textContent = "You win!";
    badge.className = "badge badge-win";
  } else {
    losses++;
    badge.textContent = "Game Over";
    badge.className = "badge badge-lose";
  }

  endWord.textContent = word;
  msg.textContent = "The word was";

  // Update score on start screen and end screen
  document.getElementById("score-wins").textContent    = wins;
  document.getElementById("score-losses").textContent  = losses;
  document.getElementById("end-score-wins").textContent   = wins;
  document.getElementById("end-score-losses").textContent = losses;

  saveScores();
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

// Physical keyboard input — only active during gameplay
document.addEventListener("keydown", (e) => {
  if (screens.game.classList.contains("active") === false) return;
  const letter = e.key.toUpperCase();
  if (letter.length !== 1 || letter < "A" || letter > "Z") return;
  if (guessed.has(letter)) return;
  handleGuess(letter);
});