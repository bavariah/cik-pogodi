import fs from "node:fs";

const candidatesPath = "output/words/serbian-six-letter-candidates-review.csv";
const targetsPath = "output/words/serbian-six-letter-words-import-merged-with-existing.csv";
const outputPath = "output/words/serbian-six-letter-accepted-guesses.csv";
const migrationPath = "supabase/migrations/202607070002_accepted_guess_words.sql";

const SERBIAN_WORD = /^[абвгдђежзијклљмнњопрстћуфхцчџш]+$/;

function parseCsvLine(line) {
  const columns = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      columns.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  columns.push(current);
  return columns;
}

function readCsv(path) {
  const lines = fs.readFileSync(path, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const header = parseCsvLine(lines.shift());
  return lines.filter(Boolean).map((line) => {
    const columns = parseCsvLine(line);
    return Object.fromEntries(header.map((name, index) => [name, columns[index] || ""]));
  });
}

function normalizeWord(value) {
  return String(value || "").normalize("NFC").trim().toLowerCase();
}

function isAcceptedWord(word) {
  return Array.from(word).length === 6 && SERBIAN_WORD.test(word);
}

function sqlEscape(value) {
  return value.replaceAll("'", "''");
}

const targetWords = readCsv(targetsPath).map((row) => normalizeWord(row.word));
const dictionaryWords = readCsv(candidatesPath)
  .filter((row) => row.status !== "ocr_suspect")
  .map((row) => normalizeWord(row.word));

const acceptedWords = [...new Set([...targetWords, ...dictionaryWords])]
  .filter(isAcceptedWord)
  .sort((a, b) => a.localeCompare(b, "sr-Cyrl"));

fs.writeFileSync(outputPath, `\uFEFFword\r\n${acceptedWords.join("\r\n")}\r\n`, "utf8");

const chunks = [];
for (let index = 0; index < acceptedWords.length; index += 500) {
  const values = acceptedWords
    .slice(index, index + 500)
    .map((word) => `  ('${sqlEscape(word)}')`)
    .join(",\n");
  chunks.push(`insert into public.accepted_words (word) values\n${values}\non conflict (word) do nothing;`);
}

const migration = `-- Keep daily target words separate from the larger guess dictionary.\ncreate table if not exists public.accepted_words (\n  word text primary key,\n  constraint accepted_words_normalized_check check (word = lower(btrim(word))),\n  constraint accepted_words_six_letters_check check (char_length(word) = 6)\n);\n\nalter table public.accepted_words enable row level security;\n\ndrop policy if exists "Accepted words are publicly readable" on public.accepted_words;\ncreate policy "Accepted words are publicly readable"\n  on public.accepted_words\n  for select\n  to anon, authenticated\n  using (true);\n\ngrant select on table public.accepted_words to anon, authenticated;\n\n-- Every target word must always be accepted as a guess.\ninsert into public.accepted_words (word)\nselect lower(btrim(word)) from public.words\non conflict (word) do nothing;\n\n${chunks.join("\n\n")}\n`;

fs.writeFileSync(migrationPath, migration, "utf8");

console.log(JSON.stringify({
  targetSourceWords: targetWords.length,
  dictionarySourceWords: dictionaryWords.length,
  acceptedUniqueWords: acceptedWords.length,
  excludedOcrSuspects: readCsv(candidatesPath).filter((row) => row.status === "ocr_suspect").length,
  outputPath,
  migrationPath,
}, null, 2));
