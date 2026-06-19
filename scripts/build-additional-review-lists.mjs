import fs from "node:fs";

const fullReviewPath = "output/words/serbian-six-letter-candidates-review.csv";
const approvedPath = "output/words/serbian-six-letter-approval-checklist.csv";
const mediumOutputPath = "output/words/serbian-six-letter-medium-possible-additions.csv";
const lowOutputPath = "output/words/serbian-six-letter-low-possible-additions.csv";
const ocrOutputPath = "output/words/serbian-six-letter-ocr-suspect-possible-additions.csv";

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

function writeReviewCsv(path, rows) {
  const header = ["word", "decision", "source", "page", "confidence", "status", "reason", "hint", "sort_order"];
  const csv = [
    header.join(","),
    ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(",")),
  ].join("\r\n");
  fs.writeFileSync(path, `\uFEFF${csv}`, "utf8");
}

const approved = new Set(
  readCsv(approvedPath)
    .filter((row) => row.decision === "approved")
    .map((row) => row.word),
);

const remaining = readCsv(fullReviewPath).filter((row) => !approved.has(row.word));

const toReviewRow = (row) => ({
  word: row.word,
  decision: "pending",
  source: "pdf_candidate",
  page: row.page,
  confidence: row.confidence,
  status: row.status,
  reason: row.reason,
  hint: "",
  sort_order: "",
});

const mediumRows = remaining
  .filter((row) => row.status === "needs_review" && row.confidence === "medium")
  .map(toReviewRow);
const lowRows = remaining
  .filter((row) => row.status === "needs_review" && row.confidence === "low")
  .map(toReviewRow);
const ocrRows = remaining
  .filter((row) => row.status === "ocr_suspect")
  .map(toReviewRow);

writeReviewCsv(mediumOutputPath, mediumRows);
writeReviewCsv(lowOutputPath, lowRows);
writeReviewCsv(ocrOutputPath, ocrRows);

console.log(
  JSON.stringify(
    {
      approvedAlready: approved.size,
      remaining: remaining.length,
      mediumPossibleAdditions: mediumRows.length,
      lowPossibleAdditions: lowRows.length,
      ocrSuspectPossibleAdditions: ocrRows.length,
      outputs: {
        medium: mediumOutputPath,
        low: lowOutputPath,
        ocrSuspect: ocrOutputPath,
      },
    },
    null,
    2,
  ),
);
