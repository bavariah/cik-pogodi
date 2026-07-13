const lockTime = 24 * 60 * 60 * 1000;
const START_TIME = new Date("2025-05-19T21:05:00Z").getTime();

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const statsEl = document.getElementById("stats");
const resultScreen = document.getElementById("resultScreen");
const resultTitle = document.getElementById("resultTitle");
const resultGrid = document.getElementById("resultGrid");

let currentRow = 0;
let currentGuess = "";
let isFlipping = false;

function activeWordLength() {
  return typeof getDailyWordLength === "function" ? getDailyWordLength() : 6;
}

function activeRowCount() {
  return typeof getDailyRowCount === "function" ? getDailyRowCount() : 7;
}

function activeScoreMap() {
  return typeof getDailyScoreMap === "function" ? getDailyScoreMap() : [50, 30, 15, 12, 8, 6, 2];
}

function activeScoreForRow(rowIndex) {
  return typeof getDailyScoreForRow === "function"
    ? getDailyScoreForRow(rowIndex)
    : (activeScoreMap()[rowIndex] || 0);
}

function activeModeLabel() {
  return `${activeWordLength()} слова`;
}

function completedTargetWord() {
  return (localStorage.getItem("last_target_word") || targetWord || "").trim().toLowerCase();
}

function applyDailyLayoutVars() {
  const wordLength = activeWordLength();
  document.documentElement.style.setProperty("--daily-word-length", wordLength);
  document.documentElement.style.setProperty("--daily-row-count", activeRowCount());
  document.documentElement.dataset.dailyMode = String(wordLength);
}

function getDailyLockDayKey() {
  return typeof getDailyDayKey === "function" ? getDailyDayKey() : new Date().toISOString().slice(0, 10);
}

function setPlayedDailyLock(wordLength) {
  const mode = Number(wordLength);
  if (mode !== 5 && mode !== 6) return;
  localStorage.setItem("daily_already_played_day_key", getDailyLockDayKey());
  localStorage.setItem("daily_already_played_word_length", String(mode));
  if (typeof setDailyMode === "function") setDailyMode(mode, false);
  applyDailyLayoutVars();
  if (typeof updateDailyModePicker === "function") updateDailyModePicker();
}

function clearPlayedDailyLock() {
  localStorage.removeItem("daily_already_played_day_key");
  localStorage.removeItem("daily_already_played_word_length");
}

function removePlayedStatusMessages() {
  document.querySelectorAll(".played-status, .db-played-status").forEach(el => el.remove());
}

function getTimeWindowBounds(offset = 0) {
  const timeWindow = Math.floor((Date.now() - START_TIME) / lockTime) + offset;
  return {
    timeWindow,
    start: new Date(START_TIME + timeWindow * lockTime).toISOString(),
    end: new Date(START_TIME + (timeWindow + 1) * lockTime).toISOString()
  };
}

// ─── Season helpers ───────────────────────────────────────────────────────────

function getCurrentSeason() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() < 6 ? "S1" : "S2"}`;
}

function getSeasonLabel(s) {
  const [year, half] = s.split("-");
  if (year === "2025") return "2025 Јануар–Децембар";
  return `${year} ${half === "S1" ? "Јануар–Јун" : "Јул–Децембар"}`;
}

function getSeasonEndDate() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() < 6 ? new Date(year, 6, 1) : new Date(year + 1, 0, 1);
}

function getSeasonCountdownText() {
  const daysLeft = Math.max(0, Math.ceil((getSeasonEndDate() - new Date()) / (24 * 60 * 60 * 1000)));
  if (daysLeft === 0) return "Последњи дан сезоне";
  if (daysLeft === 1) return "Сезона се завршава сутра";
  return `Сезона се завршава за ${daysLeft} дана`;
}

// ─── Board & keyboard ─────────────────────────────────────────────────────────

function createBoard() {
  applyDailyLayoutVars();
  for (let i = 0; i < activeRowCount(); i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < activeWordLength(); j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function createKeyboard() {
  const layout = [
    "Љ Њ Е Р Т З У И О П Ш",
    "А С Д Ф Г Х Ј К Л Ч Ћ",
    "Џ Ц В Б Н М Ђ Ж"
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
  enter.classList.add("key", "wide", "key-enter");
  enter.style.width = "50%";
  enter.onclick = submitGuess;
  const del = document.createElement("button");
  del.innerHTML = '<svg class="delete-key-icon" viewBox="0 0 28 20" aria-hidden="true"><path d="M10 3h13a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H10L2 10l8-7Z"></path><path d="m15 7 6 6"></path><path d="m21 7-6 6"></path></svg>';
  del.setAttribute("aria-label", "Обриши");
  del.title = "Обриши";
  del.classList.add("key", "wide", "key-delete");
  del.style.width = "50%";
  del.onclick = deleteLetter;
  bottomRow.appendChild(enter);
  bottomRow.appendChild(del);
  keyboard.appendChild(bottomRow);
}

function handleKey(letter) {
  if (isFlipping) return;
  if (currentGuess.length < activeWordLength()) {
    currentGuess += letter.toLowerCase();
    updateBoard();
    const row = board.children[currentRow];
    const tile = row.children[currentGuess.length - 1];
    tile.classList.add("tile-animate");
    setTimeout(() => tile.classList.remove("tile-animate"), 150);
    saveGameState();
    if (typeof updateDailyModePicker === "function") updateDailyModePicker();
  }
}

function updateBoard() {
  const row = board.children[currentRow];
  [...row.children].forEach((tile, i) => { tile.textContent = currentGuess[i] || ""; });
}

function deleteLetter() {
  if (isFlipping) return;
  if (currentGuess.length > 0) {
    const row = board.children[currentRow];
    row.classList.add("row-delete-animate");
    setTimeout(() => row.classList.remove("row-delete-animate"), 150);
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
    saveGameState();
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function shakeCurrentRow() {
  const row = board.children[currentRow];
  if (!row) return;
  row.classList.add("shake");
  setTimeout(() => row.classList.remove("shake"), 350);
}

async function isKnownWord(word) {
  const normalized = word.trim().toLowerCase();
  const table = typeof getWordSource === "function"
    ? getWordSource(activeWordLength()).acceptedTable
    : ACCEPTED_WORDS_TABLE;
  const { data, error } = await client
    .from(table)
    .select("word")
    .eq("word", normalized)
    .limit(1)
    .maybeSingle();
  if (error) {
    if (activeWordLength() === 5 && typeof isLocalAcceptedWord === "function") {
      return isLocalAcceptedWord(normalized);
    }
    console.error("Word validation failed:", error);
    return false;
  }
  return !!data;
}

function recordRejectedGuess(word) {
  const normalized = word.trim().toLowerCase();
  const rpcName = activeWordLength() === 5 ? "record_five_rejected_guess" : "record_rejected_guess";
  client.rpc(rpcName, { p_guess: normalized })
    .then(({ error }) => {
      if (error) console.error("Failed to record rejected guess:", error);
    });
}

// ─── Result grid save ─────────────────────────────────────────────────────────

function saveResultGrid(rowCount = 7) {
  const resultData = [];
  const rows = document.querySelectorAll(".row");
  for (let i = 0; i < rowCount; i++) {
    const rowData = [];
    for (let tile of rows[i].children) {
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

function getCompletedResultGrid() {
  const grid = JSON.parse(localStorage.getItem("last_result_grid") || "[]");
  if (localStorage.getItem("last_result") !== "win") return grid.slice(0, activeRowCount());
  const lastAttemptRow = parseInt(localStorage.getItem("last_attempt_row") || String(activeRowCount() - 1));
  return grid.slice(0, lastAttemptRow + 1);
}

function compactCompletedGame(rowCount) {
  [...board.children].forEach((row, index) => {
    row.classList.toggle("row--unused", index >= rowCount);
  });
  keyboard.classList.add("keyboard--finished");
}

// ─── Miss tracking ────────────────────────────────────────────────────────────

function checkAndRecordMiss(gameState, savedTimeWindow) {
  if (!gameState || !gameState.boardState) return;
  const lastResult = localStorage.getItem("last_result");
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");
  if (lastPlayed === savedTimeWindow && lastResult) return;
  const hasGuesses = gameState.boardState.some(row => row.some(tile => tile.color));
  if (!hasGuesses) return;

  recordStatsResult(null);
  localStorage.setItem("pending_miss_sync", "1");
}

// ─── Submit guess ─────────────────────────────────────────────────────────────

async function submitGuess() {
  if (isFlipping) return;
  const wordLength = activeWordLength();
  if (currentGuess.length !== wordLength) {
    shakeCurrentRow();
    showToast(`Реч мора имати ${wordLength} слова`);
    return;
  }
  isFlipping = true;

  if (!(await isKnownWord(currentGuess))) {
    recordRejectedGuess(currentGuess);
    isFlipping = false;
    shakeCurrentRow();
    showToast("Реч није у речнику");
    return;
  }

  const row = board.children[currentRow];
  const targetArr = targetWord.split("");
  const guessArr = currentGuess.split("");
  const tileStatus = Array(wordLength).fill("grey");

  for (let i = 0; i < wordLength; i++) {
    if (guessArr[i] === targetArr[i]) { tileStatus[i] = "green"; targetArr[i] = null; }
  }
  for (let i = 0; i < wordLength; i++) {
    if (tileStatus[i] === "grey" && targetArr.includes(guessArr[i])) {
      tileStatus[i] = "orange";
      targetArr[targetArr.indexOf(guessArr[i])] = null;
    }
  }

  const flipDuration = 400;
  const flipDelay = 100;

  guessArr.forEach((letter, i) => {
    const tile = row.children[i];

    setTimeout(() => {
      tile.classList.add("flipping");
    }, i * flipDelay);

    setTimeout(() => {
      tile.classList.add(tileStatus[i]);
      tile.classList.remove("flipping");

      const key = [...document.querySelectorAll(".key")].find(k => k.textContent === letter.toUpperCase());
      if (key && !key.classList.contains("green")) {
        if (tileStatus[i] === "green") { key.classList.remove("orange", "grey"); key.classList.add("green"); }
        else if (tileStatus[i] === "orange") { key.classList.remove("grey"); key.classList.add("orange"); }
        else if (!key.classList.contains("orange")) { key.classList.add("grey"); }
      }
    }, i * flipDelay + flipDuration / 2);
  });

  const totalFlipTime = (guessArr.length - 1) * flipDelay + flipDuration;

  client.auth.getSession().then(({ data: { session } }) => {
    client.from("submissions").insert([{
      username: localStorage.getItem("username") || "anon",
      user_id: session?.user?.id || null,
      word: targetWord, guess: currentGuess,
      attempt: currentRow + 1, correct: (currentGuess === targetWord),
      played_at: new Date().toISOString()
    }]).then(({ error }) => { if (error) console.error("Failed to log submission:", error); });
  });

  const isWin = currentGuess === targetWord;
  const isLose = !isWin && currentRow === activeRowCount() - 1;

  await new Promise(resolve => setTimeout(resolve, totalFlipTime));
  isFlipping = false;

  if (isWin || isLose) { await endGame(isWin); return; }

  saveGameState();
  currentRow++;
  currentGuess = "";
  checkAndShowHint();
}

// ─── Day reset ────────────────────────────────────────────────────────────────

function resetBoardForNewDay() {
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const savedState = localStorage.getItem("gameState");
  if (savedState) {
    try {
      const gameState = JSON.parse(savedState);
      if (!gameState.timestamp) { clearAllGameData(); return true; }
      const savedTimeWindow = Math.floor((gameState.timestamp - START_TIME) / lockTime);
      if (savedTimeWindow !== currentTimeWindow) {
        checkAndRecordMiss(gameState, savedTimeWindow);
        clearAllGameData();
        return true;
      }
    } catch (e) { clearAllGameData(); return true; }
  }
  return false;
}

function clearAllGameData() {
  localStorage.removeItem("gameState");
  localStorage.removeItem("last_result_grid");
  localStorage.removeItem("last_result");
  localStorage.removeItem("last_attempt_row");
  localStorage.removeItem("last_word_length");
  localStorage.removeItem("last_target_word");
  localStorage.removeItem("last_played_timeWindow");
  clearPlayedDailyLock();
  window.location.reload();
}

const dayChanged = resetBoardForNewDay();

function disableInput() {
  [...keyboard.children].forEach(row => {
    [...row.children].forEach(key => key.disabled = true);
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function normalizeStats(stats) {
  const normalized = Object.assign(getEmptyStats(), stats || {});
  normalized.attempts = Array.isArray(normalized.attempts)
    ? normalized.attempts.slice(0, 7).concat([0, 0, 0, 0, 0, 0, 0]).slice(0, 7)
    : [0, 0, 0, 0, 0, 0, 0];
  normalized.total = normalized.total || 0;
  normalized.wins = normalized.wins || 0;
  normalized.misses = normalized.misses || 0;
  normalized.currentStreak = normalized.currentStreak || 0;
  normalized.maxStreak = normalized.maxStreak || 0;
  normalized.score = normalized.score || 0;
  return normalized;
}

function applyStatsResult(stats, rowSolved, pointsAwarded = 0) {
  stats.total++;
  if (rowSolved !== null) {
    stats.wins++;
    stats.attempts[rowSolved]++;
    stats.score = (stats.score || 0) + pointsAwarded;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
  } else {
    stats.misses++;
    stats.currentStreak = 0;
  }
  return stats;
}

function recordStatsResult(rowSolved, pointsAwarded = 0) {
  const allStats = applyStatsResult(
    normalizeStats(JSON.parse(localStorage.getItem("stats"))),
    rowSolved,
    pointsAwarded
  );
  const seasonStats = applyStatsResult(normalizeStats(getSeasonStats()), rowSolved, pointsAwarded);
  localStorage.setItem("stats", JSON.stringify(allStats));
  saveSeasonStats(seasonStats);
  return { allStats, seasonStats };
}

async function updateStats(rowSolved, sync = true, pointsAwarded = 0) {
  recordStatsResult(rowSolved, pointsAwarded);
  if (!sync) return;

  const { data: { session } } = await client.auth.getSession();
  if (session?.user) {
    await Promise.all([
      syncStats(session.user.id),
      persistCareerStats(session.user.id)
    ]).catch(e => console.error("stats sync failed", e));
  }
}

function renderStatsPopup() {
  let stats = JSON.parse(localStorage.getItem("stats")) || {
    total: 0, wins: 0, attempts: [0, 0, 0, 0, 0, 0, 0], misses: 0, currentStreak: 0, maxStreak: 0
  };
  stats.misses = stats.misses || 0;
  stats.currentStreak = stats.currentStreak || 0;
  stats.maxStreak = stats.maxStreak || 0;

  const statsContent = document.getElementById("statsContent");
  statsContent.innerHTML = "";
  const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;

  const summary = document.createElement("div");
  summary.style.cssText = "display:flex;justify-content:space-around;margin-bottom:15px;padding:10px;background:#333;border-radius:8px;";
  summary.innerHTML = `
    <div style="text-align:center"><div style="font-size:22px;font-weight:bold">${stats.total}</div><div style="font-size:11px;color:#aaa">Одиграно</div></div>
    <div style="text-align:center"><div style="font-size:22px;font-weight:bold">${winRate}%</div><div style="font-size:11px;color:#aaa">Победе</div></div>
    <div style="text-align:center"><div style="font-size:22px;font-weight:bold">${stats.currentStreak}</div><div style="font-size:11px;color:#aaa">Низ</div></div>
    <div style="text-align:center"><div style="font-size:22px;font-weight:bold">${stats.maxStreak}</div><div style="font-size:11px;color:#aaa">Макс. низ</div></div>
  `;
  statsContent.appendChild(summary);

  const distTitle = document.createElement("div");
  distTitle.style.cssText = "font-size:13px;color:#aaa;margin-bottom:8px;";
  distTitle.textContent = "Расподела погодака — каријера";
  statsContent.appendChild(distTitle);

  const maxVal = Math.max(...stats.attempts, 1);
  stats.attempts.forEach((val, i) => {
    const rowEl = document.createElement("div");
    rowEl.style.cssText = "display:flex;align-items:center;margin-bottom:5px;gap:8px;";
    const label = document.createElement("div");
    label.style.cssText = "width:20px;text-align:right;font-size:14px;";
    label.textContent = i + 1;
    const pct = val > 0 ? Math.max(12, Math.round((val / maxVal) * 100)) : 0;
    const barColor = i === 6 ? "#f90" : (val > 0 ? "#538d4e" : "#555");
    const bar = document.createElement("div");
    bar.style.cssText = `height:24px;width:${pct}%;background:${barColor};display:flex;align-items:center;padding-left:6px;font-size:13px;min-width:${val > 0 ? "24px" : "0"};border-radius:2px;transition:width 0.3s;`;
    bar.textContent = val > 0 ? val : "";
    rowEl.appendChild(label);
    rowEl.appendChild(bar);
    statsContent.appendChild(rowEl);
  });

  if (stats.misses > 0) {
    const missDiv = document.createElement("div");
    missDiv.style.cssText = "margin-top:10px;padding:8px;background:#4a1a1a;border-radius:6px;font-size:13px;color:#ff6b6b;";
    missDiv.textContent = `Напуштено игара: ${stats.misses}`;
    statsContent.appendChild(missDiv);
  }
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function showCountdownToNextWord() {
  const timerEl = document.getElementById("timer");
  function updateTimer() {
    const remainder = lockTime - ((Date.now() - START_TIME) % lockTime);
    if (remainder < 2000 || remainder > lockTime - 2000) { window.location.reload(); return; }
    const h = Math.floor(remainder / 3600000);
    const m = Math.floor((remainder % 3600000) / 60000);
    const s = Math.floor((remainder % 60000) / 1000);
    timerEl.textContent = `Следећа реч за: ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }
  updateTimer();
  setInterval(updateTimer, 1000);
}

// ─── Locked screen ────────────────────────────────────────────────────────────

function showLockedGameScreen() {
  const storedWordLength = Number(localStorage.getItem("last_word_length"));
  if (storedWordLength === 5 || storedWordLength === 6) setPlayedDailyLock(storedWordLength);
  applyDailyLayoutVars();
  disableInput();
  board.classList.add("board--hidden");
  board.style.display = "none";
  const win = localStorage.getItem("last_result") === "win";
  const lastAttemptRow = parseInt(localStorage.getItem("last_attempt_row") || String(activeRowCount() - 1));
  const savedGrid = getCompletedResultGrid();
  const resultWordLength = savedGrid[0]?.length || storedWordLength || activeWordLength();
  if (resultWordLength === 5 || resultWordLength === 6) setPlayedDailyLock(resultWordLength);
  resultGrid.style.setProperty("--daily-word-length", resultWordLength);

  removePlayedStatusMessages();
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

  if (win) {
    let message = "Браво! Погодили сте реч!";
    if (lastAttemptRow === 0) message = "🌟 Невероватно! Погодак из прве!!!";
    else if (lastAttemptRow === 1) message = "🔥 Сјајно! Погодили сте из другог покушаја!!";
    else if (lastAttemptRow === 2) message = "💪 Одлично! Трећи покушај и успех!";
    else if (lastAttemptRow === 3) message = "👏 Није било лако, али успели сте у четвртом покушају!";
    resultTitle.innerHTML = message;
  } else {
    resultTitle.innerHTML = `Нисте погодили 😞<br><small style="color:#ccc;">Тачна реч је: <strong>${completedTargetWord().toUpperCase()}</strong></small>`;
  }

  resultScreen.style.display = "block";
  resultScreen.classList.add("result-screen--locked");

  const shareBtn = document.getElementById("shareImageBtn");
  if (shareBtn) {
    shareBtn.onclick = () => {
      const emojiMap = { green: "🟩", orange: "🟧", grey: "⬛" };
      const grid = getCompletedResultGrid();
      const shareText = grid.map(row => row.map(tile => emojiMap[tile.color] || "⬛").join("")).join("\n")
        + "\nПогледај игру: https://bavariah.github.io/cik-pogodi/";
      if (navigator.share) {
        navigator.share({ title: "Чик Погоди резултат", text: shareText }).catch(() => fallbackShare(shareText));
      } else { fallbackShare(shareText); }
    };
  }

  function fallbackShare(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Резултат копиран! Отворите Viber, WhatsApp или другу апликацију и налепите.");
    });
  }

  showYesterdayWord().catch(console.error);
  loadDailyStats().catch(console.error);
  loadDayHero().catch(console.error);
}

function checkIfLocked() {
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");
  if (lastPlayed === currentTimeWindow) {
    const lastResult = localStorage.getItem("last_result");
    if (lastResult === "win" || lastResult === "lose") {
      showLockedGameScreen();
      return true;
    }
  } else if (lastPlayed !== -1) {
    localStorage.removeItem("gameState");
    localStorage.removeItem("last_result_grid");
    localStorage.removeItem("last_word_length");
    localStorage.removeItem("last_target_word");
    clearPlayedDailyLock();
  }
  return false;
}

// ─── Game state persistence ───────────────────────────────────────────────────

function saveGameState() {
  const gameState = {
    currentRow,
    currentGuess,
    timestamp: Date.now(),
    wordLength: activeWordLength(),
    rowCount: activeRowCount(),
    dayKey: typeof getDailyDayKey === "function" ? getDailyDayKey() : "",
    boardState: []
  };
  for (let i = 0; i <= currentRow; i++) {
    const row = board.children[i];
    const rowState = [];
    for (let j = 0; j < activeWordLength(); j++) {
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

function loadGameState() {
  const savedState = localStorage.getItem("gameState");
  if (!savedState) return false;
  const gameState = JSON.parse(savedState);
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");
  const isCompleted = ["win", "lose"].includes(localStorage.getItem("last_result"));
  if (lastPlayed !== -1 && lastPlayed !== currentTimeWindow) return false;
  if (isCompleted && lastPlayed === currentTimeWindow) return false;
  if (gameState.wordLength && gameState.wordLength !== activeWordLength()) return false;

  gameState.boardState.forEach((rowState, rowIndex) => {
    const row = board.children[rowIndex];
    rowState.forEach((tileState, tileIndex) => {
      const tile = row.children[tileIndex];
      tile.textContent = tileState.letter;
      if (tileState.color) tile.classList.add(tileState.color);
      const key = [...document.querySelectorAll(".key")].find(k => k.textContent === tileState.letter.toUpperCase());
      if (key) {
        if (tileState.color === "green") key.classList.add("green");
        else if (tileState.color === "orange" && !key.classList.contains("green")) key.classList.add("orange");
        else if (!key.classList.contains("green") && !key.classList.contains("orange")) key.classList.add("grey");
      }
    });
  });

  let lastCompletedRow = -1;
  for (let i = 0; i < gameState.boardState.length; i++) {
    if (gameState.boardState[i].every(tile => tile.color)) lastCompletedRow = i;
    else break;
  }
  currentRow = lastCompletedRow + 1;
  currentGuess = "";
  updateBoard();
  checkAndShowHint();
  return true;
}

// ─── Hint ─────────────────────────────────────────────────────────────────────

function checkAndShowHint() {
  const hintIconBtn = document.getElementById("hintIconBtn");
  if (!hintIconBtn) return;
  if (activeWordLength() !== 6) {
    hintIconBtn.style.display = "none";
    hintIconBtn.onclick = null;
    return;
  }
  if (currentRow >= activeRowCount() - 1) {
    hintIconBtn.style.display = "block";
    hintIconBtn.onclick = () => {
      const hintModal = document.getElementById("hintModal");
      const hintModalText = document.getElementById("hintModalText");
      hintModalText.innerHTML = `
        <button id="showHintBtnModal">Прикажи наговештај</button>
        <p id="hintTextModal" style="display:none;margin-top:10px;">Наговештај: ${hintText}</p>
      `;
      hintModal.style.display = "flex";
      document.getElementById("showHintBtnModal").onclick = () => {
        document.getElementById("hintTextModal").style.display = "block";
      };
    };
  } else {
    hintIconBtn.style.display = "none";
  }
}

// ─── Force reset old games ────────────────────────────────────────────────────

(function forceResetOldGames() {
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");
  if (lastPlayed !== -1 && lastPlayed !== currentTimeWindow) {
    const savedStateStr = localStorage.getItem("gameState");
    if (savedStateStr) {
      try { checkAndRecordMiss(JSON.parse(savedStateStr), lastPlayed); } catch (e) {}
    }
    localStorage.removeItem("gameState");
    localStorage.removeItem("last_result_grid");
    localStorage.removeItem("last_result");
    localStorage.removeItem("last_attempt_row");
    localStorage.removeItem("last_word_length");
    localStorage.removeItem("last_target_word");
    localStorage.removeItem("last_played_timeWindow");
    clearPlayedDailyLock();
    window.location.reload();
  }
})();

// ─── UI event handlers ────────────────────────────────────────────────────────

document.getElementById("openStatsBtn").onclick = () => {
  renderStatsPopup();
  document.getElementById("statsModal").style.display = "flex";
};
document.getElementById("closeStatsBtn").onclick = () => {
  document.getElementById("statsModal").style.display = "none";
};

let lastTouchTime = 0;
document.addEventListener("touchend", function (e) {
  const now = new Date().getTime();
  if (now - lastTouchTime <= 100) e.preventDefault();
  lastTouchTime = now;
}, false);

const hintIconBtn = document.getElementById("hintIconBtn");
const hintModal = document.getElementById("hintModal");
const closeHintBtn = document.getElementById("closeHintBtn");
hintIconBtn.style.display = "none";
closeHintBtn.onclick = () => { hintModal.style.display = "none"; };

document.getElementById("helpBtn").onclick = () => { document.getElementById("helpModal").style.display = "flex"; };
document.getElementById("closeHelpBtn").onclick = () => { document.getElementById("helpModal").style.display = "none"; };

if (!localStorage.getItem("helpShown")) {
  setTimeout(() => {
    document.getElementById("helpModal").style.display = "flex";
    localStorage.setItem("helpShown", "true");
  }, 500);
}

// ─── Physical keyboard ────────────────────────────────────────────────────────

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  const map = {
    q:"Љ", w:"Њ", e:"Е", r:"Р", t:"Т", z:"З", u:"У", i:"И", o:"О", p:"П", "[":"Ш",
    a:"А", s:"С", d:"Д", f:"Ф", g:"Г", h:"Х", j:"Ј", k:"К", l:"Л", ";":"Ч", "'":"Ћ",
    x:"Џ", c:"Ц", v:"В", b:"Б", n:"Н", m:"М", ",":"Ђ", ".":"Ж"
  };
  if (e.key === "Enter") { submitGuess(); }
  else if (e.key === "Backspace") { deleteLetter(); }
  else {
    const mapped = map[e.key.toLowerCase()];
    if (mapped) { handleKey(mapped); return; }
    const cyrillic = "абвгдђежзијклљмнњопрстћуфхцчџш";
    if (e.key.length === 1 && cyrillic.includes(e.key.toLowerCase())) handleKey(e.key.toUpperCase());
  }
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────

function colorFromStr(str) {
  const colors = ["#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6","#1abc9c","#e67e22","#e91e63"];
  let hash = 0;
  for (let i = 0; i < (str || "").length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

async function loadLeaderboard(orderBy = "avg_score") {
  document.querySelectorAll(".lb-tab").forEach(b => b.classList.remove("active"));
  const activeTab = document.querySelector(`.lb-tab[data-tab="${orderBy}"]`);
  if (activeTab) activeTab.classList.add("active");

  document.getElementById("leaderboardModal").style.display = "flex";
  const container = document.getElementById("leaderboardContent");
  container.innerHTML = "<p style='color:#aaa;text-align:center;padding:20px 0'>Учитавање...</p>";

  const currentUsername = localStorage.getItem("username");
  const currentEmoji = localStorage.getItem("avatar_emoji");
  const medals = ["🥇","🥈","🥉"];

  if (orderBy === "hof") {
    const { data, error } = await client
      .from("hall_of_fame")
      .select("season, username, rank")
      .order("season", { ascending: false })
      .order("rank", { ascending: true });

    if (error || !data || data.length === 0) {
      container.innerHTML = "<p style='color:#aaa;text-align:center;padding:20px 0'>Нема података о претходним сезонама.</p>";
      return;
    }
    const seasons = [...new Set(data.map(r => r.season))];
    container.innerHTML = seasons.map(season => {
      const players = data.filter(r => r.season === season);
      const rows = players.map(p => {
        const isYou = p.username === currentUsername;
        const safeUsername = escapeHtml(p.username || "Анон");
        const safeInitials = escapeHtml((p.username || "?").slice(0, 2).toUpperCase());
        const rankEl = p.rank <= 3
          ? `<span style="font-size:20px;width:30px;text-align:center;flex-shrink:0">${medals[p.rank - 1]}</span>`
          : `<span class="lb-rank-num">${p.rank}.</span>`;
        return `<div class="lb-row${isYou ? " lb-you" : ""}">
          ${rankEl}
          <span class="lb-avatar" style="background:${colorFromStr(p.username)}">${safeInitials}</span>
          <span class="lb-name${isYou ? " lb-name-you" : ""}">${safeUsername}${isYou ? " ★" : ""}</span>
        </div>`;
      }).join("");
      return `<div class="lb-hof-season">🏅 ${getSeasonLabel(season)}</div>${rows}`;
    }).join("");
    return;
  }

  const { data, error } = await client
    .from("scores")
    .select("username, score, avg_score, attempts, avatar_emoji")
    .eq("season", getCurrentSeason())
    .gt("score", 0)
    .order(orderBy, { ascending: false })
    .limit(20);

  const seasonHeader = `<div class="lb-season-label">${getSeasonLabel(getCurrentSeason())}</div><div class="lb-season-countdown">${getSeasonCountdownText()}</div>`;

  if (error) { container.innerHTML = "<p style='color:#aaa;text-align:center;padding:20px 0'>Грешка при учитавању.</p>"; return; }
  if (!data || data.length === 0) {
    container.innerHTML = `${seasonHeader}<p style='color:#aaa;text-align:center;padding:20px 0'>Нема резултата за ову сезону.</p>`;
    return;
  }

  let yourRank = -1;
  const rows = data.map((entry, i) => {
    const isYou = entry.username === currentUsername;
    const safeUsername = escapeHtml(entry.username || "Анон");
    const avatarValue = entry.avatar_emoji || (isYou ? currentEmoji : null);
    const safeAvatar = escapeHtml(avatarValue || (entry.username || "?").slice(0, 2).toUpperCase());
    if (isYou) yourRank = i + 1;
    const rankEl = i < 3
      ? `<span style="font-size:20px;width:30px;text-align:center;flex-shrink:0">${medals[i]}</span>`
      : `<span class="lb-rank-num">${i + 1}.</span>`;
    const rowClass = ["lb-top1","lb-top2","lb-top3"][i] || "";
    const scoreVal = orderBy === "avg_score"
      ? (entry.avg_score || 0).toFixed(1)
      : (entry.score || 0);
    const scoreUnit = orderBy === "avg_score" ? " пт/игри" : " пт";
    const scoreSub = orderBy === "avg_score"
      ? `${entry.attempts || 0} игара`
      : `${(entry.avg_score || 0).toFixed(1)} просек`;
    return `<div class="lb-row${rowClass ? " " + rowClass : ""}${isYou ? " lb-you" : ""}">
      ${rankEl}
      <span class="lb-avatar" style="background:${avatarValue ? "#333" : colorFromStr(entry.username)};font-size:${avatarValue ? "18px" : "11px"}">${safeAvatar}</span>
      <span class="lb-name${isYou ? " lb-name-you" : ""}">${safeUsername}${isYou ? " ★" : ""}</span>
      <span class="lb-score"><strong>${scoreVal}<small>${scoreUnit}</small></strong>${scoreSub}</span>
    </div>`;
  }).join("");

  const yourRankEl = yourRank === -1 && currentUsername
    ? `<div class="lb-your-rank">Твој ранг није у топ 20</div>` : "";

  container.innerHTML = `${seasonHeader}${rows}${yourRankEl}`;
}

document.getElementById("openLeaderboardBtn").onclick = () => loadLeaderboard("avg_score");
document.getElementById("closeLeaderboardBtn").onclick = () => {
  document.getElementById("leaderboardModal").style.display = "none";
};

// ─── Season archiving ─────────────────────────────────────────────────────────

async function checkAndArchiveSeason() {
  try {
    const currentSeason = getCurrentSeason();
    const { data: rows } = await client.from("scores").select("season").neq("season", currentSeason);
    if (!rows || rows.length === 0) return;

    const pastSeasons = [...new Set(rows.map(r => r.season))];
    for (const season of pastSeasons) {
      const { count } = await client.from("hall_of_fame")
        .select("*", { count: "exact", head: true }).eq("season", season);
      if (count && count > 0) continue;

      const { data: topPlayers } = await client.from("scores")
        .select("user_id, username, score, avg_score, attempts")
        .eq("season", season).order("score", { ascending: false });

      if (topPlayers && topPlayers.length > 0) {
        await client.from("hall_of_fame").insert(
          topPlayers.map((p, i) => ({
            season, user_id: p.user_id, username: p.username || "Анон",
            rank: i + 1, score: p.score || 0, avg_score: p.avg_score || 0, attempts: p.attempts || 0
          }))
        );
      }
    }
  } catch (e) { console.error("Archive check failed:", e); }
}

// ─── Animations & sound ───────────────────────────────────────────────────────

function createFireworks() {
  const firework = document.createElement("div");
  firework.className = "firework";
  document.body.appendChild(firework);
  for (let i = 0; i < 100; i++) {
    const particle = document.createElement("div");
    particle.className = "firework-particle";
    const colors = ["#ff0","#f0f","#0ff","#f00","#0f0","#00f"];
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    particle.style.left = `${window.innerWidth / 2}px`;
    particle.style.top = `${window.innerHeight / 2}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    firework.appendChild(particle);
  }
  setTimeout(() => document.body.removeChild(firework), 1000);
}

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (e) {}
}

// ─── Day Hero ─────────────────────────────────────────────────────────────────

function attemptLabel(attempt) {
  return ["првог", "другог", "трећег", "четвртог", "петог", "шестог", "седмог"][attempt - 1] || `${attempt}.`;
}

async function loadDayHero() {
  const el = document.getElementById("dayHeroSection");
  if (!el || typeof getDailyDayKey !== "function") return;

  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  if (currentTimeWindow === 0) return;
  const yesterdayKey = getDailyDayKey(-1);

  const { data, error } = await client
    .from("daily_results")
    .select("username, attempt, played_at, user_id, word_length, points")
    .eq("day_key", yesterdayKey)
    .eq("correct", true)
    .not("user_id", "is", null)
    .order("attempt", { ascending: true })
    .order("played_at", { ascending: true })
    .limit(100);

  if (error || !data || data.length === 0) {
    el.style.display = "none";
    return;
  }

  const currentUsername = localStorage.getItem("username");
  const thresholds = { 5: 3, 6: 3 };
  const cards = [];

  [5, 6].forEach(mode => {
    const hero = data.find(row =>
      row.word_length === mode &&
      row.attempt <= thresholds[mode] &&
      row.username &&
      row.username !== "anon"
    );
    if (!hero) return;

    const isYou = hero.username === currentUsername;
    const safeHeroUsername = escapeHtml(hero.username);
    const pointsText = hero.points ? ` · +${hero.points}` : "";

    cards.push(`
      <div class="day-hero-card">
        <div class="day-hero-label">💎 ВАУ ${mode} СЛОВА</div>
        <div class="day-hero-body">
          <div class="day-hero-info">
            <div class="day-hero-name">${safeHeroUsername}${isYou ? " ⭐" : ""}</div>
            <div class="day-hero-sub">из <strong>${attemptLabel(hero.attempt)}</strong> покушаја${pointsText}</div>
          </div>
        </div>
      </div>
    `);
  });

  if (cards.length === 0) {
    el.style.display = "none";
    return;
  }

  el.innerHTML = `<div class="day-hero-list">${cards.join("")}</div>`;
  el.style.display = "block";
}

// ─── Game end ─────────────────────────────────────────────────────────────────

async function recordDailyResult(win, points) {
  const dayKey = typeof getDailyDayKey === "function" ? getDailyDayKey() : new Date().toISOString().slice(0, 10);
  const { data: { session } } = await client.auth.getSession();
  const username = localStorage.getItem("username") || "anon";

  if (!session?.user) return false;

  const { data, error } = await client.rpc("record_daily_result", {
    p_day_key: dayKey,
    p_word_length: activeWordLength(),
    p_word: targetWord,
    p_guess: currentGuess || targetWord,
    p_attempt: currentRow + 1,
    p_correct: win,
    p_points: points,
    p_username: username,
    p_season: typeof getCurrentSeason === "function" ? getCurrentSeason() : ""
  });

  if (error) {
    console.error("Failed to record daily result:", error);
    return false;
  }

  await persistCareerStats(session.user.id).catch(console.error);
  return Array.isArray(data) ? data[0]?.inserted !== false : true;
}

async function endGame(win) {
  localStorage.setItem("last_played_timeWindow", Math.floor((Date.now() - START_TIME) / lockTime));
  localStorage.setItem("last_result", win ? "win" : "lose");
  localStorage.setItem("last_attempt_row", currentRow.toString());
  localStorage.setItem("last_word_length", String(activeWordLength()));
  localStorage.setItem("last_target_word", targetWord);
  setPlayedDailyLock(activeWordLength());
  const completedRows = win ? currentRow + 1 : activeRowCount();
  saveResultGrid(completedRows);
  compactCompletedGame(completedRows);
  disableInput();
  const points = win ? activeScoreForRow(currentRow) : 0;
  await updateStats(win ? currentRow : null, false, points);

  if (win) {
    const row = board.children[currentRow];
    [...row.children].forEach((tile, i) => {
      setTimeout(() => tile.classList.add("success-animate"), i * 100);
    });
    playSuccessSound();
    setTimeout(() => createFireworks(), 600);
  }

  const recorded = await recordDailyResult(win, points).catch(error => {
    console.error("daily result failed", error);
    return false;
  });
  if (!recorded) {
    if (win) await updateLeaderboard(localStorage.getItem("username"), points);
    const { data: { session } } = await client.auth.getSession();
    if (session?.user) {
      await Promise.all([
        syncStats(session.user.id),
        persistCareerStats(session.user.id)
      ]).catch(e => console.error("stats sync failed", e));
    }
  }

  setTimeout(() => {
    showResultGrid(win);
    showYesterdayWord().catch(console.error);
    loadDailyStats().catch(console.error);
    loadDayHero().catch(console.error);
  }, win ? 1200 : 0);
}

// ─── Leaderboard DB update ────────────────────────────────────────────────────

async function updateLeaderboard(username, score) {
  const { data: { session }, error: sessErr } = await client.auth.getSession();
  if (sessErr || !session) return;
  const uid = session.user.id;
  const season = getCurrentSeason();
  const localStats = typeof getSeasonStats === "function" ? normalizeStats(getSeasonStats(season)) : null;
  const localDist = Array.isArray(localStats?.attempts) ? localStats.attempts : [];
  const localAttempts = localDist.reduce((total, count) => total + (count || 0), 0);
  const localScore = typeof getSeasonScoreFromStats === "function"
    ? getSeasonScoreFromStats(localStats)
    : [50, 30, 15, 12, 8, 6, 2].reduce((total, points, index) => total + ((localDist[index] || 0) * points), 0);

  const { data, error } = await client.from("scores")
    .select("id, score, attempts")
    .eq("user_id", uid).eq("season", season).maybeSingle();

  if (error && error.code !== "PGRST116") { console.error("Lookup error:", error); return; }

  if (data) {
    const updatePayload = { username: username || "Анон" };
    if (localAttempts > (data.attempts || 0) && localScore > (data.score || 0)) {
      updatePayload.score = localScore;
      updatePayload.attempts = localAttempts;
      updatePayload.avg_score = localAttempts > 0
        ? parseFloat((localScore / localAttempts).toFixed(2))
        : 0;
    } else if (localAttempts === 0 || localAttempts > (data.attempts || 0)) {
      const newScore = (data.score || 0) + score;
      const newAttempts = (data.attempts || 0) + 1;
      updatePayload.score = newScore;
      updatePayload.attempts = newAttempts;
      updatePayload.avg_score = parseFloat((newScore / newAttempts).toFixed(2));
    } else if (localScore > (data.score || 0)) {
      updatePayload.score = localScore;
      updatePayload.avg_score = localAttempts > 0
        ? parseFloat((localScore / localAttempts).toFixed(2))
        : 0;
    }
    await client.from("scores").update(updatePayload).eq("id", data.id);
  } else {
    const initialScore = localAttempts > 0 ? localScore : score;
    const initialAttempts = localAttempts > 0 ? localAttempts : 1;
    await insertCurrentSeasonScore({
      user_id: uid, username: username || "Анон",
      score: initialScore,
      attempts: initialAttempts,
      avg_score: parseFloat((initialScore / initialAttempts).toFixed(2)),
      season
    });
  }
}

// ─── After-game info ──────────────────────────────────────────────────────────

async function showYesterdayWord() {
  if (typeof getWordByTimeWindow !== "function") return;
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  if (currentTimeWindow === 0) return;
  const yesterdayTimeWindow = currentTimeWindow - 1;
  const entries = await Promise.all([
    getWordByTimeWindow(yesterdayTimeWindow, 5).catch(() => null),
    getWordByTimeWindow(yesterdayTimeWindow, 6).catch(() => null),
  ]);
  const parts = entries
    .map((entry, index) => entry?.word ? `${index === 0 ? 5 : 6}: ${entry.word.toUpperCase()}` : "")
    .filter(Boolean);
  if (parts.length === 0) return;
  const el = document.getElementById("yesterdaySection");
  if (el) {
    el.textContent = `Јучерашње речи: ${parts.join(" · ")}`;
    el.style.display = "block";
  }
}

async function loadDailyStats() {
  const el = document.getElementById("dailyStatsBar");
  if (!el || typeof getDailyDayKey !== "function") return;
  const dayKey = getDailyDayKey();
  const { data: dailyRows, error: dailyError } = await client
    .from("daily_results")
    .select("word_length, correct")
    .eq("day_key", dayKey);

  if (!dailyError && Array.isArray(dailyRows) && dailyRows.length > 0) {
    const totals = {
      5: { played: 0, solved: 0 },
      6: { played: 0, solved: 0 },
    };
    dailyRows.forEach(row => {
      const bucket = totals[row.word_length];
      if (!bucket) return;
      bucket.played++;
      if (row.correct) bucket.solved++;
    });
    el.textContent = `Данас: 5 слова ${totals[5].solved}/${totals[5].played} · 6 слова ${totals[6].solved}/${totals[6].played}`;
    el.style.display = "block";
    return;
  }

  if (!targetWord) return;
  const { start, end } = getTimeWindowBounds();
  const { count, error } = await client.from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("word", targetWord).eq("correct", true)
    .gte("played_at", start)
    .lt("played_at", end);
  if (error || count === null) return;
  el.textContent = `Данас је ${count} ${count === 1 ? "играч" : "играча"} погодило реч`;
  el.style.display = "block";
}

// ─── Load stats from DB ───────────────────────────────────────────────────────

async function loadStatsFromDB() {
  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return;
  const uid = session.user.id;

  if (localStorage.getItem("pending_miss_sync")) {
    localStorage.removeItem("pending_miss_sync");
  }

  await syncStats(uid).catch(() => {});

  await checkAndArchiveSeason();

  // Aggregate ALL seasons to build full career stats
  const [{ data: allRows }, { data: correctSubmissions }] = await Promise.all([
    client
      .from("scores")
      .select("season, attempts, misses, distribution, current_streak, max_streak")
      .eq("user_id", uid)
      .order("season", { ascending: false }),
    client
      .from("submissions")
      .select("attempt")
      .eq("user_id", uid)
      .eq("correct", true)
      .limit(1000)
  ]);

  const scoreRows = allRows || [];

  const currentSeasonRow = scoreRows.find(row => row.season === getCurrentSeason());
  if (currentSeasonRow) {
    const serverSeasonStats = normalizeStats({
      total: (currentSeasonRow.attempts || 0) + (currentSeasonRow.misses || 0),
      wins: currentSeasonRow.attempts || 0,
      misses: currentSeasonRow.misses || 0,
      attempts: currentSeasonRow.distribution,
      currentStreak: currentSeasonRow.current_streak || 0,
      maxStreak: currentSeasonRow.max_streak || 0
    });
    saveSeasonStats(serverSeasonStats);
  }

  const dbWins   = scoreRows.reduce((s, r) => s + (r.attempts || 0), 0);
  const dbMisses = scoreRows.reduce((s, r) => s + (r.misses   || 0), 0);
  const dbTotal  = dbWins + dbMisses;
  const seasonalDist = scoreRows.reduce((acc, r) => {
    const d = Array.isArray(r.distribution) ? r.distribution : [0,0,0,0,0,0,0];
    return acc.map((v, i) => v + (d[i] || 0));
  }, [0,0,0,0,0,0,0]);
  const submissionDist = (correctSubmissions || []).reduce((distribution, submission) => {
    const index = Number(submission.attempt) - 1;
    if (index >= 0 && index < 7) distribution[index]++;
    return distribution;
  }, [0,0,0,0,0,0,0]);
  const dbDist = seasonalDist.map((value, index) => Math.max(value, submissionDist[index]));

  const dbMaxStreak     = scoreRows.reduce((m, r) => Math.max(m, r.max_streak     || 0), 0);
  const dbCurrentStreak = scoreRows[0]?.current_streak || 0; // most recent season first

  await reconcileCareerStats(uid, {
    total: dbTotal,
    wins: dbWins,
    misses: dbMisses,
    attempts: dbDist,
    currentStreak: dbCurrentStreak,
    maxStreak: dbMaxStreak
  });
  renderStatsPopup();
}

// ─── Abandoned game detection ─────────────────────────────────────────────────

async function recordAbandonedGameIfNeeded() {
  const savedState = localStorage.getItem("gameState");
  if (!savedState) return;

  const gameState = JSON.parse(savedState);
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const gameStateWindow = Math.floor((gameState.timestamp - START_TIME) / lockTime);

  if (gameStateWindow >= currentTimeWindow) return; // still current game, not abandoned

  // Game from a previous window was never completed — count as loss
  recordStatsResult(null);
  localStorage.removeItem("gameState");

  const { data: { session } } = await client.auth.getSession();
  if (session?.user) {
    await Promise.all([
      syncStats(session.user.id),
      persistCareerStats(session.user.id)
    ]).catch(console.error);
  }
}

// ─── Game init ────────────────────────────────────────────────────────────────

function showDBLockedScreen(dailyResult = null) {
  const playedWordLength = Number(dailyResult?.word_length);
  if (playedWordLength === 5 || playedWordLength === 6) setPlayedDailyLock(playedWordLength);
  applyDailyLayoutVars();
  if (typeof updateDailyModePicker === "function") updateDailyModePicker();
  disableInput();
  board.classList.add("board--hidden");
  board.style.display = "none";
  resultTitle.innerHTML = "Данас сте већ играли 🎮";
  resultGrid.innerHTML = "";
  resultGrid.style.setProperty("--daily-word-length", playedWordLength === 5 || playedWordLength === 6 ? playedWordLength : activeWordLength());
  removePlayedStatusMessages();
  const msg = document.createElement("div");
  msg.className = "played-status db-played-status";
  msg.style.cssText = "margin-top:10px;color:#aaa;text-align:center;font-size:14px;";
  msg.innerHTML = "<p>Играли сте данас из другог прегледача.</p><p>Нова реч долази ускоро!</p>";
  resultScreen.insertBefore(msg, resultScreen.firstChild);
  resultScreen.style.display = "block";
  document.getElementById("timer").style.display = "block";
  showCountdownToNextWord();
}

async function initGame() {
  applyDailyLayoutVars();
  if (typeof updateDailyModePicker === "function") updateDailyModePicker();
  await recordAbandonedGameIfNeeded();
  await loadStatsFromDB().catch(console.error);
  loadDayHero().catch(console.error);

  if (checkIfLocked()) {
    document.getElementById("timer").style.display = "block";
    showCountdownToNextWord();
    return;
  }

  // DB lock check — only triggers when no same-browser activity exists for today
  // Same browser = gameState timestamp falls in current time window
  const { data: { session } } = await client.auth.getSession();
  if (session?.user && targetWord) {
    const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
    const savedState = localStorage.getItem("gameState");
    const gameStateWindow = savedState
      ? Math.floor((JSON.parse(savedState).timestamp - START_TIME) / lockTime)
      : -1;
    const isSameBrowser = gameStateWindow === currentTimeWindow;
    if (!isSameBrowser) {
      const { start, end } = getTimeWindowBounds();
      let dailyResultCount = 0;
      let dailyResult = null;
      if (typeof getDailyDayKey === "function") {
        const { data } = await client.from("daily_results")
          .select("word_length, correct, attempt, word")
          .eq("user_id", session.user.id)
          .eq("day_key", getDailyDayKey())
          .maybeSingle();
        dailyResult = data || null;
        dailyResultCount = dailyResult ? 1 : 0;
      }
      const { count } = dailyResultCount > 0
        ? { count: dailyResultCount }
        : await client.from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("played_at", start)
        .lt("played_at", end);
      if (count > 0) {
        showDBLockedScreen(dailyResult || { word_length: 6 });
        return;
      }
    }
  }

  board.innerHTML = "";
  board.classList.remove("board--hidden");
  board.style.removeProperty("display");
  keyboard.innerHTML = "";
  keyboard.classList.remove("keyboard--finished");
  resultScreen.classList.remove("result-screen--locked");
  currentRow = 0;
  currentGuess = "";

  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");
  if (lastPlayed !== -1 && lastPlayed !== currentTimeWindow) {
    localStorage.removeItem("gameState");
    localStorage.removeItem("last_result_grid");
    localStorage.removeItem("last_result");
    localStorage.removeItem("last_attempt_row");
    localStorage.removeItem("last_word_length");
    localStorage.removeItem("last_target_word");
    localStorage.removeItem("last_played_timeWindow");
    clearPlayedDailyLock();
    window.location.reload();
    return;
  }

  createBoard();
  createKeyboard();
  loadGameState();
  if (typeof updateDailyModePicker === "function") updateDailyModePicker();
  showCountdownToNextWord();
}
