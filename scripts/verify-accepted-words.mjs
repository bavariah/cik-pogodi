import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const key = html.match(/"(eyJ[^"\r\n]+)"\s*\)\s*;/)?.[1];
if (!key) throw new Error("Could not find Supabase anon key in index.html");

const base = "https://enhpbzexilgpphdmvfpo.supabase.co/rest/v1";
const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" };

async function fetchAll(table, columns) {
  const first = await fetch(`${base}/${table}?select=${columns}&order=word.asc`, { headers });
  if (!first.ok) throw new Error(`${table} read failed: ${first.status} ${await first.text()}`);

  const total = Number((first.headers.get("content-range") || "0/0").split("/")[1]);
  let rows = await first.json();
  for (let from = rows.length; from < total; from += 1000) {
    const response = await fetch(`${base}/${table}?select=${columns}&order=word.asc`, {
      headers: { ...headers, Range: `${from}-${Math.min(from + 999, total - 1)}` },
    });
    if (!response.ok) throw new Error(`${table} page read failed: ${response.status} ${await response.text()}`);
    rows = rows.concat(await response.json());
  }
  return rows;
}

const [acceptedRows, targetRows] = await Promise.all([
  fetchAll("accepted_words", "word"),
  fetchAll("words", "word"),
]);

const accepted = new Set(acceptedRows.map((row) => row.word));
const targets = new Set(targetRows.map((row) => row.word));
const missingTargets = targetRows.map((row) => row.word).filter((word) => !accepted.has(word));
const acceptedOnly = acceptedRows.map((row) => row.word).filter((word) => !targets.has(word));

console.log(JSON.stringify({
  acceptedWords: acceptedRows.length,
  targetWords: targetRows.length,
  acceptedOnlyWords: acceptedOnly.length,
  acceptedOnlySample: acceptedOnly.slice(0, 5),
  missingTargets,
  duplicateAcceptedWords: acceptedRows.length - accepted.size,
  invalidLengths: acceptedRows.filter((row) => Array.from(row.word).length !== 6).length,
}, null, 2));
