import fs from "node:fs";
import path from "node:path";
import { PDFParse } from "pdf-parse";

const DEFAULT_PDF =
  "C:\\Users\\TozaMan\\Desktop\\Мирослав Николић (ed.) - Речник српскога језика (Rečnik srpskoga jezika)-Матица српска (2011).pdf";

const pdfPath = process.argv[2] || DEFAULT_PDF;
const outDir = path.resolve("output", "words");
const reviewCsvPath = path.join(outDir, "serbian-six-letter-candidates-review.csv");
const highReviewCsvPath = path.join(outDir, "serbian-six-letter-candidates-high-review.csv");
const summaryPath = path.join(outDir, "serbian-six-letter-candidates-summary.json");

const CYRILLIC_WORD = /^[а-шђжљњћџ]+$/i;
const SERBIAN_WORD = /^[абвгдђежзијклљмнњопрстћуфхцчџш]+$/i;
const ENTRY_START = /^([А-ШЂЖЉЊЋЏа-шђжљњћџ]{4,24})(?:[0-9¹²³⁴])?([,(\s-].*)$/;
const GRAMMAR_MARKER =
  /^(?:и\s+)?(?:\([^)]{1,40}\)\s*)?(?:м|ж|с|прил\.?|предл\.?|везн\.?|речца|узв\.?|свр\.?|несвр\.?|лат\.?|грч\.?|тур\.?|нем\.?|фр\.?|енгл\.?|бот\.?|анат\.?|фиг\.?|разг\.?|пеј\.?|експр\.?|архит\.?|спорт\.?|лингв\.?|мат\.?|физ\.?)\b/i;

function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[0-9¹²³⁴]+$/g, "")
    .replace(/ё/g, "е")
    .trim();
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function previousLineLooksClosed(prevLine) {
  if (!prevLine) return true;
  return /[.!?;:]$/.test(prevLine.trim()) || /^[А-ШЂЖЉЊЋЏ\s-]+$/.test(prevLine.trim());
}

function hasNoisyCharacters(text) {
  return /[A-Za-z0-9"�]/.test(text);
}

function classifyCandidate({ line, previousLine, after }) {
  const reasons = [];
  let score = 35;
  const trimmedAfter = after.trim();

  if (/^,\s*-/.test(trimmedAfter)) {
    score += 32;
    reasons.push("inflection-after-comma");
  }

  if (GRAMMAR_MARKER.test(trimmedAfter.replace(/^,\s*/, ""))) {
    score += 30;
    reasons.push("grammar-marker");
  }

  if (/^[а-шђжљњћџ]/.test(line)) {
    score += 8;
    reasons.push("lowercase-entry");
  }

  if (previousLineLooksClosed(previousLine)) {
    score += 12;
    reasons.push("previous-line-closed");
  } else {
    score -= 25;
    reasons.push("possible-wrapped-definition");
  }

  if (hasNoisyCharacters(line.slice(0, 120))) {
    score -= 10;
    reasons.push("ocr-noise-near-entry");
  }

  const confidence = score >= 75 ? "high" : score >= 55 ? "medium" : "low";
  return { confidence, score, reasons };
}

function extractFromPage(text, page) {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const candidates = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\s+[А-ШЂЖЉЊЋЏ\s-]+$/.test(line)) continue;
    if (/^--\s+\d+\s+of\s+\d+\s+--$/i.test(line)) continue;

    const match = line.match(ENTRY_START);
    if (!match) continue;

    const word = normalizeWord(match[1]);
    if (word.length !== 6 || !CYRILLIC_WORD.test(word)) continue;

    const previousLine = i > 0 ? lines[i - 1] : "";
    const isStrictSerbian = SERBIAN_WORD.test(word);
    const classified = classifyCandidate({
      line,
      previousLine,
      after: match[2],
    });
    let { confidence, score, reasons } = classified;

    let status = "needs_review";
    if (!isStrictSerbian) {
      score = Math.min(score, 40);
      confidence = "low";
      status = "ocr_suspect";
      reasons = [...reasons, "non-serbian-cyrillic-letter"];
    }

    candidates.push({
      word,
      page,
      confidence,
      score,
      status,
      reason: reasons.join("|"),
      hint: "",
      sort_order: "",
    });
  }

  return candidates;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  const info = await parser.getInfo();
  const totalPages = info.total || 0;
  const byWord = new Map();

  for (let page = 1; page <= totalPages; page++) {
    const result = await parser.getText({ partial: [page] });
    for (const candidate of extractFromPage(result.text, page)) {
      const previous = byWord.get(candidate.word);
      if (!previous || candidate.score > previous.score) {
        byWord.set(candidate.word, candidate);
      }
    }

    if (page % 100 === 0 || page === totalPages) {
      console.log(`Processed ${page}/${totalPages} pages, ${byWord.size} unique candidates`);
    }
  }

  await parser.destroy();

  const rows = [...byWord.values()].sort((a, b) => {
    if (a.confidence !== b.confidence) {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.confidence] - rank[b.confidence];
    }
    return a.word.localeCompare(b.word, "sr-Cyrl");
  });

  const header = ["word", "status", "confidence", "score", "page", "reason", "hint", "sort_order"];
  const csv = [
    header.join(","),
    ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(",")),
  ].join("\r\n");
  const highRows = rows.filter((row) => row.confidence === "high");
  const highCsv = [
    header.join(","),
    ...highRows.map((row) => header.map((key) => csvEscape(row[key])).join(",")),
  ].join("\r\n");

  fs.writeFileSync(reviewCsvPath, `\uFEFF${csv}`, "utf8");
  fs.writeFileSync(highReviewCsvPath, `\uFEFF${highCsv}`, "utf8");

  const summary = {
    pdf: pdfPath,
    totalPages,
    totalUniqueCandidates: rows.length,
    byConfidence: rows.reduce((acc, row) => {
      acc[row.confidence] = (acc[row.confidence] || 0) + 1;
      return acc;
    }, {}),
    byStatus: rows.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {}),
    outputs: {
      reviewCsv: reviewCsvPath,
      highReviewCsv: highReviewCsvPath,
    },
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
