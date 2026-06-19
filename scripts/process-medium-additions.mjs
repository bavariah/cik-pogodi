import fs from "node:fs";

const mediumPath = "output/words/serbian-six-letter-medium-possible-additions.csv";
const approvalPath = "output/words/serbian-six-letter-approval-checklist.csv";
const approvedMediumPath = "output/words/serbian-six-letter-medium-approved-additions.csv";
const deferredMediumPath = "output/words/serbian-six-letter-medium-deferred-to-low.csv";
const updatedApprovalPath = approvalPath;

const DEFER_WORDS = new Set([
  "бебити",
  "бизант",
  "богзна",
  "бодови",
  "велика",
  "верски",
  "врлине",
  "вунена",
  "геокем",
  "главно",
  "главом",
  "грбине",
  "жидина",
  "житара",
  "жлезде",
  "зекулја",
  "згорег",
  "зелено",
  "земљен",
  "земљин",
  "избори",
  "извана",
  "иосшао",
  "ириказ",
  "каснно",
  "керећн",
  "колики",
  "колико",
  "коитус",
  "кратер",
  "кружно",
  "кћерка",
  "лењиво",
  "лирски",
  "људска",
  "љутито",
  "малеус",
  "мббник",
  "менљив",
  "мерљив",
  "мислен",
  "младеж",
  "млачно",
  "мразно",
  "мртвеж",
  "нагоре",
  "надаље",
  "надоле",
  "нбжице",
  "нељуди",
  "његово",
  "обадва",
  "обично",
  "обласш",
  "овално",
  "одонуд",
  "омошач",
  "ониско",
  "осмеро",
  "осшаши",
  "ошшрим",
  "патина",
  "печење",
  "плитко",
  "пљосно",
  "поновa",
  "поново",
  "пониже",
  "поради",
  "пргаво",
  "прозно",
  "против",
  "пудљив",
  "ранљив",
  "реално",
  "речито",
  "римско",
  "сазути",
  "санано",
  "сасшав",
  "свежањ",
  "свеопћ",
  "свесно",
  "свикло",
  "сеоска",
  "сирава",
  "скбнто",
  "скозна",
  "скочно",
  "славни",
  "славно",
  "слично",
  "служби",
  "смацна",
  "смеоно",
  "смионо",
  "смршна",
  "срамно",
  "срећом",
  "српска",
  "стеона",
  "стољет",
  "судска",
  "сунчев",
  "супатн",
  "супутн",
  "сутећи",
  "сходно",
  "сшашус",
  "сшочно",
  "сшрани",
  "ташист",
  "тетреб",
  "трипло",
  "трипут",
  "убитно",
  "уближе",
  "ужњети",
  "узрочн",
  "уигран",
  "укорно",
  "уланка",
  "уљешит",
  "уметан",
  "уоишше",
  "уоколо",
  "уочење",
  "упорно",
  "уресан",
  "ускоро",
  "утерив",
  "утешив",
  "финанс",
  "финанц",
  "хемато",
  "хитети",
  "црвена",
  "црнцат",
  "чаровн",
  "четири",
  "чиниши",
  "чичков",
  "шарено",
  "шежиши",
]);

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

const mediumRows = readCsv(mediumPath).map((row) => ({
  ...row,
  decision: DEFER_WORDS.has(row.word) ? "deferred" : "approved",
}));

const approvedMedium = mediumRows.filter((row) => row.decision === "approved");
const deferredMedium = mediumRows.filter((row) => row.decision === "deferred");

const mediumHeader = ["word", "decision", "source", "page", "confidence", "status", "reason", "hint", "sort_order"];
writeCsv(mediumPath, mediumRows, mediumHeader);
writeCsv(approvedMediumPath, approvedMedium, mediumHeader);
writeCsv(deferredMediumPath, deferredMedium, mediumHeader);

const approvalRows = readCsv(approvalPath);
const approvalWords = new Set(approvalRows.map((row) => row.word));
const newApprovalRows = approvedMedium
  .filter((row) => !approvalWords.has(row.word))
  .map((row) => ({
    word: row.word,
    decision: "approved",
    source: "pdf_medium_approved",
    page: row.page,
    note: "approved from medium possible additions",
    hint: "",
    sort_order: "",
  }));

const updatedApprovalRows = [...approvalRows, ...newApprovalRows].sort((a, b) =>
  a.word.localeCompare(b.word, "sr-Cyrl"),
);
writeCsv(updatedApprovalPath, updatedApprovalRows, [
  "word",
  "decision",
  "source",
  "page",
  "note",
  "hint",
  "sort_order",
]);

console.log(
  JSON.stringify(
    {
      mediumTotal: mediumRows.length,
      mediumApproved: approvedMedium.length,
      mediumDeferredToLow: deferredMedium.length,
      addedToApprovalChecklist: newApprovalRows.length,
      approvalChecklistTotal: updatedApprovalRows.length,
      outputs: {
        approvedMedium: approvedMediumPath,
        deferredMedium: deferredMediumPath,
        approvalChecklist: updatedApprovalPath,
      },
    },
    null,
    2,
  ),
);
