// Word list with hints
const wordList = [
  { word: "књигаш", hint: "Предмет за читање, обично са страницама и корицама" },
  { word: "прозор", hint: "Отвор на зиду који пропушта светлост и ваздух" },
  { word: "јастук", hint: "Предмет на ком се ослања глава приликом спавања" },
  { word: "црвићи", hint: "Мали инсекти који се гмижу" },
   { word: "ћевапи", hint: "Јело од млевеног меса" },
    { word: "фотеља", hint: "Удобна столица са наслонима" },
  { word: "кувари", hint: "Особе које припремају храну" },
  { word: "јахање", hint: "Вожња коња" },
 { word: "мишеви", hint: "Мале животиње или уређаји за рачунар" },
  { word: "зграда", hint: "Велика структура са више станова или канцеларија" },
  { word: "причај", hint: "Императив од „причати“" },
  { word: "читати", hint: "Разумевање писаног текста" },
  { word: "глумац", hint: "Особа која глуми у позоришту или филму" },
  { word: "писати", hint: "Радња уписивања речи" },
  { word: "свирач", hint: "Онај који свира инструмент" },
  { word: "летети", hint: "Кретање кроз ваздух" },
  { word: "бркови", hint: "Длаке изнад горње усне" },
   { word: "грбови", hint: "Хералдички знаци породице или државе" },
   { word: "јагода", hint: "Црвено воће са ситним семенкама" },
  { word: "гаража", hint: "Место за паркирање аутомобила" },
  { word: "бојице", hint: "Шарене оловке за цртање" },
   { word: "чарапе", hint: "Одећа која се носи на стопалима" },
     { word: "новине", hint: "Печатени медији са вестима" },
  { word: "иглице", hint: "Мале игле, често на јелкама или боровима" },
  { word: "четири", hint: "Број између три и пет" },
  { word: "банана", hint: "Жуто воће издуженог облика" },
 { word: "шумица", hint: "Мала шума, често близу насеља" },
  { word: "горење", hint: "Процес сагоревања или паљења" },
  { word: "једење", hint: "Конзумирање хране" },
   { word: "корито", hint: "Суд за воду или храњење животиња" },
  { word: "латице", hint: "Делови цвета, обично шарени" },
   { word: "пекара", hint: "Место где се прави и продаје хлеб" },
  { word: "ножеви", hint: "Алат за сечење, често у кухињи" },
  { word: "крмача", hint: "Женска свиња" },
 { word: "рогови", hint: "Шпиљасти делови на глави неких животиња" },
  { word: "салата", hint: "Јело од свежег поврћа" },
  { word: "шибице", hint: "Малене дрвене палице за паљење ватре" },
  { word: "украси", hint: "Предмети за улепшавање простора" },
  { word: "вагони", hint: "Делови воза у којима седе путници" },
  { word: "жирафа", hint: "Животиња дугог врата која живи у Африци" },
  { word: "кокице", hint: "Грицкалица добијена од кукуруза" },
  { word: "пециво", hint: "Пекарски производ попут кифле" },
   { word: "забава", hint: "Активност ради уживања" },
 { word: "вариоц", hint: "Занатлија који спаја метал ватром" },
   { word: "кораци", hint: "Покрети приликом ходања" },
  { word: "салама", hint: "Меснати производ у облику ваљка" },
  { word: "шишање", hint: "Скраћивање косе маказама" },
  { word: "улазни", hint: "Који се односи на улаз, као улазна врата" },
  { word: "камион", hint: "Велико теретно возило" },
   { word: "ограда", hint: "Структура која ограђује неки простор" },
     { word: "тестер", hint: "Алат за сечење дрвета" },
    { word: "кафено", hint: "Боја или пиће са кофеином" },
  { word: "тераса", hint: "Спољашњи део стана или куће за седење" },
  { word: "мрачан", hint: "Без светла, таман" },
  { word: "полица", hint: "Равна површина за одлагање ствари" },
  { word: "чарапа", hint: "Одећа која покрива стопала" },
   { word: "кацига", hint: "Заштита за главу при вожњи" },
  { word: "патике", hint: "Обувене ципеле за спорт или свакодневицу" },
  { word: "свеска", hint: "Свеска за писање, често за школу" },
  { word: "завеса", hint: "Тканина која прекрива прозор" },
   { word: "друмар", hint: "Особа која одржава путеве" },
  { word: "столар", hint: "Занатлија који ради са дрветом" },
  { word: "живост", hint: "Енергичност, пуно живота" },
  { word: "кревет", hint: "Комад намештаја за спавање" },
 { word: "волети", hint: "Имати љубав према некоме или нечему" },
  { word: "играти", hint: "Бавити се игром или плесом" },
  { word: "успеси", hint: "Резултат постигнутог труда или рада" },
  { word: "питања", hint: "Множина од реч „питање“" },
  { word: "кафана", hint: "певај" },
  { word: "зубари", hint: "Особа која поправља зубе" },
  { word: "гориво", hint: "Материјал који обезбеђује енергију за моторе" },
  { word: "лампај", hint: "Императив од лампати, у жаргону — осветли!" },
  { word: "маказе", hint: "Алат за сечење папира или тканине" },
  { word: "гумене", hint: "Израђене од гуме, попут чизама или рукавица" },
  { word: "облаци", hint: "Скуп водене паре на небу" },
  { word: "столић", hint: "Мали сто у дневној соби" },
  { word: "мрежац", hint: "Рибарска мрежа или мрежасти предмет" },
  { word: "капија", hint: "Велика врата на улазу у двориште" },
  { word: "књижар", hint: "Продавница књига" },
  { word: "њушкај", hint: "Тражи мирисом као пас" },
  { word: "бицикл", hint: "Превозно средство на два точка" },
  { word: "песник", hint: "Особа која пише поезију" },
  { word: "антена", hint: "Уређај за пријем или слање сигнала" },
{ word: "бобице", hint: "Мале округле плодове, често црвене или плаве" },
{ word: "црнило", hint: "Интензивна тама или боја" },
{ word: "духови", hint: "Невидљива бића из легенди или прича" },
{ word: "хаљина", hint: "Одећа коју често носе жене" },
{ word: "ливада", hint: "Поље са травом, често пуно цвећа" },
{ word: "лисица", hint: "Лукава дивља животиња са црвенкастим крзном" },
{ word: "мотика", hint: "Алат за обраду земље" },
{ word: "масажа", hint: "Поступак опуштања тела трљањем" },
{ word: "огласи", hint: "Обавештења у новинама или онлајн за продају или услуге" },
{ word: "посуда", hint: "Суд за чување или служење хране" },
{ word: "сивило", hint: "Недостатак боја, монотонија" },
{ word: "валови", hint: "Кретање воде у ритмичним облицима" },
{ word: "жичара", hint: "Средство превоза које се креће по ужету" },
{ word: "кофери", hint: "Пртљаг за путовања" },
{ word: "кочија", hint: "Стари облик превоза с коњима" },
{ word: "кутија", hint: "Предмет у који се нешто пакује" },
{ word: "камера", hint: "Уређај за снимање слике и видеа" },
{ word: "карате", hint: "Јапанска борилачка вештина" },
//
  { word: "магаре", hint: "Домаћа животиња слична коњу" },
   { word: "ципела", hint: "Обувa за свакодневну употребу" },
   { word: "клешта", hint: "Алат за држање или сечење жица" },
{ word: "јагода", hint: "Црвено воће са ситним семенкама" },
   { word: "лопата", hint: "Алат за копање или чишћење снега" },
  { word: "сликар", hint: "Уметник који слика" },
   { word: "федери", hint: "Металне опруге које се сабијају" },
   { word: "гурање", hint: "Физички помак неког предмета или особе" },
  { word: "бушење", hint: "Прављење рупа у некој површини" }
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
const lockTime = 24 * 60 * 60 * 1000; // 24h
// const START_TIME = new Date("2025-05-19T07:00:00Z").getTime();  09:00 Belgrade time
const START_TIME = new Date("2025-05-19T21:55:00Z").getTime();

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
  const layout = [
    "Љ Њ Е Р Т З У И О П Ш Ђ",
    "А С Д Ф Г Х Ј К Л Ч Ћ",
    "Џ Ц В Б Н М Ж"
  ];

  layout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.split(" ").forEach(letter => {
      const key = document.createElement("button");
      key.textContent = letter;
      key.classList.add("key");
      key.onclick = () => handleKey(letter);
      rowDiv.appendChild(key);
    });

    keyboard.appendChild(rowDiv);
  });

  const bottomRow = document.createElement("div");
  bottomRow.classList.add("keyboard-row");

  const enter = document.createElement("button");
  enter.textContent = "⏎";
  enter.classList.add("key", "wide");
  enter.style.width = "50%";
  enter.onclick = submitGuess;

  const del = document.createElement("button");
  del.textContent = "⌫";
  del.classList.add("key", "wide");
  del.style.width = "50%";
  del.onclick = deleteLetter;

  bottomRow.appendChild(enter);
  bottomRow.appendChild(del);
  keyboard.appendChild(bottomRow);
}

// test save
function saveProgress() {
  const guesses = [];
  for (let i = 0; i < currentRow; i++) {
    const row = board.children[i];
    const word = [...row.children].map(tile => tile.textContent).join("");
    guesses.push(word);
  }
  localStorage.setItem("in_progress", JSON.stringify({ row: currentRow, guesses }));
}

function handleKey(letter) {
  if (currentGuess.length < 6) {
    currentGuess += letter.toLowerCase();
    updateBoard();
 saveProgress();
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
 saveProgress();
}


function saveResultGrid() {
  const resultData = [];
  const rows = document.querySelectorAll(".row");

  for (let i = 0; i < 7; i++) {
    const row = rows[i];
    const rowData = [];

    for (let tile of row.children) {
      let color = "";
      if (tile.classList.contains("green")) color = "green";
      else if (tile.classList.contains("orange")) color = "orange";
      else if (tile.classList.contains("grey")) color = "grey";

      rowData.push({ letter: tile.textContent || "", color });
    }

    resultData.push(rowData);
  }

  localStorage.setItem("last_result_grid", JSON.stringify(resultData));
}

// test save
function restoreProgress() {
  const saved = JSON.parse(localStorage.getItem("in_progress") || "null");
  if (!saved) return;

  currentRow = saved.row;
  for (let i = 0; i < saved.guesses.length; i++) {
    currentGuess = saved.guesses[i];
    submitGuess(true); // Pass restore flag to skip endGame
  }
  currentGuess = "";
}

function submitGuess() {
  // if (currentGuess.length !== 6) return;
if (!restore && currentGuess.length !== 6) return;
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

    const key = [...document.querySelectorAll(".key")].find(k => k.textContent === letter.toUpperCase());
    if (key) {
      const existing = key.classList;
      if (!existing.contains("green")) {
        if (tileStatus[i] === "green") key.classList.remove("orange", "grey"), key.classList.add("green");
        else if (tileStatus[i] === "orange" && !existing.contains("green")) key.classList.remove("grey"), key.classList.add("orange");
        else if (!existing.contains("orange") && !existing.contains("green")) key.classList.add("grey");
      }
    }
  });

  if (!restore && currentGuess === targetWord) return endGame(true);
  if (!restore && currentRow === 6) return endGame(false);
  // if (currentGuess === targetWord) return endGame(true);
  // if (currentRow === 6) return endGame(false);

 if (!restore && currentRow === 5) enableHintAccess();
// if (currentRow === 5) {
//   enableHintAccess();
  
// }
  currentRow++;
  currentGuess = "";
 saveProgress();
}

  function endGame(win) {
  localStorage.setItem("last_played_timeWindow", Math.floor((Date.now() - START_TIME) / lockTime));
  localStorage.setItem("last_result", win ? "win" : "lose");
  localStorage.setItem("last_attempt_row", currentRow.toString());
  saveResultGrid();
  disableInput();
  updateStats(win ? currentRow : null);
  showResultGrid(win);

 if (win) {
  // Step 1: Ask for name only once
  let username = localStorage.getItem("username");
  if (!username) {
    const name = prompt("Унеси своје име за табелу резултата:");
    const trimmed = name ? name.trim() : "";
    if (trimmed.length < 2) return; // skip saving if invalid
    localStorage.setItem("username", trimmed);
    username = trimmed;
  }

  // Step 2: Calculate score
  const scoreMap = [50, 25, 10, 8, 5, 2, 1];
  const score = scoreMap[currentRow] || 0;

  // Step 3: Insert or update user in Supabase
  client
    .from("scores")
    .select("*")
    .eq("username", username)
    .then(({ data, error }) => {
      if (error) {
        console.error("Грешка при читању:", error);
        return;
      }

      if (data && data.length > 0) {
        const existing = data[0];
        const newScore = existing.score + score;
        const newAttempts = existing.attempts + 1;
        const newAvg = parseFloat((newScore / newAttempts).toFixed(2));

        client
          .from("scores")
          .update({
            score: newScore,
            attempts: newAttempts,
            avg_score: newAvg
          })
          .eq("username", username)
          .then(({ error }) => {
            if (error) {
              console.error("Грешка при ажурирању резултата:", error);
            }
          });
      } else {
        client
          .from("scores")
          .insert([
            {
              username,
              score,
              attempts: 1,
              avg_score: parseFloat(score.toFixed(2))
            }
          ])
          .then(({ error }) => {
            if (error) {
              console.error("Грешка при упису у табелу резултата:", error);
            }
          });
      }
    });
}
}

// 
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
    statsEl.innerHTML += `<div>Ред ${i + 1}: ${val}</div>`;
  });
  statsEl.innerHTML += `<div style="margin-top:10px;">Укупно: ${stats.wins}/${stats.total}</div>`;
}

function renderStatsPopup() {
  let stats = JSON.parse(localStorage.getItem("stats")) || {
    total: 0,
    wins: 0,
    attempts: [0, 0, 0, 0, 0, 0, 0]
  };

  const statsContent = document.getElementById("statsContent");
  statsContent.innerHTML = "";

  stats.attempts.forEach((val, i) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.padding = "6px 10px";
    row.style.marginBottom = "5px";
    row.style.borderRadius = "4px";
    row.style.color = "#fff";

    if (i === 6) row.style.backgroundColor = "#f90";
    else if (val > 0) row.style.backgroundColor = "#28a745";
    else row.style.backgroundColor = "#aaa";

    row.innerHTML = `<span>Ред ${i + 1}</span><strong>${val}</strong>`;
    statsContent.appendChild(row);
  });

  const totalDiv = document.createElement("div");
  totalDiv.style.marginTop = "10px";
  totalDiv.style.textAlign = "center";
  totalDiv.style.fontWeight = "bold";
  totalDiv.textContent = `Укупно: ${stats.wins}/${stats.total}`;
  statsContent.appendChild(totalDiv);
}

function showCountdownToNextWord() {
  const timerEl = document.getElementById("timer");
  function updateTimer() {
    const now = Date.now();
    const elapsed = now - START_TIME;
    const remainder = lockTime - (elapsed % lockTime);
    const h = Math.floor(remainder / 3600000), m = Math.floor((remainder % 3600000) / 60000), s = Math.floor((remainder % 60000) / 1000);
    timerEl.textContent = `Следећа реч за: ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  updateTimer();
  setInterval(updateTimer, 1000);
}

function showLockedGameScreen() {
  disableInput();

  const win = localStorage.getItem("last_result") === "win";
  const lastAttemptRow = parseInt(localStorage.getItem("last_attempt_row") || "6");

  // Render saved result grid
  const savedGrid = JSON.parse(localStorage.getItem("last_result_grid") || "[]");
  resultGrid.innerHTML = "";
  savedGrid.forEach(rowData => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    rowData.forEach(tileData => {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      if (tileData.color) tile.classList.add(tileData.color);
      rowDiv.appendChild(tile);
    });
    resultGrid.appendChild(rowDiv);
  });

  // Show result message
  if (win) {
    let message = "Браво! Погодили сте реч!";
    if (lastAttemptRow === 0) message = "🌟 Невероватно! Погодак из прве!!";
    else if (lastAttemptRow === 1) message = "🔥 Сјајно! Погодили сте из другог покушаја!";
    else if (lastAttemptRow === 2) message = "💪 Одлично! Трећи покушај и успех!";
    else if (currentRow === 3) message = "👏 Није било лако, али успели сте у четвртом покушају!";
    resultTitle.innerHTML = message;
  } else {
    resultTitle.innerHTML = `Нисте погодили 😞<br><small style="color:#ccc;">Тачна реч је: <strong>${targetWord.toUpperCase()}</strong></small>`;
  }

  resultScreen.style.display = "block";

  const msg = document.createElement("div");
  msg.style.marginTop = "20px";
  msg.style.color = "#fff";
  msg.innerHTML = "<h2 style='margin-bottom:10px;'>Већ сте играли ову игру 😊</h2><p>Сачекајте за следећу реч.</p>";
  resultScreen.insertBefore(msg, resultScreen.firstChild);

// share
  const shareBtn = document.getElementById("shareImageBtn");
if (shareBtn) {
  shareBtn.onclick = () => {
    const emojiMap = { green: "🟩", orange: "🟧", grey: "⬛" };
    const savedGrid = JSON.parse(localStorage.getItem("last_result_grid") || "[]");

    const shareText = savedGrid.map(row =>
      row.map(tile => emojiMap[tile.color] || "⬛").join("")
    ).join("\n") + "\nПогледај игру: https://bavariah.github.io/cik-pogodi/";

    if (navigator.share) {
      navigator.share({
        title: "Чик Погоди резултат",
        text: shareText
      }).catch(() => {
        fallbackShare(shareText);
      });
    } else {
      fallbackShare(shareText);
    }
  };
}

function fallbackShare(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Резултат копиран! Отворите Viber, WhatsApp или другу апликацију и налепите.");
    // Optional deep link trigger:
    // window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  });
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
 restoreProgress(); 
}
showCountdownToNextWord();

document.getElementById("openStatsBtn").onclick = () => {
  renderStatsPopup();
  document.getElementById("statsModal").style.display = "flex";
};

document.getElementById("closeStatsBtn").onclick = () => {
  document.getElementById("statsModal").style.display = "none";
};

let lastTouchTime = 0;
document.addEventListener('touchend', function (e) {
  const now = new Date().getTime();
  if (now - lastTouchTime <= 100) {
    e.preventDefault();
  }
  lastTouchTime = now;
}, false);

const hintIconBtn = document.getElementById("hintIconBtn");
const hintModal = document.getElementById("hintModal");
const hintModalText = document.getElementById("hintModalText");
const closeHintBtn = document.getElementById("closeHintBtn");

// Hide the icon initially
hintIconBtn.style.display = "none";

// Enable icon and modal trigger after 6th row
function enableHintAccess() {
  hintIconBtn.style.display = "block";
  hintIconBtn.onclick = () => {
    // Replace the "Show Hint" button inside modal with functionality
    hintModalText.innerHTML = `
      <button id="showHintBtnModal">Прикажи наговештај</button>
      <p id="hintTextModal" style="display:none;margin-top:10px;">Наговештај: ${hintText}</p>
    `;
    hintModal.style.display = "flex";

    // Activate reveal logic inside modal
    document.getElementById("showHintBtnModal").onclick = () => {
      document.getElementById("hintTextModal").style.display = "block";
    };
  };
}

// Close modal
closeHintBtn.onclick = () => {
  hintModal.style.display = "none";
};



// document.getElementById("openLeaderboardBtn").onclick = async () => {
//   const { data, error } = await client
//     .from("scores")
//     .select("*")
//     .order("score", { ascending: false })
//     .limit(10);

//   const container = document.getElementById("leaderboardContent");
//   container.innerHTML = error ? "<p>Грешка при учитавању.</p>" : "";

//   if (data) {
//     data.forEach((entry, i) => {
//       container.innerHTML += `<div>${i + 1}. <strong>${entry.username}</strong>  ${entry.score} поена</div>`;
//     });
//   }

//   document.getElementById("leaderboardModal").style.display = "flex";
// };

// document.getElementById("closeLeaderboardBtn").onclick = () => {
//   document.getElementById("leaderboardModal").style.display = "none";
// };
function loadLeaderboard(orderBy = "score") {
  client
    .from("scores")
    .select("*")
    .order(orderBy, { ascending: false })
    .limit(10)
    .then(({ data, error }) => {
      const container = document.getElementById("leaderboardContent");
      if (error) {
        container.innerHTML = "<p>Грешка при учитавању.</p>";
        return;
      }

      container.innerHTML = data
        .map((entry, i) => {
          const text =
            orderBy === "avg_score"
              ? `${(entry.avg_score || 0).toFixed(2)} просек (${entry.attempts})`
              : `${entry.score} поена (${entry.attempts})`;
          return `<div>${i + 1}. <strong>${entry.username}</strong>  ${text}</div>`;
        })
        .join("");
    });

  document.getElementById("leaderboardModal").style.display = "flex";
}

// 🎯 Button handlers
document.getElementById("openLeaderboardBtn").onclick = () => {
  loadLeaderboard("score"); // default view
};

document.getElementById("closeLeaderboardBtn").onclick = () => {
  document.getElementById("leaderboardModal").style.display = "none";
};
