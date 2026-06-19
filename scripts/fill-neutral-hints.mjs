import fs from "node:fs";

const importPath =
  process.argv[2] || "output/words/serbian-six-letter-words-import-merged-with-existing.csv";
const needsHintsPath =
  process.argv[3] || "output/words/serbian-six-letter-words-import-merged-needs-hints.csv";

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

function neutralHint(word) {
  const letters = Array.from(word);
  return `Реч почиње словом ${letters[0].toUpperCase()} и завршава се словом ${letters.at(-1).toUpperCase()}.`;
}

const rows = readCsv(importPath);
let filled = 0;

const updatedRows = rows.map((row) => {
  if (row.hint?.trim()) return row;
  filled++;
  return {
    ...row,
    hint: neutralHint(row.word),
  };
});

writeCsv(importPath, updatedRows);
writeCsv(
  needsHintsPath,
  updatedRows.filter((row) => !row.hint.trim()),
);

console.log(
  JSON.stringify(
    {
      importPath,
      needsHintsPath,
      filled,
      remainingMissingHints: updatedRows.filter((row) => !row.hint.trim()).length,
    },
    null,
    2,
  ),
);
