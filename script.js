const lockTime = 24 * 60 * 60 * 1000;
const START_TIME = new Date("2025-05-19T21:05:00Z").getTime();


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

        // Add animation to the current tile
        const row = board.children[currentRow];
        const tile = row.children[currentGuess.length - 1];
        tile.classList.add('tile-animate');
        setTimeout(() => tile.classList.remove('tile-animate'), 150);

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
    if (currentGuess.length > 0) {
        // Add animation to the row
        const row = board.children[currentRow];
        row.classList.add('row-delete-animate');
        setTimeout(() => row.classList.remove('row-delete-animate'), 150);

        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
        saveGameState(); // Save after deleting a letter
    }
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

async function submitGuess() {
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

    // 3) **record this guess** in Supabase before moving on
    try {
        await client
            .from('submissions')
            .insert([{
                username: localStorage.getItem('username') || 'anon',
                word: targetWord,
                guess: currentGuess,
                attempt: currentRow + 1,
                correct: (currentGuess === targetWord),
                played_at: new Date().toISOString()
            }])
            .throwOnError();
    } catch (e) {
        console.error('Failed to log submission:', e);
        // you could queue this up for retry if offline…
    }


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

    if (win) {
        // Add success animation to all tiles in the current row
        const row = board.children[currentRow];
        [...row.children].forEach((tile, i) => {
            setTimeout(() => {
                tile.classList.add('success-animate');
            }, i * 100); // Stagger the animation
        });

        // Play success sound
        playSuccessSound();

        // Show fireworks after a short delay
        setTimeout(() => {
            createFireworks();
        }, 600);

        // Calculate score and update database
        const scoreMap = [50, 25, 10, 8, 5, 2, 1];
        const score = scoreMap[currentRow] || 0;

        // Get username
        let username = localStorage.getItem("username");
        if (!username) {
            const name = prompt("Унеси своје име за табелу резултата:");
            const trimmed = name ? name.trim() : "";
            if (trimmed.length >= 2) {
                localStorage.setItem("username", trimmed);
                username = trimmed;

                // Update database
                updateLeaderboard(username, score);
            }
        } else {
            // Update database
            updateLeaderboard(username, score);
        }
    }

    // Show result grid after animations
    setTimeout(() => {
        showResultGrid(win);
    }, win ? 1200 : 0);
}


// Add this function at the top of your script.js file
function resetBoardForNewDay() {
    // Get current time window
    const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);

    // Check if we have a saved game state
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
        try {
            // Add a timestamp field to the saved game state if it doesn't exist
            const gameState = JSON.parse(savedState);

            // If there's no timestamp in the saved state, it's old data - clear it
            if (!gameState.timestamp) {
                console.log("Found old game state without timestamp - clearing");
                clearAllGameData();
                return true;
            }

            // Calculate the time window when the game state was saved
            const savedTimeWindow = Math.floor((gameState.timestamp - START_TIME) / lockTime);

            console.log("Game state check - Current window:", currentTimeWindow,
                "Saved window:", savedTimeWindow);

            // If the saved state is from a different day, clear it
            if (savedTimeWindow !== currentTimeWindow) {
                console.log("Game state is from a different day - clearing");
                clearAllGameData();
                return true;
            }
        } catch (e) {
            console.error("Error parsing saved game state:", e);
            clearAllGameData();
            return true;
        }
    }

    return false;
}

// Helper function to clear all game data
function clearAllGameData() {
    console.log("Clearing all game data");
    localStorage.removeItem("gameState");
    localStorage.removeItem("last_result_grid");
    localStorage.removeItem("last_result");
    localStorage.removeItem("last_attempt_row");
    localStorage.removeItem("last_played_timeWindow");

    // Force reload the page to ensure a clean state
    window.location.reload();
}

// Call this function immediately when the script loads
const dayChanged = resetBoardForNewDay();

// 
function disableInput() {
    [...keyboard.children].forEach(key => key.disabled = true);
}

async function updateStats(rowSolved) {
    // 1) compute + persist locally
    let stats = JSON.parse(localStorage.getItem("stats")) || {
        total: 0, wins: 0, attempts: [0, 0, 0, 0, 0, 0, 0]
    };
    stats.total++;
    if (rowSolved !== null) {
        stats.wins++;
        stats.attempts[rowSolved]++;
    }
    localStorage.setItem("stats", JSON.stringify(stats));

    // 2) render exactly as before
    statsEl.innerHTML = `<h3>Statistika</h3>`;
    stats.attempts.forEach((val, i) => {
        statsEl.innerHTML += `<div>Ред ${i + 1}: ${val}</div>`;
    });
    statsEl.innerHTML += `<div style="margin-top:10px;">Укупно: ${stats.wins}/${stats.total}</div>`;

    // 3) if signed in, push up to Supabase
    const { data: { session } } = await client.auth.getSession();
    if (session?.user) {
        // pass the full stats object (including attempts array)
        syncStats(session.user.id, stats)
            .catch(e => console.error('syncStats failed', e));
    }
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

        // Check if we're very close to reset time (within 2 seconds)
        if (remainder < 2000 || remainder > lockTime - 2000) {
            console.log("Very close to reset time, reloading page...");
            window.location.reload();
            return;
        }

        const h = Math.floor(remainder / 3600000);
        const m = Math.floor((remainder % 3600000) / 60000);
        const s = Math.floor((remainder % 60000) / 1000);

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
        if (lastAttemptRow === 0) message = "🌟 Невероватно! Погодак из прве!!!";
        else if (lastAttemptRow === 1) message = "🔥 Сјајно! Погодили сте из другог покушаја!!";
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
    const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");

    // Only lock if they've played THIS specific day's word
    if (lastPlayed === currentTimeWindow) {
        const lastResult = localStorage.getItem("last_result");
        if (lastResult === "win" || lastResult === "lose") {
            console.log("Game is locked - already played today");
            showLockedGameScreen();
            return true;
        }
    } else if (lastPlayed !== -1) {
        // Different day, force clear old data
        console.log("Different day detected in checkIfLocked, clearing old data");
        localStorage.removeItem("gameState");
        localStorage.removeItem("last_result_grid");
    }
    return false;
}

// Add this function to save game state after each row
function saveGameState() {
    const gameState = {
        currentRow,
        currentGuess,
        timestamp: Date.now(), // Add current timestamp
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
    if (!savedState) {
        console.log("No saved game state found");
        return false;
    }

    console.log("Found saved game state, attempting to restore");

    const gameState = JSON.parse(savedState);
    const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
    const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");

    // Check if this is a completed game
    const lastResult = localStorage.getItem("last_result");
    const isCompleted = lastResult === "win" || lastResult === "lose";

    // Only restore if it's the same day AND not a completed game
    if (lastPlayed !== -1 && lastPlayed !== currentTimeWindow) {
        console.log("Not restoring - different day");
        return false;
    }

    if (isCompleted && lastPlayed === currentTimeWindow) {
        console.log("Not restoring - game already completed today");
        return false;
    }

    console.log("Restoring game state");

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
    // Find the last row that has all colored tiles (completed row)
    let lastCompletedRow = -1;
    for (let i = 0; i < gameState.boardState.length; i++) {
        const rowState = gameState.boardState[i];
        // Check if this row is complete (all tiles have colors)
        const allColored = rowState.every(tile => tile.color);
        if (allColored) {
            lastCompletedRow = i;
        } else {
            break;
        }
    }

    // Set currentRow to the row AFTER the last completed row
    currentRow = lastCompletedRow + 1;
    console.log("Setting current row to:", currentRow, "after finding last completed row:", lastCompletedRow);

    // Reset currentGuess since we're starting a new row
    currentGuess = "";

    // Update the board with the current guess (which is empty)
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

// This IIFE runs immediately when the page loads
(function forceResetOldGames() {
    // Get current time window
    const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
    const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");

    console.log("Checking for old game data. Current window:", currentTimeWindow, "Last played:", lastPlayed);

    // Only force reset if we detect data from a DIFFERENT day
    if (lastPlayed !== -1 && lastPlayed !== currentTimeWindow) {
        console.log("Forcing reset of old game data from previous day");
        localStorage.removeItem("gameState");
        localStorage.removeItem("last_result_grid");
        localStorage.removeItem("last_result");
        localStorage.removeItem("last_attempt_row");
        localStorage.removeItem("last_played_timeWindow");

        // Force reload the page to ensure a clean state
        window.location.reload();
    } else {
        console.log("Same day or first visit - preserving game state");
    }
})();


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

// Help button functionality
document.getElementById("helpBtn").onclick = () => {
    document.getElementById("helpModal").style.display = "flex";
};

document.getElementById("closeHelpBtn").onclick = () => {
    document.getElementById("helpModal").style.display = "none";
};

// Show help modal on first visit
if (!localStorage.getItem("helpShown")) {
    setTimeout(() => {
        document.getElementById("helpModal").style.display = "flex";
        localStorage.setItem("helpShown", "true");
    }, 500);
}


function loadLeaderboard(orderBy = "avg_score") {
    // Add debug logging to see what ordering is being used
    console.log("Loading leaderboard with ordering:", orderBy);

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
    loadLeaderboard("avg_score"); // Explicitly pass avg_score
};

document.getElementById("closeLeaderboardBtn").onclick = () => {
    document.getElementById("leaderboardModal").style.display = "none";
};

// Add this function to create fireworks effect
function createFireworks() {
    const firework = document.createElement('div');
    firework.className = 'firework';
    document.body.appendChild(firework);

    // Create multiple particles
    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';

        // Random position
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;

        // Random color
        const colors = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = color;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        firework.appendChild(particle);
    }

    // Remove firework after animation completes
    setTimeout(() => {
        document.body.removeChild(firework);
    }, 1000);
}

// Add success sound
function playSuccessSound() {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Update the endGame function to include animations and sound
function endGame(win) {
    localStorage.setItem("last_played_timeWindow", Math.floor((Date.now() - START_TIME) / lockTime));
    localStorage.setItem("last_result", win ? "win" : "lose");
    localStorage.setItem("last_attempt_row", currentRow.toString());
    saveResultGrid();
    disableInput();
    updateStats(win ? currentRow : null);

    if (win) {
        // Add success animation to all tiles in the current row
        const row = board.children[currentRow];
        [...row.children].forEach((tile, i) => {
            setTimeout(() => {
                tile.classList.add('success-animate');
            }, i * 100); // Stagger the animation
        });

        // Play success sound
        playSuccessSound();

        // Show fireworks after a short delay
        setTimeout(() => {
            createFireworks();
        }, 600);

        // Calculate score and update database
        const scoreMap = [50, 25, 10, 8, 5, 2, 1];
        const score = scoreMap[currentRow] || 0;

        // Get username
        let username = localStorage.getItem("username");
        if (!username) {
            const name = prompt("Унеси своје име за табелу резултата:");
            const trimmed = name ? name.trim() : "";
            if (trimmed.length >= 2) {
                localStorage.setItem("username", trimmed);
                username = trimmed;

                // Update database
                updateLeaderboard(username, score);
            }
        } else {
            // Update database
            updateLeaderboard(username, score);
        }
    }

    // Show result grid after animations
    setTimeout(() => {
        showResultGrid(win);
    }, win ? 1200 : 0);
}

// Helper function to update leaderboard
async function updateLeaderboard(username, score) {
    const { data: { session }, error: sessErr } = await client.auth.getSession();
    if (sessErr || !session) {
        console.log('Not signed in – skipping leaderboard update');
        return;
    }
    const uid = session.user.id;

    // build the payload
    const payload = {
        user_id: uid,
        username,            // upsert will match on this
        score,               // points from *this* play
        attempts: 1,        // always +1
        avg_score: score     // interim
    };

    // 1) upsert by username
    const { error: upsertErr } = await client
        .from('scores')
        .upsert([payload], { onConflict: 'username' });
    if (upsertErr) {
        console.error('Upsert failed', upsertErr);
        return;
    }

    // 2) call your new RPC to aggregate totals
    const { error: aggErr } = await client.rpc('increment_score_and_attempts', {
        p_username: username,
        p_add_score: score
    });
    if (aggErr) {
        console.error('Aggregation RPC failed', aggErr);
    }
  }

// Add this function to initialize the game properly
function initGame() {
 // immediately pull+merge
  await loadStatsFromDB();
    // Check if game is locked (already played today)
    if (checkIfLocked()) {
        // show the countdown even when the board is locked
        document.getElementById("timer").style.display = "block";
        showCountdownToNextWord();
        return;
    }

    // Clear the board first
    board.innerHTML = "";
    keyboard.innerHTML = "";

    // Reset game state
    currentRow = 0;
    currentGuess = "";

    // Get today's word
    const { word: todayWord, hint: todayHint } = getTodayWord();

    // Set global variables
    window.targetWord = todayWord;
    window.hintText = todayHint;

    // Get current time window
    const currentTimeWindow = Math.floor((Date.now() - START_TIME) / lockTime);
    const lastPlayed = parseInt(localStorage.getItem("last_played_timeWindow") || "-1");

    if (lastPlayed !== -1 && lastPlayed !== currentTimeWindow) {
        console.log("Day change detected in initialization - clearing data");
        localStorage.removeItem("gameState");
        localStorage.removeItem("last_result_grid");
        localStorage.removeItem("last_result");
        localStorage.removeItem("last_attempt_row");
        localStorage.removeItem("last_played_timeWindow");
        window.location.reload();
    }

    // Create UI elements
    createBoard();
    createKeyboard();

 

    // Try to load saved state
    loadGameState();

    // Start countdown timer
    showCountdownToNextWord();


    loadStatsFromDB().catch(console.error);
}



async function loadStatsFromDB() {
  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return;
  const uid = session.user.id;

  // 1) pull DB
  const { data: db, error } = await client
    .from('scores')
    .select('distribution, score, attempts')
    .eq('user_id', uid)
    .single();
  if (error) {
    console.error('Load DB stats failed', error);
    return;
  }

  // 2) pull local
  const local = JSON.parse(localStorage.getItem('stats')) || {
    total: 0,
    wins: 0,
    attempts: [0,0,0,0,0,0,0]
  };

  // ensure we have a 7-slot distribution array from DB
  const dbDist = Array.isArray(db.distribution) && db.distribution.length === 7
    ? db.distribution
    : [0,0,0,0,0,0,0];

  // 3) merge
  const merged = {
    total: (db.attempts||0) + local.total,
    wins:  (db.score||0)    + local.wins,
    attempts: dbDist.map((v,i) => v + (local.attempts[i]||0))
  };

  // 4) write back to local
  localStorage.setItem('stats', JSON.stringify(merged));

  // 5) push merged back to DB in one shot
  await syncStats(uid, merged);

  // 6) update your UI
  renderStatsPopup();
}