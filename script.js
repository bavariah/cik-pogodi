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
// Rewritten script.js using fixed START_TIME and enhanced share/save features

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const hintWrapper = document.getElementById("hintWrapper");
const showHintBtn = document.getElementById("showHintBtn");
const hintTextEl = document.getElementById("hintText");
const statsEl = document.getElementById("stats");
const resultScreen = document.getElementById("resultScreen");
const resultTitle = document.getElementById("resultTitle");
const resultGrid = document.getElementById("resultGrid");

let currentRow = 0;
let currentGuess = "";
const lockTime = 12 * 60 * 60 * 1000; // 12h
const START_TIME = new Date("2025-05-19T07:00:00Z").getTime(); // 09:00 Belgrade time

function getTodayWord() {
  const timeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const index = timeWindow % wordList.length;
  return wordList[index];
}

const { word: targetWord, hint: hintText } = getTodayWord();

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

function saveResultGrid() {
  const resultData = [];
  document.querySelectorAll(".row").forEach(row => {
    const rowData = [...row.children].map(tile => {
      return {
        letter: tile.textContent,
        color: tile.classList.contains("green")
          ? "green"
          : tile.classList.contains("orange")
          ? "orange"
          : tile.classList.contains("grey")
          ? "grey"
          : ""
      };
    });
    resultData.push(rowData);
  });
  localStorage.setItem("last_result_grid", JSON.stringify(resultData));
}

function submitGuess() {
  if (currentGuess.length !== 6) return;
  const row = board.children[currentRow];
  const targetArr = targetWord.split("");
  const guessArr = currentGuess.split("");
  const tileStatus = Array(6).fill("grey");

  for (let i = 0; i < 6; i++) {
    if (guessArr[i] === targetArr[i]) {
      tileStatus[i] = "green";
      targetArr[i] = null;
    }
  }
  for (let i = 0; i < 6; i++) {
    if (tileStatus[i] === "grey" && targetArr.includes(guessArr[i])) {
      tileStatus[i] = "orange";
      targetArr[targetArr.indexOf(guessArr[i])] = null;
    }
  }

  guessArr.forEach((letter, i) => {
    const tile = row.children[i];
    tile.classList.add(tileStatus[i]);
    const key = [...keyboard.children].find(k => k.textContent === letter.toUpperCase());
    if (key) {
      const existing = key.classList;
      if (!existing.contains("green")) {
        if (tileStatus[i] === "green") key.classList.remove("orange", "grey"), key.classList.add("green");
        else if (tileStatus[i] === "orange" && !existing.contains("green")) key.classList.remove("grey"), key.classList.add("orange");
        else if (!existing.contains("orange") && !existing.contains("green")) key.classList.add("grey");
      }
    }
  });

  if (currentGuess === targetWord) return endGame(true);
  if (currentRow === 6) return endGame(false);

  if (currentRow === 5) {
    hintWrapper.style.display = "block";
    showHintBtn.onclick = () => {
      hintTextEl.textContent = "Nagoveštaj: " + hintText;
      hintTextEl.style.display = "block";
    };
  }
  currentRow++;
  currentGuess = "";
}

function endGame(win) {
  localStorage.setItem("last_played_timeWindow", Math.floor((Date.now() - START_TIME) / lockTime));
  localStorage.setItem("last_result", win ? "win" : "lose");
  localStorage.setItem("last_attempt_row", currentRow.toString());
  saveResultGrid();
  disableInput();
  updateStats(win ? currentRow : null);
  showResultGrid(win);
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

  statsEl.innerHTML = `<h3>Statistika</h3>`;
  stats.attempts.forEach((val, i) => {
    statsEl.innerHTML += `<div>Red ${i + 1}: ${val}</div>`;
  });
  statsEl.innerHTML += `<div style="margin-top:10px;">Ukupno: ${stats.wins}/${stats.total}</div>`;
}

function showCountdownToNextWord() {
  const timerEl = document.getElementById("timer");
  function updateTimer() {
    const now = Date.now();
    const elapsed = now - START_TIME;
    const remainder = lockTime - (elapsed % lockTime);
    const h = Math.floor(remainder / 3600000), m = Math.floor((remainder % 3600000) / 60000), s = Math.floor((remainder % 60000) / 1000);
    timerEl.textContent = `Sledeća reč za: ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  updateTimer();
  setInterval(updateTimer, 1000);
}

function showLockedGameScreen() {
  disableInput();
  const win = localStorage.getItem("last_result") === "win";

  // Build resultGrid from saved grid
  const savedGrid = JSON.parse(localStorage.getItem("last_result_grid") || "[]");
  resultGrid.innerHTML = "";
  savedGrid.forEach(rowData => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    rowData.forEach(tileData => {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.textContent = tileData.letter;
      if (tileData.color) tile.classList.add(tileData.color);
      rowDiv.appendChild(tile);
    });
    resultGrid.appendChild(rowDiv);
  });

  resultTitle.innerHTML = win
    ? "Bravo! Pogodili ste reč!"
    : `Niste pogodili 😞<br><small style="color:#ccc;">Tačna reč je: <strong>${targetWord.toUpperCase()}</strong></small>`;

  resultScreen.style.display = "block";

  const msg = document.createElement("div");
  msg.style.marginTop = "20px";
  msg.style.color = "#fff";
  msg.innerHTML = "<h2 style='margin-bottom:10px;'>Već ste igrali ovu igru 😊</h2><p>Sačekajte za sledeću reč.</p>";
  resultScreen.insertBefore(msg, resultScreen.firstChild);

  // Share button logic
  const shareBtn = document.getElementById("shareImageBtn");
if (shareBtn) {
  shareBtn.onclick = () => {
    const emojiMap = { green: "🟩", orange: "🟧", grey: "⬛" };
    const savedGrid = JSON.parse(localStorage.getItem("last_result_grid") || "[]");
    const text = savedGrid.map(row =>
      row.map(tile => emojiMap[tile.color] || "⬛").join("")
    ).join("\n") + "\nPogledaj igru: https://bavariah.github.io/cik-pogodi/";

    navigator.clipboard.writeText(text).then(() =>
      alert("Rezultat kopiran! Možete ga podeliti!")
    );
  };
}
  }
}

function checkIfLocked() {
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || -1);
  if (lastPlayed === currentTimeWindow) {
    createBoard();
    showLockedGameScreen();
    return true;
  }
  return false;
}

// Init
if (!checkIfLocked()) {
  createBoard();
  createKeyboard();
}
showCountdownToNextWord();



