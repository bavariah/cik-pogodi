// Expanded word list (add more as needed)
const wordList = [
    "srpski", "knjiga", "prijem", "slasno", "kvasac",
    "nikako", "terasa", "igramo", "ukrasi", "prozor",
    "jastuk", "pijaca", "dobiti", "ulazni"
];

// Lockout logic: prevent playing again within 12 hours
const now = Date.now();
const lockUntil = parseInt(localStorage.getItem("locked_until") || 0);

if (now < lockUntil) {
    document.body.innerHTML = `<h2 style="text-align:center;margin-top:40px;color:white">
      Već ste igrali. Vratite se kasnije 😊
    </h2>`;
    throw new Error("Game locked until next cycle.");
}

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const scoreEl = document.getElementById("score");

let currentRow = 0;
let currentGuess = "";
let score = JSON.parse(localStorage.getItem("score")) || { wins: 0, total: 0 };

function getTodayWord() {
    const index = Math.floor(Date.now() / (1000 * 60 * 60 * 12)) % wordList.length;
    return wordList[index];
}

const targetWord = getTodayWord();
const lockTime = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

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

    // First pass - correct positions
    for (let i = 0; i < 6; i++) {
        if (guessArr[i] === targetArr[i]) {
            tileStatus[i] = "green";
            targetArr[i] = null;
        }
    }

    // Second pass - correct letter, wrong position
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
    } else if (currentRow === 2) {
        alert("Auuuu, i dalje ništa 😬");
    } else if (currentRow === 5) {
        alert("Kraj! Tačna reč je: " + targetWord.toUpperCase());
        localStorage.setItem("locked_until", Date.now() + lockTime);
    } else {
        currentRow++;
        currentGuess = "";
        updateScore();
        return;
    }

    updateScore();
    disableInput();
}

function disableInput() {
    [...keyboard.children].forEach(key => key.disabled = true);
}

// Initialize
createBoard();
createKeyboard();
updateScore();
  