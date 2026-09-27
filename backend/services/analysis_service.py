import re
from difflib import SequenceMatcher
from typing import Any


FILLER_WORDS = {
    "really",
    "very",
    "actually",
    "basically",
    "literally",
    "just",
    "maybe",
    "perhaps",
    "kind of",
    "sort of",
    "you know",
}


COMMON_SPELLING = {
    "collge": "college",
    "assigment": "assignment",
    "studing": "studying",
    "recieve": "receive",
    "seperate": "separate",
    "definately": "definitely",
    "occured": "occurred",
    "enviroment": "environment",
    "becuase": "because",
    "adress": "address",
    "acheive": "achieve",
    "teh": "the",
}


def clean_text(text: str) -> str:
    return " ".join(
        text.strip().split()
    )


def normalize_type(value: Any) -> str:

    value = str(
        value or "Grammar"
    ).strip()

    allowed = {
        "grammar",
        "spelling",
        "punctuation",
        "capitalization",
        "tense",
        "clarity",
        "vocabulary",
    }

    lower = value.lower()

    for item in allowed:
        if item in lower:
            return item.capitalize()

    return value[:40] or "Grammar"


def filter_mistakes(
    original_text: str,
    mistakes: list,
) -> list[dict]:

    result = []
    seen = set()

    for item in mistakes:

        if not isinstance(item, dict):
            continue

        original = str(
            item.get("original", "")
        ).strip()

        correction = str(
            item.get("correction", "")
        ).strip()

        if not original:
            continue

        if not correction:
            continue

        if original.lower() not in original_text.lower():
            continue

        if original.lower() == correction.lower():
            continue

        cleaned = {
            "original": original,
            "correction": correction,
            "type": normalize_type(
                item.get("type")
            ),
            "explanation": str(
                item.get("explanation")
                or "This part of the sentence needs improvement."
            ),
            "rule": str(
                item.get("rule")
                or "Review the relevant grammar rule."
            ),
            "example": str(
                item.get("example")
                or correction
            ),
        }

        key = (
            cleaned["original"].lower(),
            cleaned["correction"].lower(),
            cleaned["type"].lower(),
        )

        if key not in seen:
            seen.add(key)
            result.append(cleaned)

    return result


def basic_checks(text: str) -> list[dict]:

    mistakes = []

    stripped = text.strip()

    if not stripped:
        return mistakes

    # First word capitalization
    match = re.search(
        r"\b[A-Za-z]",
        stripped,
    )

    if match:
        character = match.group(0)

        if character.islower():
            mistakes.append({
                "original": character,
                "correction": character.upper(),
                "type": "Capitalization",
                "explanation": (
                    "The first word of a sentence should begin "
                    "with a capital letter."
                ),
                "rule": (
                    "Capitalize the first word of every sentence."
                ),
                "example": "She went to college.",
            })

    # Pronoun I
    if re.search(
        r"\bi\b",
        stripped,
    ):
        mistakes.append({
            "original": "i",
            "correction": "I",
            "type": "Capitalization",
            "explanation": (
                "The personal pronoun 'I' must always be capitalized."
            ),
            "rule": (
                "Always write the pronoun I in uppercase."
            ),
            "example": "I am a student.",
        })

    # Ending punctuation
    if stripped[-1] not in ".?!":
        match = re.search(
            r"[\w']+$",
            stripped,
        )

        if match:
            word = match.group(0)

            mistakes.append({
                "original": word,
                "correction": word + ".",
                "type": "Punctuation",
                "explanation": (
                    "A complete sentence should normally end "
                    "with suitable punctuation."
                ),
                "rule": (
                    "Use a period, question mark or exclamation mark "
                    "at the end of a sentence."
                ),
                "example": "I completed my assignment.",
            })

    # Capitalization after sentence punctuation
    sentences = re.split(
        r"(?<=[.!?])\s+",
        stripped,
    )

    for sentence in sentences[1:]:
        if sentence and sentence[0].isalpha():
            if sentence[0].islower():
                mistakes.append({
                    "original": sentence[0],
                    "correction": sentence[0].upper(),
                    "type": "Capitalization",
                    "explanation": (
                        "A new sentence should begin with a capital letter."
                    ),
                    "rule": (
                        "Capitalize the first word of every sentence."
                    ),
                    "example": "The project is complete.",
                })

    return mistakes


def backup_spelling_checks(
    text: str,
) -> list[dict]:

    mistakes = []

    lower = text.lower()

    for wrong, right in COMMON_SPELLING.items():

        if re.search(
            rf"\b{re.escape(wrong)}\b",
            lower,
        ):
            mistakes.append({
                "original": wrong,
                "correction": right,
                "type": "Spelling",
                "explanation": (
                    f"'{wrong}' is misspelled. "
                    f"The correct spelling is '{right}'."
                ),
                "rule": (
                    "Use the standard spelling of the word."
                ),
                "example": (
                    f"I completed my {right}."
                ),
            })

    return mistakes


def backup_grammar_checks(
    text: str,
) -> list[dict]:

    mistakes = []

    lower = text.lower()

    patterns = [
        (
            r"\bi\s+were\b",
            "were",
            "was",
            "Grammar",
            "The subject 'I' requires 'was' in the past continuous tense.",
            "Use 'was' with I and 'were' with you, we and they.",
            "I was playing yesterday.",
        ),
        (
            r"\bshe go\b",
            "go",
            "goes",
            "Grammar",
            "The singular subject 'she' requires the verb 'goes' in the simple present.",
            "Use the third-person singular form with he, she and it.",
            "She goes to college every day.",
        ),
        (
            r"\bhe go\b",
            "go",
            "goes",
            "Grammar",
            "The singular subject 'he' requires the verb 'goes' in the simple present.",
            "Use the third-person singular form with he, she and it.",
            "He goes to college every day.",
        ),
        (
            r"\bit go\b",
            "go",
            "goes",
            "Grammar",
            "The singular subject 'it' requires the verb 'goes' in the simple present.",
            "Use the third-person singular form with he, she and it.",
            "It goes smoothly.",
        ),
        (
            r"\bshe do\b",
            "do",
            "does",
            "Grammar",
            "The singular subject 'she' requires 'does'.",
            "Use 'does' with singular third-person subjects.",
            "She does her work.",
        ),
        (
            r"\bhe do\b",
            "do",
            "does",
            "Grammar",
            "The singular subject 'he' requires 'does'.",
            "Use 'does' with singular third-person subjects.",
            "He does his work.",
        ),
        (
            r"\bshe have\b",
            "have",
            "has",
            "Grammar",
            "The singular subject 'she' requires 'has'.",
            "Use 'has' with singular third-person subjects.",
            "She has a book.",
        ),
        (
            r"\bhe have\b",
            "have",
            "has",
            "Grammar",
            "The singular subject 'he' requires 'has'.",
            "Use 'has' with singular third-person subjects.",
            "He has a book.",
        ),
    ]

    for (
        pattern,
        wrong,
        right,
        kind,
        explanation,
        rule,
        example,
    ) in patterns:

        if re.search(pattern, lower):
            mistakes.append({
                "original": wrong,
                "correction": right,
                "type": kind,
                "explanation": explanation,
                "rule": rule,
                "example": example,
            })

    # Common past tense patterns
    past_patterns = [
        (
            r"\beat dinner yesterday\b",
            "eat",
            "ate",
        ),
        (
            r"\bgo to college yesterday\b",
            "go",
            "went",
        ),
        (
            r"\bgo to school yesterday\b",
            "go",
            "went",
        ),
        (
            r"\bsubmit the assignment yesterday\b",
            "submit",
            "submitted",
        ),
    ]

    for pattern, wrong, right in past_patterns:

        if re.search(pattern, lower):
            mistakes.append({
                "original": wrong,
                "correction": right,
                "type": "Tense",
                "explanation": (
                    "The sentence contains a past-time expression, "
                    "so the completed action should use the past tense."
                ),
                "rule": (
                    "Use the simple past for completed actions "
                    "associated with past-time expressions such as yesterday."
                ),
                "example": "I ate dinner yesterday.",
            })

    return mistakes


def derive_difference(
    original_text: str,
    corrected_text: str,
) -> list[dict]:

    original_words = original_text.split()
    corrected_words = corrected_text.split()

    if (
        [word.lower() for word in original_words]
        == [word.lower() for word in corrected_words]
    ):
        return []

    matcher = SequenceMatcher(
        None,
        original_words,
        corrected_words,
    )

    for (
        tag,
        i1,
        i2,
        j1,
        j2,
    ) in matcher.get_opcodes():

        if tag == "equal":
            continue

        original_part = " ".join(
            original_words[i1:i2]
        ).strip()

        corrected_part = " ".join(
            corrected_words[j1:j2]
        ).strip()

        if original_part and corrected_part:
            return [{
                "original": original_part,
                "correction": corrected_part,
                "type": "Grammar",
                "explanation": (
                    "The AI identified a contextual writing correction "
                    "between the original and corrected versions."
                ),
                "rule": (
                    "Use the form that is grammatically appropriate "
                    "for the surrounding sentence."
                ),
                "example": corrected_text,
            }]

    return []


def detect_filler_words(
    text: str,
) -> list[dict]:

    lower = text.lower()

    result = []

    for word in sorted(
        FILLER_WORDS,
        key=len,
        reverse=True,
    ):

        count = len(
            re.findall(
                rf"\b{re.escape(word)}\b",
                lower,
            )
        )

        if count:
            result.append({
                "word": word,
                "count": count,
            })

    return result


def detect_repeated_phrases(
    text: str,
) -> list[dict]:

    words = re.findall(
        r"\b[\w']+\b",
        text.lower(),
    )

    counts = {}

    for size in (2, 3):

        for index in range(
            len(words) - size + 1
        ):

            phrase = " ".join(
                words[index:index + size]
            )

            counts[phrase] = (
                counts.get(phrase, 0) + 1
            )

    result = []

    for phrase, count in counts.items():

        if count > 1:
            result.append({
                "phrase": phrase,
                "count": count,
            })

    return sorted(
        result,
        key=lambda item: item["count"],
        reverse=True,
    )[:10]


def calculate_readability(
    text: str,
) -> dict:

    words = re.findall(
        r"\b[\w']+\b",
        text,
    )

    sentences = re.findall(
        r"[^.!?]+(?:[.!?]+|$)",
        text,
    )

    sentence_count = len(
        [
            sentence
            for sentence in sentences
            if sentence.strip()
        ]
    )

    word_count = len(words)

    average = round(
        word_count / max(
            1,
            sentence_count,
        ),
        2,
    )

    if average <= 12:
        level = "Easy"

    elif average <= 20:
        level = "Moderate"

    else:
        level = "Advanced"

    return {
        "level": level,
        "word_count": word_count,
        "sentence_count": sentence_count,
        "average_sentence_length": average,
    }


def analyze_sentences(
    text: str,
) -> list[dict]:

    sentences = [
        sentence.strip()
        for sentence in re.split(
            r"(?<=[.!?])\s+",
            text.strip(),
        )
        if sentence.strip()
    ]

    if text.strip() and not sentences:
        sentences = [text.strip()]

    result = []

    for number, sentence in enumerate(
        sentences,
        start=1,
    ):

        word_count = len(
            re.findall(
                r"\b[\w']+\b",
                sentence,
            )
        )

        if word_count <= 20:
            quality = "Good"

        elif word_count <= 30:
            quality = "Moderate"

        else:
            quality = "Long"

        result.append({
            "sentence_number": number,
            "sentence": sentence,
            "word_count": word_count,
            "quality": quality,
        })

    return result


def get_error_counts(
    mistakes: list[dict],
) -> dict:

    counts = {
        "grammar": 0,
        "spelling": 0,
        "punctuation": 0,
        "capitalization": 0,
        "tense": 0,
        "clarity": 0,
        "vocabulary": 0,
    }

    for mistake in mistakes:

        kind = str(
            mistake.get("type", "")
        ).lower()

        if "grammar" in kind:
            counts["grammar"] += 1

        elif "spelling" in kind:
            counts["spelling"] += 1

        elif "punctuation" in kind:
            counts["punctuation"] += 1

        elif "capitalization" in kind:
            counts["capitalization"] += 1

        elif "tense" in kind:
            counts["tense"] += 1

        elif "clarity" in kind:
            counts["clarity"] += 1

        elif "vocabulary" in kind:
            counts["vocabulary"] += 1

    return counts


def calculate_scores(
    mistakes: list[dict],
    text: str,
) -> dict:

    grammar = 100
    spelling = 100
    punctuation = 100
    clarity = 100
    vocabulary = 100

    for mistake in mistakes:

        kind = str(
            mistake.get("type", "")
        ).lower()

        if (
            "grammar" in kind
            or "tense" in kind
        ):
            grammar -= 18

        elif "spelling" in kind:
            spelling -= 20

        elif "punctuation" in kind:
            punctuation -= 15

        elif "clarity" in kind:
            clarity -= 15

        elif "vocabulary" in kind:
            vocabulary -= 10

        elif "capitalization" in kind:
            grammar -= 5

    filler_count = len(
        detect_filler_words(text)
    )

    repeated_count = len(
        detect_repeated_phrases(text)
    )

    clarity -= min(
        25,
        filler_count * 5,
    )

    clarity -= min(
        20,
        repeated_count * 4,
    )

    grammar = max(
        0,
        min(100, grammar),
    )

    spelling = max(
        0,
        min(100, spelling),
    )

    punctuation = max(
        0,
        min(100, punctuation),
    )

    clarity = max(
        0,
        min(100, clarity),
    )

    vocabulary = max(
        0,
        min(100, vocabulary),
    )

    overall = round(
        grammar * 0.35
        + spelling * 0.15
        + punctuation * 0.15
        + clarity * 0.20
        + vocabulary * 0.15
    )

    if not mistakes and not filler_count:
        overall = 100

    return {
        "score": max(
            0,
            min(100, overall),
        ),
        "grammar": grammar,
        "spelling": spelling,
        "punctuation": punctuation,
        "clarity": clarity,
        "vocabulary": vocabulary,
    }


def build_analysis_result(
    original_text: str,
    raw_result: dict,
    ai_available: bool = True,
) -> dict:

    corrected_text = str(
        raw_result.get(
            "corrected_text",
            original_text,
        )
    ).strip()

    ai_mistakes = raw_result.get(
        "mistakes",
        [],
    )

    if not isinstance(
        ai_mistakes,
        list,
    ):
        ai_mistakes = []

    mistakes = filter_mistakes(
        original_text,
        ai_mistakes,
    )

    deterministic = (
        basic_checks(original_text)
        + backup_spelling_checks(original_text)
        + backup_grammar_checks(original_text)
    )

    mistakes = filter_mistakes(
        original_text,
        mistakes + deterministic,
    )

    if (
        not mistakes
        and corrected_text
        and corrected_text.lower()
        != original_text.lower()
    ):
        mistakes = derive_difference(
            original_text,
            corrected_text,
        )

    mistakes = filter_mistakes(
        original_text,
        mistakes,
    )

    scores = calculate_scores(
        mistakes,
        original_text,
    )

    suggestions = raw_result.get(
        "suggestions",
        [],
    )

    if not isinstance(
        suggestions,
        list,
    ):
        suggestions = []

    suggestions = list(
        dict.fromkeys(
            str(item).strip()
            for item in suggestions
            if str(item).strip()
        )
    )

    rewrite = raw_result.get(
        "rewrite_options",
        {},
    )

    if not isinstance(
        rewrite,
        dict,
    ):
        rewrite = {}

    rewrite_options = {
        "professional": str(
            rewrite.get(
                "professional",
                corrected_text,
            )
        ),
        "simple": str(
            rewrite.get(
                "simple",
                corrected_text,
            )
        ),
        "concise": str(
            rewrite.get(
                "concise",
                corrected_text,
            )
        ),
        "confident": str(
            rewrite.get(
                "confident",
                corrected_text,
            )
        ),
        "creative": str(
            rewrite.get(
                "creative",
                corrected_text,
            )
        ),
    }

    return {
        "corrected_text": corrected_text,
        "summary": str(
            raw_result.get(
                "summary",
                "Your writing was analyzed successfully.",
            )
        ),
        "mistakes": mistakes,
        "suggestions": suggestions,
        "rewrite_options": rewrite_options,
        **scores,
        "error_counts": get_error_counts(
            mistakes,
        ),
        "readability": calculate_readability(
            original_text,
        ),
        "filler_words": detect_filler_words(
            original_text,
        ),
        "repeated_phrases": detect_repeated_phrases(
            original_text,
        ),
        "sentence_analysis": analyze_sentences(
            original_text,
        ),
        "ai_available": ai_available,
    }


def build_fallback_result(
    text: str,
) -> dict:

    mistakes = (
        basic_checks(text)
        + backup_spelling_checks(text)
        + backup_grammar_checks(text)
    )

    mistakes = filter_mistakes(
        text,
        mistakes,
    )

    corrected_text = text.strip()

    if corrected_text:

        corrected_text = (
            corrected_text[0].upper()
            + corrected_text[1:]
        )

        for wrong, right in COMMON_SPELLING.items():
            corrected_text = re.sub(
                rf"\b{re.escape(wrong)}\b",
                right,
                corrected_text,
                flags=re.IGNORECASE,
            )

        corrected_text = re.sub(
            r"\bshe\s+go\b",
            "She goes",
            corrected_text,
            flags=re.IGNORECASE,
        )

        corrected_text = re.sub(
            r"\bhe\s+go\b",
            "He goes",
            corrected_text,
            flags=re.IGNORECASE,
        )

        corrected_text = re.sub(
            r"\bi\s+were\b",
            "I was",
            corrected_text,
            flags=re.IGNORECASE,
        )

        if corrected_text[-1] not in ".?!":
            corrected_text += "."

    scores = calculate_scores(
        mistakes,
        text,
    )

    return {
        "corrected_text": corrected_text,
        "summary": (
            "Ollama was unavailable, so basic deterministic "
            "writing checks were applied."
        ),
        "mistakes": mistakes,
        "suggestions": [
            "Review verb tense against time expressions.",
            "Check spelling before submitting.",
            "Use appropriate punctuation.",
        ],
        "rewrite_options": {
            "professional": corrected_text,
            "simple": corrected_text,
            "concise": corrected_text,
            "confident": corrected_text,
            "creative": corrected_text,
        },
        **scores,
        "error_counts": get_error_counts(
            mistakes,
        ),
        "readability": calculate_readability(
            text,
        ),
        "filler_words": detect_filler_words(
            text,
        ),
        "repeated_phrases": detect_repeated_phrases(
            text,
        ),
        "sentence_analysis": analyze_sentences(
            text,
        ),
        "ai_available": False,
    }