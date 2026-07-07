import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const key = html.match(/"(eyJ[^"\r\n]+)"\s*\)\s*;/)?.[1];
if (!key) throw new Error("Could not find Supabase anon key in index.html");

const base = "https://enhpbzexilgpphdmvfpo.supabase.co/rest/v1";

function countBy(rows, keyName) {
  return rows.reduce((map, row) => {
    map.set(row[keyName], (map.get(row[keyName]) || 0) + 1);
    return map;
  }, new Map());
}

const firstResponse = await fetch(`${base}/words?select=word,hint,sort_order&order=sort_order.asc`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "count=exact",
  },
});

if (!firstResponse.ok) {
  throw new Error(`Supabase read failed: ${firstResponse.status} ${await firstResponse.text()}`);
}

const contentRange = firstResponse.headers.get("content-range");
const total = Number((contentRange || "0/0").split("/")[1]);
let rows = await firstResponse.json();

for (let from = rows.length; from < total; from += 1000) {
  const to = Math.min(from + 999, total - 1);
  const pageResponse = await fetch(`${base}/words?select=word,hint,sort_order&order=sort_order.asc`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Range: `${from}-${to}`,
    },
  });
  if (!pageResponse.ok) {
    throw new Error(`Supabase page read failed: ${pageResponse.status} ${await pageResponse.text()}`);
  }
  rows = rows.concat(await pageResponse.json());
}

const duplicateWords = [...countBy(rows, "word")]
  .filter(([, count]) => count > 1)
  .map(([word]) => word);
const duplicateSortOrders = [...countBy(rows, "sort_order")]
  .filter(([, count]) => count > 1)
  .map(([sortOrder]) => sortOrder);

const badOrderSequence = [];
for (let index = 0; index < rows.length; index++) {
  if (Number(rows[index].sort_order) !== index + 1) {
    badOrderSequence.push(`${rows[index].word}:${rows[index].sort_order}`);
    if (badOrderSequence.length >= 10) break;
  }
}

console.log(
  JSON.stringify(
    {
      contentRange,
      total,
      fetched: rows.length,
      duplicateWords: duplicateWords.length,
      duplicateSortOrders: duplicateSortOrders.length,
      missingHints: rows.filter((row) => !row.hint).length,
      missingSortOrder: rows.filter((row) => row.sort_order == null).length,
      badLength: rows.filter((row) => Array.from(row.word).length !== 6).length,
      badOrderSequence,
      first: rows.slice(0, 3),
      last: rows.slice(-3),
    },
    null,
    2,
  ),
);
