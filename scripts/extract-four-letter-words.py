import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path

from pypdf import PdfReader


OUT_DIR = Path("output") / "words"
FULL_CSV = OUT_DIR / "serbian-four-letter-candidates-review.csv"
HIGH_CSV = OUT_DIR / "serbian-four-letter-candidates-high-review.csv"
SUGGESTED_CSV = OUT_DIR / "serbian-four-letter-suggested-weekly-answers.csv"
SUMMARY_JSON = OUT_DIR / "serbian-four-letter-candidates-summary.json"

SERBIAN_LOWER = "абвгдђежзијклљмнњопрстћуфхцчџш"
SERBIAN_UPPER = SERBIAN_LOWER.upper()
SERBIAN_LETTERS = SERBIAN_LOWER + SERBIAN_UPPER
LETTER_CLASS = re.escape(SERBIAN_LETTERS)

ENTRY_START = re.compile(
    rf"^([{LETTER_CLASS}]{{4,24}})(?:[0-9¹²³⁴])?([,(\s-].*)$"
)
HEADER_LINE = re.compile(rf"^\d+\s+[{LETTER_CLASS}\s-]+$")
PREVIOUS_LINE_CLOSED = re.compile(rf"^[{LETTER_CLASS}\s-]+$")
STRICT_SERBIAN_WORD = re.compile(rf"^[{re.escape(SERBIAN_LOWER)}]+$", re.I)
ANY_CYRILLIC_WORD = re.compile(rf"^[{LETTER_CLASS}]+$")
LOWERCASE_ENTRY = re.compile(rf"^[{re.escape(SERBIAN_LOWER)}]")

GRAMMAR_MARKERS = [
    "м",
    "ж",
    "с",
    "прил",
    "предл",
    "везн",
    "речца",
    "узв",
    "свр",
    "несвр",
    "лат",
    "грч",
    "тур",
    "нем",
    "фр",
    "енгл",
    "бот",
    "анат",
    "фиг",
    "разг",
    "пеј",
    "експр",
    "архит",
    "спорт",
    "лингв",
    "мат",
    "физ",
]
GRAMMAR_MARKER = re.compile(
    r"^(?:и\s+)?(?:\([^)]{1,40}\)\s*)?(?:"
    + "|".join(re.escape(marker) + r"\.?" for marker in GRAMMAR_MARKERS)
    + r")\b",
    re.I,
)

SUGGESTED_ANSWERS_ORDER = [
    "адут",
    "азил",
    "апел",
    "ауто",
    "база",
    "бака",
    "банк",
    "бара",
    "бања",
    "беба",
    "бенд",
    "блеф",
    "бокс",
    "боја",
    "брат",
    "бука",
    "вага",
    "веза",
    "вена",
    "вече",
    "вила",
    "вино",
    "вода",
    "вођа",
    "воља",
    "врат",
    "гипс",
    "глас",
    "голф",
    "гора",
    "град",
    "грло",
    "дама",
    "деби",
    "дека",
    "депо",
    "дина",
    "длан",
    "дрво",
    "дуга",
    "жаба",
    "жена",
    "живо",
    "жица",
    "зима",
    "знак",
    "зора",
    "зрак",
    "игра",
    "идол",
    "инат",
    "ирис",
    "кабл",
    "кафа",
    "каша",
    "кеса",
    "киша",
    "клас",
    "клик",
    "клуб",
    "кнез",
    "кожа",
    "крај",
    "лава",
    "лама",
    "лист",
    "лице",
    "лоза",
    "луна",
    "мама",
    "маса",
    "месо",
    "мета",
    "мода",
    "море",
    "мука",
    "нада",
    "нана",
    "ниво",
    "нота",
    "оаза",
    "овал",
    "овца",
    "олук",
    "орах",
    "папа",
    "пара",
    "парк",
    "паун",
    "перо",
    "пиво",
    "план",
    "плес",
    "рана",
    "риба",
    "ружа",
    "рука",
    "сала",
    "село",
    "сила",
    "соба",
    "сова",
    "срна",
    "тема",
    "тест",
    "траг",
    "филм",
    "чаша",
    "шала",
]

ANSWER_PREFERENCE = {
    "адут",
    "ажио",
    "ајде",
    "акти",
    "алат",
    "алва",
    "алка",
    "алфа",
    "амор",
    "анис",
    "апел",
    "април",
    "арак",
    "арфа",
    "архив",
    "атом",
    "бака",
    "бала",
    "банк",
    "бара",
    "батак",
    "беда",
    "бенд",
    "бера",
    "бик",
    "бина",
    "биро",
    "блато",
    "блеф",
    "блок",
    "блуза",
    "боја",
    "бокс",
    "болт",
    "бора",
    "борба",
    "браво",
    "брдо",
    "брза",
    "брод",
    "број",
    "буба",
    "бука",
    "буна",
    "буре",
    "вата",
    "вага",
    "вена",
    "вера",
    "вино",
    "вода",
    "вођа",
    "воља",
    "врата",
    "време",
    "врх",
    "газа",
    "глас",
    "глина",
    "град",
    "грана",
    "грло",
    "гром",
    "груда",
    "гума",
    "дама",
    "дана",
    "двор",
    "дело",
    "деда",
    "дива",
    "дина",
    "дино",
    "доба",
    "дома",
    "драма",
    "дрво",
    "дуга",
    "дума",
    "душа",
    "ђак",
    "ђон",
    "жаба",
    "жара",
    "жена",
    "жито",
    "жица",
    "зима",
    "злато",
    "знак",
    "зона",
    "зуб",
    "игла",
    "игра",
    "идеја",
    "изаз",
    "икра",
    "име",
    "инад",
    "инат",
    "јагње",
    "јаје",
    "јаре",
    "јело",
    "кава",
    "када",
    "кајак",
    "кала",
    "камен",
    "капа",
    "кара",
    "карта",
    "каса",
    "кеса",
    "киша",
    "клас",
    "кључ",
    "кожа",
    "коло",
    "кора",
    "коса",
    "кост",
    "крај",
    "кров",
    "круг",
    "кућа",
    "кула",
    "купа",
    "лава",
    "лађа",
    "лама",
    "лана",
    "лево",
    "леђа",
    "лек",
    "лепо",
    "лете",
    "лист",
    "лице",
    "лов",
    "лопта",
    "лоза",
    "лука",
    "луна",
    "људи",
    "мајка",
    "мала",
    "мама",
    "мара",
    "меда",
    "мера",
    "месо",
    "место",
    "мина",
    "мир",
    "мода",
    "море",
    "мост",
    "мрак",
    "мрежа",
    "мрља",
    "мука",
    "муња",
    "нада",
    "нана",
    "нос",
    "ноћ",
    "нула",
    "обала",
    "облак",
    "облик",
    "око",
    "олук",
    "орао",
    "осам",
    "отац",
    "пад",
    "пала",
    "пана",
    "пара",
    "парк",
    "пас",
    "пета",
    "пиво",
    "пила",
    "план",
    "плод",
    "пола",
    "поље",
    "посао",
    "праг",
    "прах",
    "пут",
    "рага",
    "рака",
    "рана",
    "раса",
    "рата",
    "река",
    "риба",
    "роба",
    "рога",
    "роза",
    "рота",
    "рука",
    "ружа",
    "сала",
    "сат",
    "село",
    "сила",
    "сир",
    "сјај",
    "скок",
    "сноп",
    "сова",
    "сок",
    "соло",
    "соба",
    "соја",
    "спој",
    "стан",
    "стол",
    "суд",
    "суза",
    "тајна",
    "тело",
    "тема",
    "тест",
    "тетка",
    "тигар",
    "ток",
    "тора",
    "траг",
    "трик",
    "трос",
    "туга",
    "укус",
    "ум",
    "уље",
    "урад",
    "урна",
    "ухо",
    "фаза",
    "филм",
    "фока",
    "фонд",
    "хала",
    "хлеб",
    "ход",
    "хор",
    "цвет",
    "цена",
    "циљ",
    "црв",
    "црта",
    "чамац",
    "чаша",
    "чело",
    "чип",
    "шала",
    "шапа",
    "шах",
    "шеф",
    "школа",
    "шум",
}

ANSWER_BLOCKLIST = {
    "бабо",
    "води",
    "воду",
    "врли",
    "езан",
    "кају",
    "кина",
    "меши",
    "нико",
    "одво",
    "окан",
    "окор",
    "пани",
    "пони",
    "раби",
    "рели",
    "рого",
    "роло",
    "рођо",
    "сељо",
    "смеђ",
    "тром",
    "узан",
    "учен",
    "учин",
    "хипи",
    "цаја",
    "циго",
    "црњо",
    "ћаге",
    "шишо",
    "шоњо",
    "шура",
}


def find_default_pdf() -> Path:
    matches = [
        path
        for path in (Path.home() / "Desktop").glob("*.pdf")
        if "srpskoga" in path.name and "2011" in path.name and "Rec" in path.name
    ]
    if not matches:
        raise FileNotFoundError("Could not find the Matica srpska dictionary PDF on Desktop.")
    return matches[0]


def normalize_word(word: str) -> str:
    return re.sub(r"[0-9¹²³⁴]+$", "", word.lower().replace("ё", "е")).strip()


def csv_write(path: Path, rows: list[dict], header: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)


def previous_line_looks_closed(previous_line: str) -> bool:
    previous_line = (previous_line or "").strip()
    return (
        not previous_line
        or re.search(r"[.!?;:]$", previous_line)
        or PREVIOUS_LINE_CLOSED.match(previous_line)
    )


def has_noisy_characters(text: str) -> bool:
    return bool(re.search(r'[A-Za-z0-9"�]', text))


def classify_candidate(line: str, previous_line: str, after: str) -> tuple[str, int, list[str]]:
    reasons = []
    score = 35
    trimmed_after = after.strip()

    if re.match(r"^,\s*-", trimmed_after):
        score += 32
        reasons.append("inflection-after-comma")

    if GRAMMAR_MARKER.match(re.sub(r"^,\s*", "", trimmed_after)):
        score += 30
        reasons.append("grammar-marker")

    if LOWERCASE_ENTRY.match(line):
        score += 8
        reasons.append("lowercase-entry")

    if previous_line_looks_closed(previous_line):
        score += 12
        reasons.append("previous-line-closed")
    else:
        score -= 25
        reasons.append("possible-wrapped-definition")

    if has_noisy_characters(line[:120]):
        score -= 10
        reasons.append("ocr-noise-near-entry")

    confidence = "high" if score >= 75 else "medium" if score >= 55 else "low"
    return confidence, score, reasons


def extract_from_page(text: str, page_number: int) -> list[dict]:
    lines = [line.strip() for line in text.replace("\r", "").split("\n") if line.strip()]
    candidates = []

    for index, line in enumerate(lines):
        if HEADER_LINE.match(line):
            continue

        match = ENTRY_START.match(line)
        if not match:
            continue

        word = normalize_word(match.group(1))
        if len(word) != 4 or not ANY_CYRILLIC_WORD.match(word):
            continue

        previous_line = lines[index - 1] if index > 0 else ""
        confidence, score, reasons = classify_candidate(line, previous_line, match.group(2))
        status = "needs_review"

        if not STRICT_SERBIAN_WORD.match(word):
            score = min(score, 40)
            confidence = "low"
            status = "ocr_suspect"
            reasons.append("non-serbian-cyrillic-letter")

        candidates.append(
            {
                "word": word,
                "status": status,
                "confidence": confidence,
                "score": score,
                "page": page_number,
                "reason": "|".join(reasons),
                "answer_candidate": "",
                "hint": "",
                "sort_order": "",
            }
        )

    return candidates


def answer_rank(row: dict) -> tuple[int, str]:
    word = row["word"]
    score = int(row["score"])
    rank = score

    if word in ANSWER_PREFERENCE:
        rank += 80
    if word in ANSWER_BLOCKLIST:
        rank -= 100
    if row["confidence"] == "high":
        rank += 20
    elif row["confidence"] == "medium":
        rank += 5
    else:
        rank -= 25
    if row["status"] == "ocr_suspect":
        rank -= 100

    return (-rank, word)


def build_suggested_answers(rows: list[dict], count: int | None = None) -> list[dict]:
    if count is None:
        count = len(SUGGESTED_ANSWERS_ORDER)

    approved = []
    by_word = {row["word"]: row for row in rows}

    for word in SUGGESTED_ANSWERS_ORDER:
        row = by_word.get(word)
        if row and word not in ANSWER_BLOCKLIST:
            approved.append(row)

    for word in sorted(ANSWER_PREFERENCE, key=lambda value: value):
        row = by_word.get(word)
        if row and word not in ANSWER_BLOCKLIST and row not in approved:
            approved.append(row)

    if len(approved) < count:
        for row in sorted(rows, key=answer_rank):
            if row["word"] in ANSWER_BLOCKLIST:
                continue
            if row["status"] == "ocr_suspect":
                continue
            if row in approved:
                continue
            approved.append(row)
            if len(approved) >= count:
                break

    suggested = []
    for sort_order, row in enumerate(approved[:count], start=1):
        suggested.append(
            {
                "word": row["word"],
                "status": "suggested_answer",
                "confidence": row["confidence"],
                "score": row["score"],
                "page": row["page"],
                "reason": row["reason"],
                "hint": "",
                "sort_order": sort_order,
            }
        )
    return suggested


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else find_default_pdf()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(str(pdf_path))
    by_word = {}

    for page_number, page in enumerate(reader.pages, start=1):
        for candidate in extract_from_page(page.extract_text() or "", page_number):
            previous = by_word.get(candidate["word"])
            if not previous or int(candidate["score"]) > int(previous["score"]):
                by_word[candidate["word"]] = candidate

        if page_number % 100 == 0 or page_number == len(reader.pages):
            print(f"Processed {page_number}/{len(reader.pages)} pages, {len(by_word)} unique candidates")

    rows = sorted(
        by_word.values(),
        key=lambda row: (
            {"high": 0, "medium": 1, "low": 2}.get(row["confidence"], 3),
            row["word"],
        ),
    )
    for row in rows:
        if row["word"] in ANSWER_PREFERENCE and row["word"] not in ANSWER_BLOCKLIST:
            row["answer_candidate"] = "yes"

    high_rows = [row for row in rows if row["confidence"] == "high"]
    suggested_rows = build_suggested_answers(rows)

    full_header = [
        "word",
        "status",
        "confidence",
        "score",
        "page",
        "reason",
        "answer_candidate",
        "hint",
        "sort_order",
    ]
    suggested_header = ["word", "status", "confidence", "score", "page", "reason", "hint", "sort_order"]

    csv_write(FULL_CSV, rows, full_header)
    csv_write(HIGH_CSV, high_rows, full_header)
    csv_write(SUGGESTED_CSV, suggested_rows, suggested_header)

    summary = {
        "pdf": str(pdf_path),
        "totalPages": len(reader.pages),
        "totalUniqueCandidates": len(rows),
        "suggestedAnswers": len(suggested_rows),
        "byConfidence": dict(Counter(row["confidence"] for row in rows)),
        "byStatus": dict(Counter(row["status"] for row in rows)),
        "outputs": {
            "fullCsv": str(FULL_CSV),
            "highCsv": str(HIGH_CSV),
            "suggestedWeeklyAnswersCsv": str(SUGGESTED_CSV),
        },
    }
    SUMMARY_JSON.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
