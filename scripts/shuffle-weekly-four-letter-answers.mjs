import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ANSWERS_CSV = path.join(ROOT, "output", "words", "serbian-four-letter-suggested-weekly-answers.csv");

function parseCsv(file) {
  const [headerLine, ...lines] = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return {
    headers,
    rows: lines.map(line => {
      const values = line.split(",");
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    })
  };
}

function buildBalancedOrder(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const first = row.word[0];
    if (!groups.has(first)) groups.set(first, []);
    groups.get(first).push(row);
  });

  const orderedGroups = [...groups.entries()]
    .map(([letter, words], index) => ({
      letter,
      words: [...words].sort((a, b) => a.word.localeCompare(b.word, "sr")),
      index
    }))
    .sort((a, b) => b.words.length - a.words.length || a.letter.localeCompare(b.letter, "sr"));

  const result = [];
  let previousLetter = "";

  while (orderedGroups.some(group => group.words.length > 0)) {
    const candidate = orderedGroups
      .filter(group => group.words.length > 0 && group.letter !== previousLetter)
      .sort((a, b) => b.words.length - a.words.length || a.index - b.index)[0]
      || orderedGroups
        .filter(group => group.words.length > 0)
        .sort((a, b) => b.words.length - a.words.length || a.index - b.index)[0];

    result.push(candidate.words.shift());
    previousLetter = candidate.letter;
  }

  return result;
}

function maxSameInitialRun(rows) {
  let maxRun = 0;
  let currentRun = 0;
  let previousLetter = "";
  rows.forEach(row => {
    const letter = row.word[0];
    currentRun = letter === previousLetter ? currentRun + 1 : 1;
    previousLetter = letter;
    maxRun = Math.max(maxRun, currentRun);
  });
  return maxRun;
}

const { headers, rows } = parseCsv(ANSWERS_CSV);
const shuffled = buildBalancedOrder(rows).map((row, index) => ({
  ...row,
  sort_order: String(index + 1)
}));

const output = [
  headers.join(","),
  ...shuffled.map(row => headers.map(header => row[header] ?? "").join(","))
].join("\n") + "\n";

fs.writeFileSync(ANSWERS_CSV, output, "utf8");

console.log(`Shuffled ${shuffled.length} weekly answers`);
console.log(`Max same-first-letter run: ${maxSameInitialRun(shuffled)}`);
console.log(`First 24: ${shuffled.slice(0, 24).map(row => row.word).join(", ")}`);
