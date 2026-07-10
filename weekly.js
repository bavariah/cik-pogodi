const WEEKLY_WORDS_TABLE = "weekly_words";
const WEEKLY_ACCEPTED_WORDS_TABLE = "weekly_accepted_words";
const WEEKLY_RESULT_SCORE = [20, 12, 8, 5, 3];
const WEEKLY_ANCHOR_SATURDAY = new Date(2026, 0, 3);
const WEEKLY_ROW_COUNT = 5;
const WEEKLY_WORD_LENGTH = 4;

let weeklyWord = "";
let weeklyRow = 0;
let weeklyGuess = "";
let weeklyFlipping = false;
let weeklyKeyboardReady = false;

function getWeeklyWindow() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 1) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  const key = [
    start.getFullYear(),
    String(start.getMonth() + 1).padStart(2, "0"),
    String(start.getDate()).padStart(2, "0")
  ].join("-");
  const weekIndex = Math.max(0, Math.floor((start - WEEKLY_ANCHOR_SATURDAY) / (7 * 24 * 60 * 60 * 1000)));
  return { start, end, key, weekIndex };
}

function getWeeklyStateKey() {
  return `weekly_challenge_${getWeeklyWindow().key}`;
}

function escapeWeeklyHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function setWeeklyStatus(text) {
  const el = document.getElementById("weeklyStatus");
  if (el) el.textContent = text;
}

function openWeeklyModal() {
  document.getElementById("weeklyModal").style.display = "flex";
  loadWeeklyChallenge().catch(error => {
    console.error("Weekly challenge failed:", error);
    setWeeklyStatus("Недељни изазов још није спреман.");
  });
}

function closeWeeklyModal() {
  document.getElementById("weeklyModal").style.display = "none";
}

async function loadWeeklyChallenge() {
  const { weekIndex, key } = getWeeklyWindow();
  const meta = document.getElementById("weeklyMeta");
  if (meta) meta.textContent = "Svake subote nova nedeljna bonus reč";

  const { count, error: countError } = await client
    .from(WEEKLY_WORDS_TABLE)
    .select("*", { count: "exact", head: true })
    .eq("active", true);
  if (countError) throw countError;
  if (!count) {
    setWeeklyStatus("Нема учитаних недељних речи.");
    return;
  }

  const targetIndex = weekIndex % count;
  const { data, error } = await client
    .from(WEEKLY_WORDS_TABLE)
    .select("word,sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .range(targetIndex, targetIndex)
    .maybeSingle();
  if (error) throw error;
  if (!data?.word) {
    setWeeklyStatus("Недељна реч није пронађена.");
    return;
  }

  weeklyWord = data.word.trim().toLowerCase();
  weeklyRow = 0;
  weeklyGuess = "";
  weeklyFlipping = false;
  buildWeeklyBoard();
  buildWeeklyKeyboard();

  const saved = loadWeeklyState();
  if (!saved) setWeeklyStatus("4 слова · 5 покушаја · бонус поени за сезону");

  const { data: { session } } = await client.auth.getSession();
  if (session?.user && !saved?.completed) {
    const { data: existing } = await client
      .from("weekly_results")
      .select("attempt, correct, points")
      .eq("user_id", session.user.id)
      .eq("week_key", key)
      .maybeSingle();
    if (existing) showWeeklyLocked(existing);
  }
}

function buildWeeklyBoard() {
  const board = document.getElementById("weeklyBoard");
  board.innerHTML = "";
  for (let i = 0; i < WEEKLY_ROW_COUNT; i++) {
    const row = document.createElement("div");
    row.className = "weekly-row";
    for (let j = 0; j < WEEKLY_WORD_LENGTH; j++) {
      const tile = document.createElement("div");
      tile.className = "weekly-tile";
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function buildWeeklyKeyboard() {
  const keyboard = document.getElementById("weeklyKeyboard");
  keyboard.innerHTML = "";
  keyboard.classList.remove("weekly-keyboard--finished");
  const layout = [
    "Љ Њ Е Р Т З У И О П Ш",
    "А С Д Ф Г Х Ј К Л Ч Ћ",
    "Џ Ц В Б Н М Ђ Ж"
  ];
  layout.forEach(rowText => {
    const row = document.createElement("div");
    row.className = "weekly-keyboard-row";
    rowText.split(" ").forEach(letter => {
      const key = document.createElement("button");
      key.className = "weekly-key";
      key.type = "button";
      key.textContent = letter;
      key.onclick = () => handleWeeklyKey(letter);
      row.appendChild(key);
    });
    keyboard.appendChild(row);
  });

  const actions = document.createElement("div");
  actions.className = "weekly-keyboard-row weekly-keyboard-actions";
  const enter = document.createElement("button");
  enter.className = "weekly-key weekly-key-wide weekly-key-enter";
  enter.type = "button";
  enter.textContent = "⏎";
  enter.onclick = submitWeeklyGuess;
  const del = document.createElement("button");
  del.className = "weekly-key weekly-key-wide weekly-key-delete";
  del.type = "button";
  del.textContent = "⌫";
  del.onclick = deleteWeeklyLetter;
  actions.appendChild(enter);
  actions.appendChild(del);
  keyboard.appendChild(actions);
  weeklyKeyboardReady = true;
}

function handleWeeklyKey(letter) {
  if (weeklyFlipping || !weeklyWord) return;
  if (weeklyGuess.length >= WEEKLY_WORD_LENGTH) return;
  weeklyGuess += letter.toLowerCase();
  updateWeeklyBoard();
  saveWeeklyState();
}

function deleteWeeklyLetter() {
  if (weeklyFlipping || !weeklyGuess.length) return;
  weeklyGuess = weeklyGuess.slice(0, -1);
  updateWeeklyBoard();
  saveWeeklyState();
}

function updateWeeklyBoard() {
  const row = document.getElementById("weeklyBoard").children[weeklyRow];
  if (!row) return;
  [...row.children].forEach((tile, index) => {
    tile.textContent = weeklyGuess[index] || "";
  });
}

async function isWeeklyKnownWord(word) {
  const normalized = word.trim().toLowerCase();
  const { data, error } = await client
    .from(WEEKLY_ACCEPTED_WORDS_TABLE)
    .select("word")
    .eq("word", normalized)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("Weekly word validation failed:", error);
    return false;
  }
  return !!data;
}

async function submitWeeklyGuess() {
  if (weeklyFlipping || !weeklyWord) return;
  if (weeklyGuess.length !== WEEKLY_WORD_LENGTH) {
    shakeWeeklyRow();
    setWeeklyStatus("Реч мора имати 4 слова.");
    return;
  }
  weeklyFlipping = true;

  if (!(await isWeeklyKnownWord(weeklyGuess))) {
    weeklyFlipping = false;
    shakeWeeklyRow();
    setWeeklyStatus("Реч није у недељном речнику.");
    return;
  }

  const row = document.getElementById("weeklyBoard").children[weeklyRow];
  const target = weeklyWord.split("");
  const guess = weeklyGuess.split("");
  const status = Array(WEEKLY_WORD_LENGTH).fill("grey");

  for (let i = 0; i < WEEKLY_WORD_LENGTH; i++) {
    if (guess[i] === target[i]) {
      status[i] = "green";
      target[i] = null;
    }
  }
  for (let i = 0; i < WEEKLY_WORD_LENGTH; i++) {
    if (status[i] === "grey" && target.includes(guess[i])) {
      status[i] = "orange";
      target[target.indexOf(guess[i])] = null;
    }
  }

  guess.forEach((letter, index) => {
    const tile = row.children[index];
    setTimeout(() => {
      tile.classList.add("flipping");
    }, index * 90);
    setTimeout(() => {
      tile.classList.add(status[index]);
      tile.classList.remove("flipping");
      markWeeklyKey(letter, status[index]);
    }, index * 90 + 220);
  });

  await new Promise(resolve => setTimeout(resolve, 640));
  weeklyFlipping = false;

  const win = weeklyGuess === weeklyWord;
  const lose = !win && weeklyRow === WEEKLY_ROW_COUNT - 1;
  if (win || lose) {
    await finishWeeklyChallenge(win);
    return;
  }

  weeklyRow++;
  weeklyGuess = "";
  saveWeeklyState();
  setWeeklyStatus(`${WEEKLY_ROW_COUNT - weeklyRow} покушаја је остало.`);
}

function markWeeklyKey(letter, status) {
  const key = [...document.querySelectorAll(".weekly-key")].find(item => item.textContent === letter.toUpperCase());
  if (!key || key.classList.contains("green")) return;
  if (status === "green") {
    key.classList.remove("orange", "grey");
    key.classList.add("green");
  } else if (status === "orange") {
    key.classList.remove("grey");
    key.classList.add("orange");
  } else if (!key.classList.contains("orange")) {
    key.classList.add("grey");
  }
}

function shakeWeeklyRow() {
  const row = document.getElementById("weeklyBoard").children[weeklyRow];
  if (!row) return;
  row.classList.add("shake");
  setTimeout(() => row.classList.remove("shake"), 350);
}

async function finishWeeklyChallenge(win) {
  const points = win ? WEEKLY_RESULT_SCORE[weeklyRow] || 1 : 0;
  const state = saveWeeklyState({ completed: true, result: win ? "win" : "lose", points });
  document.getElementById("weeklyKeyboard").classList.add("weekly-keyboard--finished");

  const { key } = getWeeklyWindow();
  const { data: { session } } = await client.auth.getSession();
  if (session?.user && typeof syncStats === "function") {
    await syncStats(session.user.id).catch(console.error);
  }
  const username = localStorage.getItem("username") || "anon";
  const { error } = await client.rpc("record_weekly_challenge_result", {
    p_week_key: key,
    p_word: weeklyWord,
    p_guess: weeklyGuess,
    p_attempt: weeklyRow + 1,
    p_correct: win,
    p_points: points,
    p_username: username,
    p_season: typeof getCurrentSeason === "function" ? getCurrentSeason() : ""
  });
  if (error) console.error("Failed to record weekly result:", error);

  showWeeklyResult(win, points, state);
  updateWeeklyLauncher().catch(console.error);
}

function getWeeklyGridState() {
  return [...document.querySelectorAll("#weeklyBoard .weekly-row")].map(row =>
    [...row.children].map(tile => ({
      letter: tile.textContent || "",
      color: tile.classList.contains("green") ? "green" :
        tile.classList.contains("orange") ? "orange" :
        tile.classList.contains("grey") ? "grey" : ""
    }))
  );
}

function saveWeeklyState(extra = {}) {
  const state = {
    word: weeklyWord,
    row: weeklyRow,
    guess: weeklyGuess,
    grid: getWeeklyGridState(),
    updatedAt: Date.now(),
    ...extra
  };
  localStorage.setItem(getWeeklyStateKey(), JSON.stringify(state));
  return state;
}

function loadWeeklyState() {
  const raw = localStorage.getItem(getWeeklyStateKey());
  if (!raw) return null;
  let state;
  try {
    state = JSON.parse(raw);
  } catch {
    return null;
  }
  if (state.word && state.word !== weeklyWord) return null;
  (state.grid || []).forEach((rowState, rowIndex) => {
    const row = document.getElementById("weeklyBoard").children[rowIndex];
    if (!row) return;
    rowState.forEach((tileState, tileIndex) => {
      const tile = row.children[tileIndex];
      if (!tile) return;
      tile.textContent = tileState.letter || "";
      if (tileState.color) {
        tile.classList.add(tileState.color);
        markWeeklyKey(tileState.letter || "", tileState.color);
      }
    });
  });
  weeklyRow = state.row || 0;
  weeklyGuess = state.guess || "";
  updateWeeklyBoard();
  if (state.completed) {
    document.getElementById("weeklyKeyboard").classList.add("weekly-keyboard--finished");
    showWeeklyResult(state.result === "win", state.points || 0, state);
  }
  return state;
}

function showWeeklyResult(win, points, state = null) {
  const result = document.getElementById("weeklyResult");
  const title = win
    ? `Погођено из ${weeklyRow + 1}. покушаја`
    : `Тачна реч је: ${weeklyWord.toUpperCase()}`;
  const subtitle = win
    ? `+${points} бонус поена за сезону`
    : "Следећа недељна реч стиже у суботу.";
  result.innerHTML = `
    <div class="weekly-result-title">${escapeWeeklyHtml(title)}</div>
    <div class="weekly-result-subtitle">${escapeWeeklyHtml(subtitle)}</div>
    <button id="weeklyShareBtn" type="button" class="weekly-primary-btn">Подели недељни резултат</button>
  `;
  result.style.display = "block";
  setWeeklyStatus(win ? "Недељни изазов завршен." : "Више среће следеће недеље.");
  document.getElementById("weeklyShareBtn").onclick = () => shareWeeklyResult(win, points, state);
}

function showWeeklyLocked(existing) {
  weeklyFlipping = true;
  document.getElementById("weeklyKeyboard").classList.add("weekly-keyboard--finished");
  const points = existing.points || 0;
  document.getElementById("weeklyResult").innerHTML = `
    <div class="weekly-result-title">Већ сте одиграли овај недељни изазов</div>
    <div class="weekly-result-subtitle">${existing.correct ? `Освојено: ${points} бонус поена` : "Нова реч стиже у суботу."}</div>
  `;
  document.getElementById("weeklyResult").style.display = "block";
  setWeeklyStatus("Недељни резултат је већ сачуван.");
}

function shareWeeklyResult(win, points, state = null) {
  const grid = (state?.grid || getWeeklyGridState()).slice(0, win ? weeklyRow + 1 : WEEKLY_ROW_COUNT);
  const emoji = { green: "🟩", orange: "🟧", grey: "⬛" };
  const { key } = getWeeklyWindow();
  const text = [
    `Чик Погоди недељни изазов ${key}`,
    win ? `${weeklyRow + 1}/5 · +${points} поена` : "X/5",
    grid.map(row => row.map(tile => emoji[tile.color] || "⬛").join("")).join("\n"),
    "https://bavariah.github.io/cik-pogodi/"
  ].join("\n");
  if (navigator.share) {
    navigator.share({ title: "Чик Погоди недељни изазов", text }).catch(() => fallbackWeeklyShare(text));
  } else {
    fallbackWeeklyShare(text);
  }
}

function fallbackWeeklyShare(text) {
  navigator.clipboard.writeText(text).then(() => showToast("Недељни резултат је копиран."));
}

async function updateWeeklyLauncher() {
  const card = document.getElementById("weeklyChallengeCard");
  if (!card) return;
  const { key, end } = getWeeklyWindow();
  const state = JSON.parse(localStorage.getItem(getWeeklyStateKey()) || "null");
  const title = document.getElementById("weeklyCardTitle");
  const detail = document.getElementById("weeklyCardDetail");
  const next = end.toLocaleDateString("sr-RS", { weekday: "long" });
  if (title) title.textContent = state?.completed ? "Недељни резултат је спреман" : "Недељна реч од 4 слова";
  if (detail) {
    detail.textContent = state?.completed
      ? (state.result === "win" ? `Освојено ${state.points || 0} бонус поена` : `Нова реч стиже: ${next}`)
      : `5 покушаја · бонус поени · важи до: ${next}`;
  }

  const { count } = await client
    .from("weekly_results")
    .select("*", { count: "exact", head: true })
    .eq("week_key", key)
    .eq("correct", true);
  const solved = document.getElementById("weeklyCardSolved");
  if (solved && count !== null) solved.textContent = `${count} решило ове недеље`;
}

async function refreshWeeklyProfileStats(userId) {
  const solvedEl = document.getElementById("profileWeeklySolved");
  const pointsEl = document.getElementById("profileWeeklyPoints");
  if (!solvedEl || !pointsEl || !userId) return;
  const { data, error } = await client
    .from("weekly_results")
    .select("correct, points")
    .eq("user_id", userId);
  if (error) {
    solvedEl.textContent = "0";
    pointsEl.textContent = "0";
    return;
  }
  const wins = (data || []).filter(row => row.correct).length;
  const points = (data || []).reduce((sum, row) => sum + (row.points || 0), 0);
  solvedEl.textContent = wins;
  pointsEl.textContent = points;
}

function weeklyKeyboardHandler(event) {
  const modal = document.getElementById("weeklyModal");
  if (!modal || modal.style.display !== "flex") return;
  if (!weeklyKeyboardReady) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const map = {
    q: "Љ", w: "Њ", e: "Е", r: "Р", t: "Т", z: "З", u: "У", i: "И", o: "О", p: "П", "[": "Ш",
    a: "А", s: "С", d: "Д", f: "Ф", g: "Г", h: "Х", j: "Ј", k: "К", l: "Л", ";": "Ч", "'": "Ћ",
    x: "Џ", c: "Ц", v: "В", b: "Б", n: "Н", m: "М", ",": "Ђ", ".": "Ж"
  };
  if (event.key === "Enter") submitWeeklyGuess();
  else if (event.key === "Backspace") deleteWeeklyLetter();
  else {
    const mapped = map[event.key.toLowerCase()];
    if (mapped) handleWeeklyKey(mapped);
    else if (event.key.length === 1 && "абвгдђежзијклљмнњопрстћуфхцчџш".includes(event.key.toLowerCase())) {
      handleWeeklyKey(event.key.toUpperCase());
    }
  }
}

window.openWeeklyModal = openWeeklyModal;
window.refreshWeeklyProfileStats = refreshWeeklyProfileStats;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("weeklyChallengeCard")?.addEventListener("click", openWeeklyModal);
  document.getElementById("closeWeeklyBtn")?.addEventListener("click", closeWeeklyModal);
  document.getElementById("weeklyModal")?.addEventListener("click", event => {
    if (event.target.id === "weeklyModal") closeWeeklyModal();
  });
  document.addEventListener("keydown", weeklyKeyboardHandler, true);
  updateWeeklyLauncher().catch(console.error);
});
