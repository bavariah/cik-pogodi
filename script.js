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

// ─── Season helpers ───────────────────────────────────────────────────────────

function getCurrentSeason() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() < 6 ? "S1" : "S2"}`;
}

function getSeasonLabel(s) {
  const [year, half] = s.split("-");
  return `${year} ${half === "S1" ? "Јануар–Јун" : "Јул–Децембар"}`;
}

// ─── Board & keyboard ─────────────────────────────────────────────────────────

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
    const row = board.children[currentRow];
    const tile = row.children[currentGuess.length - 1];
    tile.classList.add("tile-animate");
    setTimeout(() => tile.classList.remove("tile-animate"), 150);
    saveGameState();
  }
}

function updateBoard() {
  const row = board.children[currentRow];
  [...row.children].forEach((tile, i) => { tile.textContent = currentGuess[i] || ""; });
}

function deleteLetter() {
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

// ─── Result grid save ─────────────────────────────────────────────────────────

function saveResultGrid() {
  const resultData = [];
  const rows = document.querySelectorAll(".row");
  for (let i = 0; i < 7; i++) {
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

// ─── Miss tracking ────────────────────────────────────────────────────────────

function checkAndRecordMiss(gameState, savedTimeWindow) {
  if (!gameState || !gameState.boardState) return;
  const lastResult = localStorage.getItem("last_result");
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");
  if (lastPlayed === savedTimeWindow && lastResult) return;
  const hasGuesses = gameState.boardState.some(row => row.some(tile => tile.color));
  if (!hasGuesses) return;

  let stats = JSON.parse(localStorage.getItem("stats")) || {
    total: 0, wins: 0, attempts: [0, 0, 0, 0, 0, 0, 0], misses: 0, currentStreak: 0, maxStreak: 0
  };
  stats.total++;
  stats.misses = (stats.misses || 0) + 1;
  stats.currentStreak = 0;
  localStorage.setItem("stats", JSON.stringify(stats));
  localStorage.setItem("pending_miss_sync", "1");
}

// ─── Submit guess ─────────────────────────────────────────────────────────────

async function submitGuess() {
  if (currentGuess.length !== 6) {
    const row = board.children[currentRow];
    row.classList.add("shake");
    setTimeout(() => row.classList.remove("shake"), 350);
    showToast("Реч мора имати 6 слова");
    return;
  }

  const row = board.children[currentRow];
  const targetArr = targetWord.split("");
  const guessArr = currentGuess.split("");
  const tileStatus = Array(6).fill("grey");

  for (let i = 0; i < 6; i++) {
    if (guessArr[i] === targetArr[i]) { tileStatus[i] = "green"; targetArr[i] = null; }
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
      if (!key.classList.contains("green")) {
        if (tileStatus[i] === "green") { key.classList.remove("orange", "grey"); key.classList.add("green"); }
        else if (tileStatus[i] === "orange" && !key.classList.contains("green")) { key.classList.remove("grey"); key.classList.add("orange"); }
        else if (!key.classList.contains("orange") && !key.classList.contains("green")) { key.classList.add("grey"); }
      }
    }
  });

  try {
    await client.from("submissions").insert([{
      username: localStorage.getItem("username") || "anon",
      word: targetWord, guess: currentGuess,
      attempt: currentRow + 1, correct: (currentGuess === targetWord),
      played_at: new Date().toISOString()
    }]).throwOnError();
  } catch (e) { console.error("Failed to log submission:", e); }

  if (currentGuess === targetWord) return endGame(true);
  if (currentRow === 6) return endGame(false);

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
  localStorage.removeItem("last_played_timeWindow");
  window.location.reload();
}

const dayChanged = resetBoardForNewDay();

function disableInput() {
  [...keyboard.children].forEach(row => {
    [...row.children].forEach(key => key.disabled = true);
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

async function updateStats(rowSolved) {
  let stats = JSON.parse(localStorage.getItem("stats")) || {
    total: 0, wins: 0, attempts: [0, 0, 0, 0, 0, 0, 0], misses: 0, currentStreak: 0, maxStreak: 0
  };
  stats.misses = stats.misses || 0;
  stats.currentStreak = stats.currentStreak || 0;
  stats.maxStreak = stats.maxStreak || 0;

  stats.total++;
  if (rowSolved !== null) {
    stats.wins++;
    stats.attempts[rowSolved]++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
  } else {
    stats.currentStreak = 0;
  }
  localStorage.setItem("stats", JSON.stringify(stats));

  const { data: { session } } = await client.auth.getSession();
  if (session?.user) {
    syncStats(session.user.id, stats).catch(e => console.error("syncStats failed", e));
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
  distTitle.textContent = "Расподела погодака";
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
  disableInput();
  const win = localStorage.getItem("last_result") === "win";
  const lastAttemptRow = parseInt(localStorage.getItem("last_attempt_row") || "6");
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

  if (win) {
    let message = "Браво! Погодили сте реч!";
    if (lastAttemptRow === 0) message = "🌟 Невероватно! Погодак из прве!!!";
    else if (lastAttemptRow === 1) message = "🔥 Сјајно! Погодили сте из другог покушаја!!";
    else if (lastAttemptRow === 2) message = "💪 Одлично! Трећи покушај и успех!";
    else if (lastAttemptRow === 3) message = "👏 Није било лако, али успели сте у четвртом покушају!";
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

  const shareBtn = document.getElementById("shareImageBtn");
  if (shareBtn) {
    shareBtn.onclick = () => {
      const emojiMap = { green: "🟩", orange: "🟧", grey: "⬛" };
      const grid = JSON.parse(localStorage.getItem("last_result_grid") || "[]");
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

  showYesterdayWord();
  loadDailyStats().catch(console.error);
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
  }
  return false;
}

// ─── Game state persistence ───────────────────────────────────────────────────

function saveGameState() {
  const gameState = { currentRow, currentGuess, timestamp: Date.now(), boardState: [] };
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

function loadGameState() {
  const savedState = localStorage.getItem("gameState");
  if (!savedState) return false;
  const gameState = JSON.parse(savedState);
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");
  const isCompleted = ["win", "lose"].includes(localStorage.getItem("last_result"));
  if (lastPlayed !== -1 && lastPlayed !== currentTimeWindow) return false;
  if (isCompleted && lastPlayed === currentTimeWindow) return false;

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
  if (currentRow >= 6) {
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
    localStorage.removeItem("last_played_timeWindow");
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
hintIconBtn.style.display = currentRow < 6 ? "none" : "block";
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

async function loadLeaderboard(orderBy = "avg_score") {
  document.getElementById("leaderboardModal").style.display = "flex";
  const container = document.getElementById("leaderboardContent");
  container.innerHTML = "<p style='color:#aaa;text-align:center;'>Учитавање...</p>";

  if (orderBy === "hof") {
    const { data, error } = await client
      .from("hall_of_fame")
      .select("season, username, rank, score, avg_score, attempts")
      .order("season", { ascending: false })
      .order("rank", { ascending: true });

    if (error || !data || data.length === 0) {
      container.innerHTML = "<p style='color:#aaa;text-align:center;'>Нема података о претходним сезонама.</p>";
      return;
    }

    const seasons = [...new Set(data.map(r => r.season))];
    container.innerHTML = seasons.map(season => {
      const players = data.filter(r => r.season === season);
      const rows = players.map(p => `
        <div style="display:flex;flex-direction:column;padding:7px 0;border-bottom:1px solid #333;">
          <div style="font-size:14px;">${p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank-1] : "<span style='color:#aaa;font-size:12px;margin-right:4px;'>" + p.rank + ".</span>"} <strong>${p.username}</strong></div>
          <div style="font-size:12px;color:#aaa;margin-top:3px;padding-left:4px;">${p.score} пт &nbsp;·&nbsp; ${(p.avg_score||0).toFixed(1)} пт/игри &nbsp;·&nbsp; ${p.attempts} игара</div>
        </div>`).join("");
      return `<div style="margin-bottom:20px;">
        <div style="font-size:12px;color:#ffd700;margin-bottom:8px;font-weight:bold;letter-spacing:0.5px;">🏅 ${getSeasonLabel(season)}</div>
        ${rows}
      </div>`;
    }).join("");
    return;
  }

  const { data, error } = await client
    .from("scores")
    .select("username, score, avg_score, attempts")
    .eq("season", getCurrentSeason())
    .order(orderBy, { ascending: false })
    .limit(10);

  if (error) { container.innerHTML = "<p>Грешка при учитавању.</p>"; return; }

  const seasonLabel = getSeasonLabel(getCurrentSeason());
  container.innerHTML = `<div style="font-size:11px;color:#aaa;margin-bottom:10px;text-align:center;">${seasonLabel}</div>`
    + data.map((entry, i) => {
      const text = orderBy === "avg_score"
        ? `${(entry.avg_score || 0).toFixed(1)} пт/игри (${entry.attempts || 0} игара)`
        : `${entry.score || 0} поена (${entry.attempts || 0} игара)`;
      return `<div style="padding:6px 0;border-bottom:1px solid #333;">${i + 1}. <strong>${entry.username || "Анон"}</strong>  ${text}</div>`;
    }).join("");
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
        .eq("season", season).order("score", { ascending: false }).limit(10);

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
  const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3");
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

// ─── Game end ─────────────────────────────────────────────────────────────────

function endGame(win) {
  localStorage.setItem("last_played_timeWindow", Math.floor((Date.now() - START_TIME) / lockTime));
  localStorage.setItem("last_result", win ? "win" : "lose");
  localStorage.setItem("last_attempt_row", currentRow.toString());
  saveResultGrid();
  disableInput();
  updateStats(win ? currentRow : null);

  if (win) {
    const row = board.children[currentRow];
    [...row.children].forEach((tile, i) => {
      setTimeout(() => tile.classList.add("success-animate"), i * 100);
    });
    playSuccessSound();
    setTimeout(() => createFireworks(), 600);
    const scoreMap = [50, 25, 10, 8, 5, 2, 1];
    updateLeaderboard(localStorage.getItem("username"), scoreMap[currentRow] || 0);
  }

  setTimeout(() => {
    showResultGrid(win);
    showYesterdayWord();
    loadDailyStats().catch(console.error);
  }, win ? 1200 : 0);
}

// ─── Leaderboard DB update ────────────────────────────────────────────────────

async function updateLeaderboard(username, score) {
  const { data: { session }, error: sessErr } = await client.auth.getSession();
  if (sessErr || !session) return;
  const uid = session.user.id;
  const season = getCurrentSeason();

  const { data, error } = await client.from("scores")
    .select("id, score, attempts")
    .eq("user_id", uid).eq("season", season).maybeSingle();

  if (error && error.code !== "PGRST116") { console.error("Lookup error:", error); return; }

  if (data) {
    const newScore = (data.score || 0) + score;
    const newAttempts = (data.attempts || 0) + 1;
    await client.from("scores").update({
      score: newScore, attempts: newAttempts,
      avg_score: parseFloat((newScore / newAttempts).toFixed(2))
    }).eq("id", data.id);
  } else {
    await client.from("scores").insert([{
      user_id: uid, username: username || "Анон",
      score, attempts: 1, avg_score: score, season
    }]);
  }
}

// ─── After-game info ──────────────────────────────────────────────────────────

function showYesterdayWord() {
  if (!gameWords || gameWords.length === 0) return;
  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  if (currentTimeWindow === 0) return;
  const yesterdayEntry = gameWords[(currentTimeWindow - 1) % gameWords.length];
  if (!yesterdayEntry) return;
  const el = document.getElementById("yesterdaySection");
  if (el) {
    el.textContent = `Јучерашња реч је била: ${yesterdayEntry.word.toUpperCase()}`;
    el.style.display = "block";
  }
}

async function loadDailyStats() {
  const el = document.getElementById("dailyStatsBar");
  if (!el || !targetWord) return;
  const { count, error } = await client.from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("word", targetWord).eq("correct", true);
  if (error || !count) return;
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
    const localStats = JSON.parse(localStorage.getItem("stats"));
    if (localStats) await syncStats(uid, localStats).catch(() => {});
  }

  await checkAndArchiveSeason();

  const { data } = await client.from("scores")
    .select("distribution, score, attempts, misses, current_streak, max_streak")
    .eq("user_id", uid).eq("season", getCurrentSeason()).maybeSingle();

  if (data) {
    const local = JSON.parse(localStorage.getItem("stats")) || {};
    const dist = data.distribution || local.attempts || [0, 0, 0, 0, 0, 0, 0];
    const merged = {
      total: Math.max(data.attempts || 0, local.total || 0),
      wins: dist.reduce((a, b) => a + b, 0),
      attempts: dist,
      misses: Math.max(data.misses || 0, local.misses || 0),
      currentStreak: data.current_streak || local.currentStreak || 0,
      maxStreak: Math.max(data.max_streak || 0, local.maxStreak || 0)
    };
    localStorage.setItem("stats", JSON.stringify(merged));
    renderStatsPopup();
  }
}

// ─── Game init ────────────────────────────────────────────────────────────────

function initGame() {
  if (checkIfLocked()) {
    document.getElementById("timer").style.display = "block";
    showCountdownToNextWord();
    return;
  }

  board.innerHTML = "";
  keyboard.innerHTML = "";
  currentRow = 0;
  currentGuess = "";

  const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
  const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");
  if (lastPlayed !== -1 && lastPlayed !== currentTimeWindow) {
    localStorage.removeItem("gameState");
    localStorage.removeItem("last_result_grid");
    localStorage.removeItem("last_result");
    localStorage.removeItem("last_attempt_row");
    localStorage.removeItem("last_played_timeWindow");
    window.location.reload();
    return;
  }

  createBoard();
  createKeyboard();
  loadGameState();
  showCountdownToNextWord();
  loadStatsFromDB().catch(console.error);
}
