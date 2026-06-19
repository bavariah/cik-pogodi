import fs from "node:fs";

const filePath = process.argv[2] || "output/words/serbian-six-letter-words-import.csv";
const STRICT_SERBIAN = /^[абвгдђежзијклљмнњопрстћуфхцчџш]+$/i;

function parseCsvLine(line) {
  const cols = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cols.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cols.push(current);
  return cols;
}

function readCsv(path) {
  const text = fs.readFileSync(path, "utf8").replace(/^\uFEFF/, "").trim();
  const lines = text.split(/\r?\n/);
  const header = parseCsvLine(lines.shift());
  return lines.filter(Boolean).map((line) => {
    const cols = parseCsvLine(line);
    return Object.fromEntries(header.map((key, index) => [key, cols[index] || ""]));
  });
}

const rows = readCsv(filePath);
const words = rows.map((row) => row.word);
const duplicates = [...new Set(words.filter((word, index) => words.indexOf(word) !== index))];

const result = {
  filePath,
  rows: rows.length,
  badLength: rows.filter((row) => Array.from(row.word).length !== 6).map((row) => row.word),
  badLetters: rows.filter((row) => !STRICT_SERBIAN.test(row.word)).map((row) => row.word),
  duplicates,
  badSortOrder: rows
    .filter((row, index) => Number(row.sort_order) !== index + 1)
    .slice(0, 20)
    .map((row) => `${row.word}:${row.sort_order}`),
  missingHints: rows.filter((row) => !row.hint.trim()).length,
};

console.log(JSON.stringify(result, null, 2));

if (
  result.badLength.length ||
  result.badLetters.length ||
  result.duplicates.length ||
  result.badSortOrder.length
) {
  process.exit(1);
}
