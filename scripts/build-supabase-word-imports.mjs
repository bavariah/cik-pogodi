import fs from "node:fs";

const approvalImportPath = "output/words/serbian-six-letter-words-import.csv";
const newOnlyPath = "output/words/serbian-six-letter-words-import-new-only.csv";
const mergedPath = "output/words/serbian-six-letter-words-import-merged-with-existing.csv";
const mergedNeedsHintsPath = "output/words/serbian-six-letter-words-import-merged-needs-hints.csv";
const duplicateReportPath = "output/words/serbian-six-letter-existing-duplicates.json";

const SUPABASE_URL = "https://enhpbzexilgpphdmvfpo.supabase.co";
const SHUFFLE_SEED = 20260619;

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

function getSupabaseAnonKey() {
  const html = fs.readFileSync("index.html", "utf8");
  const match = html.match(/"(eyJ[^"\r\n]+)"\s*\)\s*;/);
  if (!match) throw new Error("Could not find Supabase anon key in index.html");
  return match[1];
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledWithSortOrder(rows) {
  const random = seededRandom(SHUFFLE_SEED);
  const shuffled = [...rows]
    .sort((a, b) => a.word.localeCompare(b.word, "sr-Cyrl"))
    .map((row) => ({ ...row, shuffleKey: random() }))
    .sort((a, b) => a.shuffleKey - b.shuffleKey || a.word.localeCompare(b.word, "sr-Cyrl"));
  return shuffled.map((row, index) => ({
    word: row.word,
    hint: row.hint || "",
    sort_order: index + 1,
  }));
}

async function fetchExistingWords() {
  const key = getSupabaseAnonKey();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/words?select=word,hint&order=word.asc`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase words fetch failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

const existingRows = await fetchExistingWords();
const approvedRows = readCsv(approvalImportPath);
const existingByWord = new Map(existingRows.map((row) => [row.word, row]));
const approvedByWord = new Map(approvedRows.map((row) => [row.word, row]));

const duplicates = approvedRows.filter((row) => existingByWord.has(row.word)).map((row) => row.word);

const newOnlyRows = approvedRows
  .filter((row) => !existingByWord.has(row.word))
  .map((row) => ({
    word: row.word,
    hint: row.hint || "",
  }));

const mergedByWord = new Map();
for (const row of existingRows) {
  mergedByWord.set(row.word, {
    word: row.word,
    hint: row.hint || "",
  });
}
for (const row of approvedRows) {
  const existing = mergedByWord.get(row.word);
  mergedByWord.set(row.word, {
    word: row.word,
    hint: existing?.hint || row.hint || "",
  });
}

const newOnlyImportRows = shuffledWithSortOrder(newOnlyRows);
const mergedImportRows = shuffledWithSortOrder([...mergedByWord.values()]);

writeCsv(newOnlyPath, newOnlyImportRows);
writeCsv(mergedPath, mergedImportRows);
writeCsv(
  mergedNeedsHintsPath,
  mergedImportRows.filter((row) => !row.hint.trim()),
);

const report = {
  existingWords: existingRows.length,
  approvedWords: approvedRows.length,
  duplicateCount: duplicates.length,
  duplicates,
  newOnlyWords: newOnlyImportRows.length,
  mergedWords: mergedImportRows.length,
  shuffleSeed: SHUFFLE_SEED,
  outputs: {
    newOnlyPath,
    mergedPath,
    mergedNeedsHintsPath,
  },
};

fs.writeFileSync(duplicateReportPath, JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
