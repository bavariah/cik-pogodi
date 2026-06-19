import fs from "node:fs";

const filePath = process.argv[2] || "output/words/serbian-six-letter-approval-checklist.csv";
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
const approved = rows.filter((row) => row.decision === "approved");
const approvedWords = approved.map((row) => row.word);
const duplicateWords = [
  ...new Set(approvedWords.filter((word, index) => approvedWords.indexOf(word) !== index)),
];

const result = {
  filePath,
  totalRows: rows.length,
  approved: approved.length,
  pending: rows.filter((row) => row.decision === "pending").length,
  rejected: rows.filter((row) => row.decision === "rejected").length,
  badLength: approved.filter((row) => Array.from(row.word).length !== 6).map((row) => row.word),
  badLetters: approved.filter((row) => !STRICT_SERBIAN.test(row.word)).map((row) => row.word),
  duplicates: duplicateWords,
};

console.log(JSON.stringify(result, null, 2));

if (result.badLength.length || result.badLetters.length || result.duplicates.length) {
  process.exit(1);
}
