import fs from "node:fs";

const highReviewPath = "output/words/serbian-six-letter-candidates-high-review.csv";
const manualApprovalsPath = "output/words/serbian-six-letter-manual-approvals.csv";
const outputPath = "output/words/serbian-six-letter-approval-checklist.csv";

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

function readCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").trim();
  if (!text) return [];
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

const highRows = readCsv(highReviewPath).map((row) => ({
  word: row.word,
  decision: "approved",
  source: "pdf_high_confidence",
  page: row.page,
  note: "",
  hint: "",
  sort_order: "",
}));

const manualRows = readCsv(manualApprovalsPath).map((row) => ({
  word: row.word,
  decision: "approved",
  source: "manual_approved",
  page: row.source_page,
  note: row.note,
  hint: "",
  sort_order: "",
}));

const seen = new Set();
const rows = [...highRows, ...manualRows]
  .filter((row) => {
    if (seen.has(row.word)) return false;
    seen.add(row.word);
    return true;
  })
  .sort((a, b) => a.word.localeCompare(b.word, "sr-Cyrl"));

const header = ["word", "decision", "source", "page", "note", "hint", "sort_order"];
const csv = [
  header.join(","),
  ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(",")),
].join("\r\n");

fs.writeFileSync(outputPath, `\uFEFF${csv}`, "utf8");

console.log(
  JSON.stringify(
    {
      path: outputPath,
      rows: rows.length,
      pending: rows.filter((row) => row.decision === "pending").length,
      approved: rows.filter((row) => row.decision === "approved").length,
    },
    null,
    2,
  ),
);
