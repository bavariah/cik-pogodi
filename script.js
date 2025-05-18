// Word list 
const wordList = [
  "knjiga", "prozor", "jastuk", "tepih", "ulazni",
  "ograda", "kapija", "terasa", "polica", "čarapa",
  "kaputi", "jaknar", "torbar", "kuvari", "mesari",
  "ribari", "lovaca", "gradac", "vrtlar", "pijaca",
  "kupati", "prodaj", "oglasu", "poklon", "olovka",
  "gumica", "satovi", "stočić", "krevet", "čizama",
  "majice", "dugmad", "zavesa", "slikaš", "sveska",
  "patika", "makaze", "pantal", "zidari", "radnik",
  "putnik", "kupac", "nosila", "krovni", "proziv",
  "puknut", "trčati", "leteti", "igrati", "plivati",
  "voleti", "čekati", "pisati", "čitati", "pričaj",
  "stanar", "ručati", "kuvati", "kvasac", "prijem",
  "srpski", "kratak", "visina", "dubina", "širina",
  "lepeza", "razlog", "deliti", "spajam", "ponuda",
  "kupuje", "nagrada", "oprema", "bočica", "senzor",
  "filter", "stolar", "gipsar", "voćnjak", "farban",
  "slavim", "mračan", "živost", "šminka", "parfem"
];

// Lockout check – prevent game if played within 12 hours
const now = Date.now();
const lockUntil = parseInt(localStorage.getItem("locked_until") || 0);

if (now < lockUntil) {
  document.body.innerHTML = `<h2 style="text-align:center;margin-top:40px;color:white">
    Već ste igrali. Vratite se kasnije 😊
  </h2>`;
  throw new Error("Game is currently locked.");
}

// DOM elements
const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const scoreEl = document.getElementById("score");

// Game state
let currentRow = 0;
let currentGuess = "";
let score = JSON.parse(localStorage.getItem("score")) || { wins: 0, total: 0 };
const lockTime = 12 * 60 * 60 * 1000; // 12 hours in ms

function getTodayWord() {
  const index = Math.floor(Date.now() / (1000 * 60 * 60 * 12)) % wordList.length;
  return wordList[index];
}

const targetWord = getTodayWord();

function updateScore() {
  scoreEl.textContent = `Poeni: ${score.wins} od ${score.total}`;
  localStorage.setItem("score", JSON.stringify(score));
}

function createBoard() {
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < 6; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function createKeyboard() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZČĆŽŠĐ";
  [...letters].forEach(letter => {
    const key = document.createElement("button");
    key.textContent = letter;
    key.classList.add("key");
    key.onclick = () => handleKey(letter);
    keyboard.appendChild(key);
  });

  const enter = document.createElement("button");
  enter.textContent = "⏎";
  enter.classList.add("key");
  enter.onclick = submitGuess;
  keyboard.appendChild(enter);

  const del = document.createElement("button");
  del.textContent = "⌫";
  del.classList.add("key");
  del.onclick = deleteLetter;
  keyboard.appendChild(del);
}

function handleKey(letter) {
  if (currentGuess.length < 6) {
    currentGuess += letter.toLowerCase();
    updateBoard();
  }
}

function updateBoard() {
  const row = board.children[currentRow];
  [...row.children].forEach((tile, i) => {
    tile.textContent = currentGuess[i] || "";
  });
}

function deleteLetter() {
  currentGuess = currentGuess.slice(0, -1);
  updateBoard();
}

function submitGuess() {
  if (currentGuess.length !== 6) return;

  const row = board.children[currentRow];
  const targetArr = targetWord.split("");
  const guessArr = currentGuess.split("");

  const tileStatus = Array(6).fill("grey");

  // First pass – correct position
  for (let i = 0; i < 6; i++) {
    if (guessArr[i] === targetArr[i]) {
      tileStatus[i] = "green";
      targetArr[i] = null;
    }
  }

  // Second pass – correct letter, wrong position
  for (let i = 0; i < 6; i++) {
    if (tileStatus[i] === "grey" && targetArr.includes(guessArr[i])) {
      tileStatus[i] = "orange";
      targetArr[targetArr.indexOf(guessArr[i])] = null;
    }
  }

  // Apply styles
  guessArr.forEach((letter, i) => {
    const tile = row.children[i];
    tile.classList.add(tileStatus[i]);
    const key = [...keyboard.children].find(k => k.textContent === letter.toUpperCase());
    if (key) key.classList.add("used");
  });

  score.total++;

  if (currentGuess === targetWord) {
    score.wins++;
    alert("Bravo! Pogodili ste reč!");
    localStorage.setItem("locked_until", Date.now() + lockTime);
    updateScore();
    disableInput();
    return;
  }

  if (currentRow === 2) {
    alert("Auuuu, i dalje ništa 😬");
  }

  if (currentRow === 5) {
    alert("Kraj! Tačna reč je: " + targetWord.toUpperCase());
    localStorage.setItem("locked_until", Date.now() + lockTime);
    updateScore();
    disableInput();
    return;
  }

  // Continue to next row
  currentRow++;
  currentGuess = "";
  updateScore();
}

function disableInput() {
  [...keyboard.children].forEach(key => key.disabled = true);
}

// Initialize game
createBoard();
createKeyboard();
updateScore();