import random
from typing import Any

from backend.services.analysis_service import (
    get_error_counts,
)


QUESTION_BANK = {
    "grammar": [
        {
            "id": "grammar-1",
            "type": "Choose the correct sentence",
            "question": "Which sentence is grammatically correct?",
            "options": [
                "She go to college every day.",
                "She goes to college every day.",
                "She going to college every day.",
            ],
            "answer": "She goes to college every day.",
            "explanation": "The singular subject 'She' takes 'goes' in the simple present.",
        },
        {
            "id": "grammar-2",
            "type": "Complete the sentence",
            "question": "Each of the students ___ a notebook.",
            "options": ["have", "has", "are having"],
            "answer": "has",
            "explanation": "'Each' is singular, so it takes the singular verb 'has'.",
        },
        {
            "id": "grammar-3",
            "type": "Choose the best correction",
            "question": "Choose the corrected version: 'They was waiting outside.'",
            "options": [
                "They were waiting outside.",
                "They is waiting outside.",
                "They be waiting outside.",
            ],
            "answer": "They were waiting outside.",
            "explanation": "The plural subject 'They' takes 'were' in the past tense.",
        },
        {
            "id": "grammar-4",
            "type": "Complete the sentence",
            "question": "Neither of the answers ___ correct.",
            "options": ["are", "were", "is"],
            "answer": "is",
            "explanation": "'Neither' is treated as singular here, so it takes 'is'.",
        },
        {
            "id": "grammar-5",
            "type": "Choose the correct sentence",
            "question": "Which sentence uses subject–verb agreement correctly?",
            "options": [
                "The list of items are on the desk.",
                "The list of items is on the desk.",
                "The list of items be on the desk.",
            ],
            "answer": "The list of items is on the desk.",
            "explanation": "The subject is 'list', which is singular; the phrase 'of items' does not change the verb.",
        },
        {
            "id": "grammar-6",
            "type": "Complete the sentence",
            "question": "Everyone in the teams ___ ready to begin.",
            "options": ["are", "is", "were"],
            "answer": "is",
            "explanation": "'Everyone' is grammatically singular and takes 'is'.",
        },
        {
            "id": "grammar-7",
            "type": "Choose the correct sentence",
            "question": "Which sentence has the correct pronoun?",
            "options": [
                "The dog wagged it's tail.",
                "The dog wagged its tail.",
                "The dog wagged its' tail.",
            ],
            "answer": "The dog wagged its tail.",
            "explanation": "'Its' is the possessive form; 'it's' means 'it is' or 'it has'.",
        },
        {
            "id": "grammar-8",
            "type": "Complete the sentence",
            "question": "She ___ her keys before leaving the house.",
            "options": ["find", "finds", "finding"],
            "answer": "finds",
            "explanation": "In the simple present, a third-person singular subject takes a verb ending in -s.",
        },
    ],
    "spelling": [
        {
            "id": "spelling-1",
            "type": "Choose the correct spelling",
            "question": "Which word is spelled correctly?",
            "options": ["neccessary", "necessary", "necesary"],
            "answer": "necessary",
            "explanation": "The standard spelling is 'necessary', with one c and two s characters.",
        },
        {
            "id": "spelling-2",
            "type": "Spot the misspelled word",
            "question": "Which word needs correction? 'We recieved the package yesterday.'",
            "options": ["We", "recieved", "package"],
            "answer": "recieved",
            "explanation": "The correct spelling is 'received'; i comes before e after c.",
        },
        {
            "id": "spelling-3",
            "type": "Complete the word",
            "question": "Choose the correct spelling to complete: 'The class studied the env___ment.'",
            "options": ["iron", "iren", "iorne"],
            "answer": "iron",
            "explanation": "The word is spelled 'environment'.",
        },
        {
            "id": "spelling-4",
            "type": "Choose the correct spelling",
            "question": "Which word is spelled correctly?",
            "options": ["accomodate", "accommodate", "acommodate"],
            "answer": "accommodate",
            "explanation": "'Accommodate' has two c's and two m's.",
        },
        {
            "id": "spelling-5",
            "type": "Spot the misspelled word",
            "question": "Which word needs correction? 'Please seperate the papers by color.'",
            "options": ["Please", "seperate", "color"],
            "answer": "seperate",
            "explanation": "The correct spelling is 'separate', with 'par' in the middle.",
        },
        {
            "id": "spelling-6",
            "type": "Choose the correct spelling",
            "question": "Choose the correctly spelled word for something that happens often.",
            "options": ["frequently", "frequintly", "frequantly"],
            "answer": "frequently",
            "explanation": "'Frequently' is spelled with 'ent' before the final 'ly'.",
        },
        {
            "id": "spelling-7",
            "type": "Choose the correct spelling",
            "question": "Which word correctly completes the sentence? 'The new policy will ___ everyone.'",
            "options": ["affect", "effect", "affekt"],
            "answer": "affect",
            "explanation": "'Affect' is usually a verb meaning to influence; 'effect' is usually a noun.",
        },
    ],
    "tense": [
        {
            "id": "tense-1",
            "type": "Choose the correct sentence",
            "question": "Which sentence correctly describes yesterday?",
            "options": ["I eat dinner yesterday.", "I ate dinner yesterday.", "I eating dinner yesterday."],
            "answer": "I ate dinner yesterday.",
            "explanation": "'Yesterday' refers to a completed past action, so use the simple past 'ate'.",
        },
        {
            "id": "tense-2",
            "type": "Complete the sentence",
            "question": "By the time we arrived, the movie ___.",
            "options": ["starts", "has start", "had started"],
            "answer": "had started",
            "explanation": "Use the past perfect for an action completed before another past event.",
        },
        {
            "id": "tense-3",
            "type": "Choose the best correction",
            "question": "Choose the corrected version: 'She has finished her report last night.'",
            "options": [
                "She finished her report last night.",
                "She has finish her report last night.",
                "She finishing her report last night.",
            ],
            "answer": "She finished her report last night.",
            "explanation": "A specific finished time such as 'last night' takes the simple past.",
        },
        {
            "id": "tense-4",
            "type": "Complete the sentence",
            "question": "Tomorrow, we ___ the science museum.",
            "options": ["visited", "will visit", "have visited"],
            "answer": "will visit",
            "explanation": "'Tomorrow' points to the future, so use 'will visit'.",
        },
        {
            "id": "tense-5",
            "type": "Choose the correct sentence",
            "question": "Which sentence describes a habit?",
            "options": [
                "He walks to work every day.",
                "He walked to work every day tomorrow.",
                "He walking to work every day.",
            ],
            "answer": "He walks to work every day.",
            "explanation": "Use the simple present for a regular habit; 'he' takes 'walks'.",
        },
        {
            "id": "tense-6",
            "type": "Complete the sentence",
            "question": "At 8 p.m. yesterday, I ___ a book.",
            "options": ["read", "was reading", "will read"],
            "answer": "was reading",
            "explanation": "The past continuous describes an action in progress at a specific past time.",
        },
        {
            "id": "tense-7",
            "type": "Choose the best correction",
            "question": "Choose the corrected version: 'They will arrives soon.'",
            "options": [
                "They will arrive soon.",
                "They will arrived soon.",
                "They arrives soon.",
            ],
            "answer": "They will arrive soon.",
            "explanation": "After the modal verb 'will', use the base form 'arrive'.",
        },
    ],
    "punctuation": [
        {
            "id": "punctuation-1",
            "type": "Choose the punctuation",
            "question": "Which punctuation normally ends a statement?",
            "options": [".", ",", ":"],
            "answer": ".",
            "explanation": "A normal declarative sentence usually ends with a period.",
        },
        {
            "id": "punctuation-2",
            "type": "Choose the correctly punctuated sentence",
            "question": "Which sentence punctuates direct speech correctly?",
            "options": [
                "Maya said, 'I am ready.'",
                "Maya said 'I am ready'.",
                "Maya said, I am ready.",
            ],
            "answer": "Maya said, 'I am ready.'",
            "explanation": "Use a comma to introduce the quotation and place the sentence-ending period inside the closing quotation mark.",
        },
        {
            "id": "punctuation-3",
            "type": "Choose the correctly punctuated list",
            "question": "Which sentence correctly separates items in a list?",
            "options": [
                "We bought apples pears and bread.",
                "We bought apples, pears, and bread.",
                "We bought apples; pears, and bread.",
            ],
            "answer": "We bought apples, pears, and bread.",
            "explanation": "Commas separate items in a list; the comma before 'and' is also correct.",
        },
        {
            "id": "punctuation-4",
            "type": "Choose the correct punctuation",
            "question": "Which punctuation belongs at the end of this question: 'Where is the library___'",
            "options": [".", "?", "!"],
            "answer": "?",
            "explanation": "A direct question ends with a question mark.",
        },
        {
            "id": "punctuation-5",
            "type": "Choose the correctly punctuated sentence",
            "question": "Which sentence uses an apostrophe correctly?",
            "options": [
                "The students books are on the table.",
                "The student's books are on the table.",
                "The students' books is on the table.",
            ],
            "answer": "The student's books are on the table.",
            "explanation": "An apostrophe plus s shows that one student owns the books.",
        },
        {
            "id": "punctuation-6",
            "type": "Choose the correct punctuation",
            "question": "Which punctuation best joins these closely related clauses? 'The rain stopped___ we went outside.'",
            "options": [",", ";", "?"],
            "answer": ";",
            "explanation": "A semicolon can join two closely related independent clauses.",
        },
        {
            "id": "punctuation-7",
            "type": "Choose the correctly punctuated sentence",
            "question": "Which sentence uses a comma after an introductory phrase?",
            "options": [
                "After lunch we returned to class.",
                "After lunch, we returned to class.",
                "After, lunch we returned to class.",
            ],
            "answer": "After lunch, we returned to class.",
            "explanation": "A comma often follows an introductory phrase to separate it from the main clause.",
        },
    ],
    "capitalization": [
        {
            "id": "capitalization-1",
            "type": "Choose the correctly capitalized sentence",
            "question": "Which sentence is correctly capitalized?",
            "options": ["i am ready.", "I am ready.", "i Am ready."],
            "answer": "I am ready.",
            "explanation": "The personal pronoun 'I' is always capitalized.",
        },
        {
            "id": "capitalization-2",
            "type": "Choose the corrected sentence",
            "question": "Choose the correctly capitalized version: 'we visited london in april.'",
            "options": [
                "We visited London in April.",
                "We visited london in april.",
                "we visited London in April.",
            ],
            "answer": "We visited London in April.",
            "explanation": "Capitalize the first word of a sentence, place names, and month names.",
        },
        {
            "id": "capitalization-3",
            "type": "Find the capitalization error",
            "question": "Which word should be capitalized? 'My aunt lives near the pacific ocean.'",
            "options": ["aunt", "lives", "pacific ocean"],
            "answer": "pacific ocean",
            "explanation": "Names of geographic features are proper nouns and should be capitalized: 'Pacific Ocean'.",
        },
        {
            "id": "capitalization-4",
            "type": "Choose the correctly capitalized sentence",
            "question": "Which sentence capitalizes a book title correctly?",
            "options": [
                "We read charlotte's web in class.",
                "We read Charlotte's Web in class.",
                "We read Charlotte's web in Class.",
            ],
            "answer": "We read Charlotte's Web in class.",
            "explanation": "Capitalize the principal words in a book title and the author's name.",
        },
        {
            "id": "capitalization-5",
            "type": "Complete the sentence",
            "question": "We celebrate ___ in July.",
            "options": ["independence day", "Independence Day", "Independence day"],
            "answer": "Independence Day",
            "explanation": "Capitalize both words in the name of the holiday.",
        },
        {
            "id": "capitalization-6",
            "type": "Choose the correctly capitalized sentence",
            "question": "Which sentence correctly capitalizes a language?",
            "options": [
                "Marco is learning spanish.",
                "Marco is learning Spanish.",
                "marco is learning Spanish.",
            ],
            "answer": "Marco is learning Spanish.",
            "explanation": "Capitalize the first word of a sentence and the names of languages.",
        },
        {
            "id": "capitalization-7",
            "type": "Choose the correctly capitalized sentence",
            "question": "Which sentence correctly capitalizes a day of the week?",
            "options": [
                "Our meeting is on monday.",
                "Our meeting is on Monday.",
                "our meeting is on Monday.",
            ],
            "answer": "Our meeting is on Monday.",
            "explanation": "Capitalize the first word of a sentence and the names of days.",
        },
    ],
    "clarity": [
        {
            "id": "clarity-1",
            "type": "Choose the clearest revision",
            "question": "Which revision is clearest and most concise? 'Due to the fact that it was raining, we stayed inside.'",
            "options": [
                "Because it was raining, we stayed inside.",
                "It was raining, which was the reason why we stayed inside.",
                "Due to rain, the inside was where we stayed.",
            ],
            "answer": "Because it was raining, we stayed inside.",
            "explanation": "'Because' expresses the same cause directly with fewer words.",
        },
        {
            "id": "clarity-2",
            "type": "Choose the clearest sentence",
            "question": "Which sentence makes it clear who submitted the report?",
            "options": [
                "After Mia spoke to Ava, she submitted the report.",
                "Mia submitted the report after speaking to Ava.",
                "After their conversation, it was submitted by her.",
            ],
            "answer": "Mia submitted the report after speaking to Ava.",
            "explanation": "Naming the person removes the unclear pronoun reference.",
        },
        {
            "id": "clarity-3",
            "type": "Choose the most concise revision",
            "question": "Choose the most concise version: 'At this point in time, we are currently waiting.'",
            "options": [
                "At this point in time, we are waiting currently.",
                "We are waiting now.",
                "Currently, at this point, we wait now.",
            ],
            "answer": "We are waiting now.",
            "explanation": "'Now' replaces the redundant phrases 'at this point in time' and 'currently'.",
        },
        {
            "id": "clarity-4",
            "type": "Choose the clearest revision",
            "question": "Which sentence clearly states who borrowed the book?",
            "options": [
                "When Alex met Jordan, they borrowed the book.",
                "Alex borrowed the book when Alex met Jordan.",
                "When the meeting happened, it was borrowed.",
            ],
            "answer": "Alex borrowed the book when Alex met Jordan.",
            "explanation": "Repeating the person's name removes the unclear reference in 'they'.",
        },
        {
            "id": "clarity-5",
            "type": "Choose the clearest revision",
            "question": "Choose the clearest version: 'The reason we left was because it was late.'",
            "options": [
                "We left because it was late.",
                "The reason for leaving was due to the lateness.",
                "It was late, which was the reason why we left.",
            ],
            "answer": "We left because it was late.",
            "explanation": "The revision states the cause directly and removes redundant wording.",
        },
        {
            "id": "clarity-6",
            "type": "Choose the clearest sentence",
            "question": "Which instruction is easiest to follow?",
            "options": [
                "Before submitting, review the form for missing information.",
                "The form, before submission, should be reviewed by you for things missing.",
                "Reviewing the form is something that should happen before it is submitted.",
            ],
            "answer": "Before submitting, review the form for missing information.",
            "explanation": "Direct, active wording makes the instruction easier to understand.",
        },
        {
            "id": "clarity-7",
            "type": "Choose the most concise revision",
            "question": "Choose the concise version: 'The final outcome was completely unexpected.'",
            "options": [
                "The final outcome was unexpected.",
                "The final end result was very unexpected.",
                "The outcome was completely and totally unexpected.",
            ],
            "answer": "The final outcome was unexpected.",
            "explanation": "Removing 'completely' preserves the meaning without unnecessary emphasis.",
        },
    ],
    "vocabulary": [
        {
            "id": "vocabulary-1",
            "type": "Choose the best-fit word",
            "question": "Choose the best word: 'The instructions were so ___ that everyone understood them.'",
            "options": ["clear", "scarce", "distant"],
            "answer": "clear",
            "explanation": "'Clear' means easy to understand and fits the context.",
        },
        {
            "id": "vocabulary-2",
            "type": "Choose the closest meaning",
            "question": "Which word is closest in meaning to 'brief'?",
            "options": ["short", "careful", "bright"],
            "answer": "short",
            "explanation": "'Brief' means short in duration or length.",
        },
        {
            "id": "vocabulary-3",
            "type": "Choose the most precise word",
            "question": "Choose the most precise word: 'The scientist ___ the results carefully.'",
            "options": ["looked at", "examined", "got"],
            "answer": "examined",
            "explanation": "'Examined' precisely describes looking at something carefully and systematically.",
        },
        {
            "id": "vocabulary-4",
            "type": "Choose the best-fit word",
            "question": "Choose the best word: 'The directions were ___, so nobody got lost.'",
            "options": ["confusing", "precise", "distant"],
            "answer": "precise",
            "explanation": "'Precise' means clear and exact, which fits helpful directions.",
        },
        {
            "id": "vocabulary-5",
            "type": "Choose the closest meaning",
            "question": "Which word is closest in meaning to 'generous'?",
            "options": ["giving", "silent", "ordinary"],
            "answer": "giving",
            "explanation": "A generous person is willing to give or share.",
        },
        {
            "id": "vocabulary-6",
            "type": "Choose the most precise word",
            "question": "Choose the most precise verb: 'The seed began to ___ after the rain.'",
            "options": ["grow", "do", "make"],
            "answer": "grow",
            "explanation": "'Grow' specifically describes a plant increasing in size or developing.",
        },
        {
            "id": "vocabulary-7",
            "type": "Choose the best-fit word",
            "question": "Choose the best word: 'Please ___ your answer with an example.'",
            "options": ["clarify", "decorate", "delay"],
            "answer": "clarify",
            "explanation": "'Clarify' means to make an idea easier to understand.",
        },
    ],
}


def generate_practice(
    mistakes: list[dict[str, Any]],
    excluded_questions: list[str] | None = None,
) -> dict:

    counts = get_error_counts(
        mistakes
    )

    priority = "grammar"

    if mistakes:

        priority = max(
            counts,
            key=counts.get,
        )

        if counts.get(
            priority,
            0,
        ) == 0:

            mistake_type = str(
                mistakes[0].get(
                    "type",
                    "Grammar",
                )
            ).lower()

            if "spelling" in mistake_type:
                priority = "spelling"

            elif "tense" in mistake_type:
                priority = "tense"

            elif "punctuation" in mistake_type:
                priority = "punctuation"

            elif "capitalization" in mistake_type:
                priority = "capitalization"

            else:
                priority = "grammar"

    topic_questions = QUESTION_BANK.get(
        priority,
        QUESTION_BANK["grammar"],
    )
    excluded = set(excluded_questions or [])
    questions = [
        question
        for question in topic_questions
        if question["id"] not in excluded
    ]
    round_complete = not questions
    if round_complete:
        last_question_id = next(
            (
                question_id
                for question_id in reversed(excluded_questions or [])
                if question_id in {question["id"] for question in topic_questions}
            ),
            None,
        )
        questions = [
            question
            for question in topic_questions
            if question["id"] != last_question_id
        ]

    return {
        "topic": priority.capitalize(),
        "questions": [random.choice(questions)],
        "round_complete": round_complete,
    }