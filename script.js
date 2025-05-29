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
 { word: "новине", hint: "Пaпир са вестима" },
  { word: "причај", hint: "Императив од „причати“" },
{ word: "спринт", hint: "Кратка трка максималном брзином" },
{ word: "корито", hint: "Суд за воду или храњење животиња" },
{ word: "финале", hint: "Последња утакмица у такмичењу" },
  { word: "читати", hint: "Разумевање писаног текста" },
{ word: "латице", hint: "Делови цвета, обично шарени" },
  { word: "глумац", hint: "Особа која глуми у позоришту или филму" },
  { word: "писати", hint: "Радња уписивања речи" },
 { word: "пекара", hint: "Место где се прави и продаје хлеб" },
  { word: "бркови", hint: "Длаке изнад горње усне" },
  { word: "свирач", hint: "Онај који свира инструмент" },
  { word: "летети", hint: "Кретање кроз ваздух" },
   { word: "грбови", hint: "Хералдички знаци породице или државе" },
   { word: "јагода", hint: "Црвено воће са ситним семенкама" },
  { word: "гаража", hint: "Место за паркирање аутомобила" },
  { word: "бојице", hint: "Шарене оловке за цртање" },
   { word: "чарапе", hint: "Одећа која се носи на стопалима" },
  { word: "иглице", hint: "Мале игле, често на јелкама или боровима" },
  { word: "четири", hint: "Број између три и пет" },
  { word: "банана", hint: "Жуто воће издуженог облика" },
 { word: "шумица", hint: "Мала шума, често близу насеља" },
  { word: "горење", hint: "Процес сагоревања или паљења" },
  { word: "једење", hint: "Конзумирање хране" },
  { word: "ножеви", hint: "Алат за сечење, често у кухињи" },
  { word: "крмача", hint: "Женска свиња" },
 { word: "рогови", hint: "Шпиљасти делови на глави неких животиња" },
  { word: "салата", hint: "Јело од свежег поврћа" },
  { word: "шибице", hint: "Малене дрвене палице за паљење ватре" },
{ word: "медаља", hint: "Метални знак успеха у олимпијским играма" },
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
{ word: "трофеј", hint: "Прелепа плакета или пехар за победника" },
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
{ word: "голман", hint: "Играч који брани гол" },
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
  { word: "компас", hint: "Уређај који показује север" },
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
  { word: "пртљаг", hint: "Ваши кофери и торбе на путу" },
{ word: "посуда", hint: "Суд за чување или служење хране" },
{ word: "сивило", hint: "Недостатак боја, монотонија" },
{ word: "валови", hint: "Кретање воде у ритмичним облицима" },
{ word: "жичара", hint: "Средство превоза које се креће по ужету" },
{ word: "кофери", hint: "Пртљаг за путовања" },
{ word: "кочија", hint: "Стари облик превоза с коњима" },
{ word: "кутија", hint: "Предмет у који се нешто пакује" },
{ word: "камера", hint: "Уређај за снимање слике и видеа" },
{ word: "карате", hint: "Јапанска борилачка вештина" },
  { word: "сужење", hint: "Смањење ширине или пречника нечега" },
{ word: "пузање", hint: "Кретње близу земље, као код гмизања" },
{ word: "мућење", hint: "Диркање или мешање течности или смеше" },
  { word: "хостел", hint: "Приступачан смештај за туристе" },
  { word: "дурење", hint: "Лукаво држање или лењост у раду" },
{ word: "остава", hint: "Место за складиштење хране или чаршије" },
{ word: "буђење", hint: "Прекид сна, када се пробудимо" },
{ word: "пливач", hint: "Особа која учествује у тркама у базену" },
{ word: "трофеј", hint: "Прелепа плакета или пехар за победника" },
{ word: "копање", hint: "Издубљивање земље лопатом или другим алатом" },
{ word: "корење", hint: "Део биљке који извлачи хранљиве материје из земље" },
{ word: "зезање", hint: "Благи повредање или исмев у игри" },
{ word: "корица", hint: "Врховни спољни слој књиге или воћа" },
{ word: "табела", hint: "Организовани сет података или бројки у редовима и колонама" },
{ word: "кетриџ", hint: "Уметак с мастилом или траком за штампач или касету" },
{ word: "појава", hint: "Неко или нешто што се изненада појави" },
{ word: "забава", hint: "Активност за уживање и опуштање" },
{ word: "глупав", hint: "Безмишљено или необразовано понашање" },
{ word: "прогон", hint: "Систематско хватање или праћење некога" },
{ word: "стража", hint: "Особље задужено за безбедност или надзор" },
{ word: "влажно", hint: "Са присуством воде или паре" },
{ word: "колачи", hint: "Слатки пецива од брашна и шећера" },
{ word: "глобус", hint: "ТриD модел Земље" },
{ word: "фудбал", hint: "Популарна игра са лоптом и 11 играча по тиму" },
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

function handleKey(letter) {
  if (currentGuess.length < 6) {
    currentGuess += letter.toLowerCase();
    updateBoard();
    saveGameState(); // Save after each letter
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
  saveGameState(); // Save after deleting a letter
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

  if (currentGuess === targetWord) return endGame(true);
  if (currentRow === 6) return endGame(false);

  // Save game state after each row
  saveGameState();

  currentRow++;
  currentGuess = "";
  
  // Check if hint should be shown
  checkAndShowHint();
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
    else if (lastAttemptRow === 2) message = "💪 Odlično! Treći pokušaj i uspeh!";
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

// Add this function to save game state after each row
function saveGameState() {
  const gameState = {
    currentRow,
    currentGuess,
    boardState: []
  };
  
  // Save all rows up to and including the current row
  for (let i = 0; i <= currentRow; i++) {
    const row = board.children[i];
    const rowState = [];
    
    for (let j = 0; j < 6; j++) {
      const tile = row.children[j];
      rowState.push({
        letter: tile.textContent,
        color: tile.classList.contains("green") ? "green" : 
               tile.classList.contains("orange") ? "orange" : 
               tile.classList.contains("grey") ? "grey" : ""
      });
    }
    
    gameState.boardState.push(rowState);
  }
  
  localStorage.setItem("gameState", JSON.stringify(gameState));
}

// Add this function to load saved game state
function loadGameState() {
  const savedState = localStorage.getItem("gameState");
  if (!savedState) return false;
  
  const gameState = JSON.parse(savedState);
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || -1);
  
  // Only restore if it's the same word (same time window)
  if (lastPlayed === currentTimeWindow) return false;
  
  // First, restore all tiles and keyboard colors
  gameState.boardState.forEach((rowState, rowIndex) => {
    const row = board.children[rowIndex];
    
    rowState.forEach((tileState, tileIndex) => {
      const tile = row.children[tileIndex];
      tile.textContent = tileState.letter;
      if (tileState.color) tile.classList.add(tileState.color);
      
      // Update keyboard colors
      const key = [...document.querySelectorAll(".key")].find(
        k => k.textContent === tileState.letter.toUpperCase()
      );
      if (key) {
        if (tileState.color === "green") key.classList.add("green");
        else if (tileState.color === "orange" && !key.classList.contains("green")) 
          key.classList.add("orange");
        else if (!key.classList.contains("green") && !key.classList.contains("orange"))
          key.classList.add("grey");
      }
    });
  });
  
  // Determine the correct current row
  // Find the last row that has all colored tiles
  let lastCompletedRow = -1;
  for (let i = 0; i < gameState.boardState.length; i++) {
    const rowState = gameState.boardState[i];
    const allColored = rowState.every(tile => tile.color);
    if (allColored) {
      lastCompletedRow = i;
    } else {
      break;
    }
  }
  
  // Set currentRow to the row after the last completed row
  currentRow = lastCompletedRow + 1;
  
  // Set currentGuess based on the saved state
  if (currentRow < gameState.boardState.length) {
    // If there's an incomplete row, set currentGuess to its letters
    currentGuess = gameState.boardState[currentRow]
      .map(tile => tile.letter.toLowerCase())
      .join('');
  } else {
    // Otherwise, start with an empty guess
    currentGuess = "";
  }
  
  // Update the board with the current guess
  updateBoard();
  
  // Check if hint should be shown
  checkAndShowHint();
  
  return true;
}

// Add this function to check if hint should be shown
function checkAndShowHint() {
  // Get reference to the hint button
  const hintIconBtn = document.getElementById("hintIconBtn");
  if (!hintIconBtn) return;
  
  // Check if we're on the 7th row (index 6)
  if (currentRow >= 6) {
    console.log("Showing hint button because currentRow =", currentRow);
    hintIconBtn.style.display = "block";
    
    // Set up the click handler
    hintIconBtn.onclick = () => {
      const hintModal = document.getElementById("hintModal");
      const hintModalText = document.getElementById("hintModalText");
      
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
  } else {
    console.log("Hiding hint button because currentRow =", currentRow);
    hintIconBtn.style.display = "none";
  }
}

// Init
if (!checkIfLocked()) {
  createBoard();
  createKeyboard();
  const gameLoaded = loadGameState(); // Load saved game state
  
  // Explicitly check if we're on the last row and show hint button if needed
  if (gameLoaded && currentRow >= 6) {
    console.log("Init: Showing hint button because currentRow =", currentRow);
    
    // Use setTimeout to ensure DOM is fully loaded
    setTimeout(() => {
      const hintIconBtn = document.getElementById("hintIconBtn");
      if (hintIconBtn) {
        console.log("Setting hint button display to block");
        hintIconBtn.style.display = "block";
        
        // Set up the click handler
        hintIconBtn.onclick = () => {
          const hintModal = document.getElementById("hintModal");
          const hintModalText = document.getElementById("hintModalText");
          
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
      } else {
        console.log("Hint button not found");
      }
    }, 100); // Short delay to ensure DOM is ready
  }
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

// Only hide the icon if we're not on the last row
if (currentRow < 6) {
  hintIconBtn.style.display = "none";
} else {
  hintIconBtn.style.display = "block";
}

// Enable icon and modal trigger after 6th row
function enableHintAccess() {
  checkAndShowHint();
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
