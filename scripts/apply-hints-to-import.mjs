import fs from "node:fs";

const hintsPath = process.argv[2] || "output/words/serbian-six-letter-words-import-merged-needs-hints.csv";
const importPath = process.argv[3] || "output/words/serbian-six-letter-words-import-merged-with-existing.csv";
const outputPath = process.argv[4] || importPath;

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

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(path, rows) {
  const header = ["word", "hint", "sort_order"];
  const csv = [
    header.join(","),
    ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(",")),
  ].join("\r\n");
  fs.writeFileSync(path, `\uFEFF${csv}`, "utf8");
}

const hintRows = readCsv(hintsPath);
const importRows = readCsv(importPath);
const hintsByWord = new Map(
  hintRows
    .filter((row) => row.word && row.hint?.trim())
    .map((row) => [row.word, row.hint.trim()]),
);

let applied = 0;
const mergedRows = importRows.map((row) => {
  const hint = hintsByWord.get(row.word);
  if (!hint) return row;
  if (row.hint !== hint) applied++;
  return { ...row, hint };
});

writeCsv(outputPath, mergedRows);

console.log(
  JSON.stringify(
    {
      hintsPath,
      importPath,
      outputPath,
      filledHintsFound: hintsByWord.size,
      hintsApplied: applied,
      remainingMissingHints: mergedRows.filter((row) => !row.hint.trim()).length,
    },
    null,
    2,
  ),
);
