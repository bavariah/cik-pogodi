import fs from "node:fs";

const approvalPath = "output/words/serbian-six-letter-approval-checklist.csv";
const importPath = "output/words/serbian-six-letter-words-import.csv";
const reviewPath = "output/words/serbian-six-letter-words-import-needs-hints.csv";

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

function writeCsv(path, rows, header) {
  const csv = [
    header.join(","),
    ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(",")),
  ].join("\r\n");
  fs.writeFileSync(path, `\uFEFF${csv}`, "utf8");
}

const approved = readCsv(approvalPath)
  .filter((row) => row.decision === "approved")
  .sort((a, b) => a.word.localeCompare(b.word, "sr-Cyrl"));

const rows = approved.map((row, index) => ({
  word: row.word,
  hint: row.hint || "",
  sort_order: index + 1,
}));

writeCsv(importPath, rows, ["word", "hint", "sort_order"]);

const needsHints = rows.filter((row) => !row.hint.trim());
writeCsv(reviewPath, needsHints, ["word", "hint", "sort_order"]);

console.log(
  JSON.stringify(
    {
      importPath,
      reviewPath,
      totalApproved: rows.length,
      missingHints: needsHints.length,
      firstSortOrder: rows[0]?.sort_order || null,
      lastSortOrder: rows.at(-1)?.sort_order || null,
    },
    null,
    2,
  ),
);
