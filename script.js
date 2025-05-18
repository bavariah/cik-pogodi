// Word list with hints
const wordList = [
  { word: "knjiga", hint: "Predmet za čitanje, obično sa stranicama i koricama" },
  { word: "prozor", hint: "Otvor na zidu koji propušta svetlost i vazduh" },
  { word: "jastuk", hint: "Predmet na kom se oslanja glava prilikom spavanja" },
  { word: "ulazni", hint: "Koji se odnosi na ulaz, npr. ulazna vrata" },
  { word: "ograda", hint: "Struktura koja ograđuje neki prostor" },
  { word: "kapija", hint: "Velika vrata na ulazu u dvorište ili objekat" },
  { word: "terasa", hint: "Spoljašnji deo stana ili kuće za sedenje" },
  { word: "polica", hint: "Ravna površina za odlaganje stvari na zidu" },
  { word: "čarapa", hint: "Odeća koja pokriva stopala" },
  { word: "kaputi", hint: "Zimska odeća za gornji deo tela" },
  { word: "jaknar", hint: "Muško ime ili ređe korišćena reč (može se izostaviti)" },
  { word: "torbar", hint: "Osoba koja nosi torbe (ili starija reč)" },
  { word: "kuvari", hint: "Osobe koje pripremaju hranu" },
  { word: "mesari", hint: "Ljudi koji prodaju ili seku meso" },
  { word: "ribari", hint: "Osobe koje love ribu" },
  { word: "vrtlar", hint: "Osoba koja uređuje vrtove" },
  { word: "pijaca", hint: "Mesto gde se prodaje hrana i druge stvari" },
  { word: "kupati", hint: "Radnja pranja tela u vodi" },
  { word: "prodaj", hint: "Imperativ od 'prodati', čin razmene za novac" },
  { word: "poklon", hint: "Nešto što se daje nekome bez nadoknade" },
  { word: "olovka", hint: "Predmet za pisanje, često grafitna ili hemijska" },
  { word: "gumica", hint: "Predmet za brisanje napisanog" },
  { word: "satovi", hint: "Uređaji koji pokazuju vreme" },
  { word: "stočić", hint: "Mali sto" },
  { word: "krevet", hint: "Mesto za spavanje" },
  { word: "dugmad", hint: "Množina od dugme; koristi se za zakopčavanje" },
  { word: "zavesa", hint: "Tkanina koja se stavlja na prozore" },
  { word: "sveska", hint: "Sveska za pisanje, često za školu" },
  { word: "patika", hint: "Obuća namenjena sportu ili svakodnevici" },
  { word: "makaze", hint: "Alat za sečenje papira, tkanine itd." },
  { word: "zidari", hint: "Radnici koji zidaju kuće i zgrade" },
  { word: "radnik", hint: "Osoba koja obavlja fizički ili intelektualni rad" },
  { word: "putnik", hint: "Osoba koja putuje" },
  { word: "nosila", hint: "Sprava za nošenje povređenih ili bolesnih" },
  { word: "krovni", hint: "Koji se odnosi na krov" },
  { word: "proziv", hint: "Skraćeno od prozivanje; redosled po imenima" },
  { word: "puknut", hint: "Nešto što je napuklo ili puklo" },
  { word: "trčati", hint: "Kretati se brzo na nogama" },
  { word: "leteti", hint: "Kretati se vazduhom" },
  { word: "igrati", hint: "Baviti se igrom ili plesom" },
  { word: "plivaj", hint: "Imperativ od 'plivati'" },
  { word: "voleti", hint: "Imati osećaj ljubavi prema nekome ili nečemu" },
  { word: "čekati", hint: "Biti u iščekivanju nečega" },
  { word: "pisati", hint: "Radnja ispisivanja znakova" },
  { word: "čitati", hint: "Razumevanje pisanog teksta" },
  { word: "pričaj", hint: "Imperativ od 'pričati', govoriti nekom nešto" },
  { word: "stanar", hint: "Osoba koja stanuje u stanu ili kući" },
  { word: "ručati", hint: "Jesti glavni dnevni obrok" },
  { word: "kuvati", hint: "Pripremati hranu uz pomoć toplote" },
  { word: "kvasac", hint: "Sredstvo za narastanje testa" },
  { word: "prijem", hint: "Akt prijema, često za goste ili posao" },
  { word: "srpski", hint: "Koji se odnosi na Srbiju ili srpski jezik" },
  { word: "kratak", hint: "Suprotno od 'dugačak'" },
  { word: "visina", hint: "Udaljenost od donje do gornje tačke" },
  { word: "dubina", hint: "Suprotno od 'plitko'" },
  { word: "širina", hint: "Udaljenost s leva na desno" },
  { word: "lepeza", hint: "Predmet za rashlađivanje pomeranjem vazduha" },
  { word: "razlog", hint: "Uzrok nečega, objašnjenje" },
  { word: "deliti", hint: "Podeliti nešto sa drugima" },
  { word: "spajam", hint: "Povezujem više stvari u jedno" },
  { word: "ponuda", hint: "Predlog ili mogućnost izbora" },
  { word: "kupuje", hint: "Radnja sticanja robe uz novac" },
  { word: "oprema", hint: "Set alata ili stvari potrebnih za neku svrhu" },
  { word: "bočica", hint: "Mala boca" },
  { word: "senzor", hint: "Uređaj koji meri ili otkriva promene" },
  { word: "filter", hint: "Sredstvo za filtraciju ili prečišćavanje" },
  { word: "stolar", hint: "Majstor koji pravi stvari od drveta" },
  { word: "gipsar", hint: "Radnik koji postavlja ... površine" },
  { word: "farban", hint: "Premazan bojom" },
  { word: "slavim", hint: "Obeležavam praznik ili rođendan" },
  { word: "mračan", hint: "Bez svetla" },
  { word: "živost", hint: "Energija" },
  { word: "šminka", hint: "Ulepšavanje lica" },
  { word: "parfem", hint: "Mirisna tečnost" }
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
const hintWrapper = document.getElementById("hintWrapper");
const showHintBtn = document.getElementById("showHintBtn");
const hintTextEl = document.getElementById("hintText");
const statsEl = document.getElementById("stats");

// Game state
let currentRow = 0;
let currentGuess = "";
let score = JSON.parse(localStorage.getItem("score")) || { wins: 0, total: 0 };
const lockTime = 12 * 60 * 60 * 1000; // 12 hours in ms

function getTodayWord() {
  const lastWordIndex = parseInt(localStorage.getItem("last_word_index") || -1);
  const timeWindow = Math.floor(Date.now() / (1000 * 60 * 60 * 12));
  const storedTimeWindow = parseInt(localStorage.getItem("last_time_window") || 0);

  if (storedTimeWindow === timeWindow && lastWordIndex !== -1) {
    return wordList[lastWordIndex];
  }

  let nextIndex = (lastWordIndex + 1) % wordList.length;
  localStorage.setItem("last_word_index", nextIndex);
  localStorage.setItem("last_time_window", timeWindow);
  return wordList[nextIndex];
}

const currentWordObj = getTodayWord();
const targetWord = currentWordObj.word;
const hintText = currentWordObj.hint;

function updateScore() {
  scoreEl.textContent = `Poeni: ${score.wins} od ${score.total}`;
  localStorage.setItem("score", JSON.stringify(score));
}

function createBoard() {
  for (let i = 0; i < 7; i++) {
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
  enter.classList.add("key", "wide");
  enter.onclick = submitGuess;
  keyboard.appendChild(enter);

  const del = document.createElement("button");
  del.textContent = "⌫";
  del.classList.add("key", "wide");
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
if (key) {
  const existing = key.classList;

  if (!existing.contains("green")) {
    if (tileStatus[i] === "green") {
      key.classList.remove("orange", "grey");
      key.classList.add("green");
    } else if (tileStatus[i] === "orange" && !existing.contains("green")) {
      key.classList.remove("grey");
      key.classList.add("orange");
    } else if (!existing.contains("orange") && !existing.contains("green")) {
      key.classList.add("grey");
    }
  }
}
  });

  score.total++;

  if (currentGuess === targetWord) {
    score.wins++;
    alert("Bravo! Pogodili ste reč!");
    localStorage.setItem("locked_until", Date.now() + lockTime);
    updateScore();
    disableInput();
    updateStats(currentRow);
    return;
  }

  if (currentRow === 2) {
    alert("Auuuu, i dalje ništa 😬");
  }

  if (currentRow === 6) {
    alert("Kraj! Tačna reč je: " + targetWord.toUpperCase());
    localStorage.setItem("locked_until", Date.now() + lockTime);
    updateScore();
    disableInput();
    updateStats(null);
    return;
  }

  if (currentRow === 6) {
    hintWrapper.style.display = "block";
    showHintBtn.onclick = () => {
      hintTextEl.textContent = "Nagoveštaj: " + hintText;
      hintTextEl.style.display = "block";
    };
  }

  // Continue to next row
  currentRow++;
  currentGuess = "";
  updateScore();
}

function disableInput() {
  [...keyboard.children].forEach(key => key.disabled = true);
}

function updateStats(rowSolved) {
  let stats = JSON.parse(localStorage.getItem("stats")) || {
    total: 0,
    wins: 0,
    attempts: [0, 0, 0, 0, 0, 0, 0]
  };
  stats.total++;
  if (rowSolved !== null) {
    stats.wins++;
    stats.attempts[rowSolved]++;
  }
  localStorage.setItem("stats", JSON.stringify(stats));

  // Show stats
  statsEl.innerHTML = `<h3>Statistika</h3>`;
  stats.attempts.forEach((val, i) => {
    statsEl.innerHTML += `<div>Red ${i + 1}: ${val}</div>`;
  });
  statsEl.innerHTML += `<div style="margin-top:10px;">Ukupno: ${stats.wins}/${stats.total}</div>`;
}

function showCountdownIfLocked() {
  const lockUntil = parseInt(localStorage.getItem("locked_until") || 0);
  const timerEl = document.getElementById("timer");

  if (Date.now() < lockUntil) {
    function updateTimer() {
      const now = Date.now();
      const diff = lockUntil - now;

      if (diff <= 0) {
        timerEl.textContent = "Nova igra dostupna!";
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      timerEl.textContent = `Sledeća igra za: ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }
}

// Initialize game
createBoard();
createKeyboard();
updateScore();
showCountdownIfLocked();
