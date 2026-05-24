from __future__ import annotations

import json
import string
from pathlib import Path

import nltk
from flask import Flask, jsonify, render_template, request
from nltk.corpus import stopwords
from nltk.tokenize import wordpunct_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent
FAQ_PATH = BASE_DIR / "faq.json"
CONFIDENCE_THRESHOLD = 0.28

app = Flask(__name__)


def ensure_nltk_data() -> None:
    """Download the small NLTK resource used for stopword removal."""
    try:
        nltk.data.find("corpora/stopwords")
    except LookupError:
        try:
            nltk.download("stopwords", quiet=True)
        except Exception:
            pass


def load_faq_data() -> list[dict[str, str]]:
    with FAQ_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def load_stop_words() -> set[str]:
    try:
        return set(stopwords.words("english"))
    except LookupError:
        return {
            "a",
            "an",
            "and",
            "are",
            "as",
            "at",
            "be",
            "by",
            "for",
            "from",
            "how",
            "in",
            "is",
            "it",
            "of",
            "on",
            "or",
            "that",
            "the",
            "this",
            "to",
            "what",
            "with",
        }


ensure_nltk_data()
faq_data = load_faq_data()
questions = [item["question"] for item in faq_data]
answers = [item["answer"] for item in faq_data]
stop_words = load_stop_words()


def preprocess(text: str) -> str:
    text = text.lower().strip()
    tokens = wordpunct_tokenize(text)
    clean_tokens = [
        word
        for word in tokens
        if word not in stop_words and word not in string.punctuation
    ]
    return " ".join(clean_tokens)


processed_questions = [preprocess(question) for question in questions]
exact_question_lookup = {
    processed_question: index
    for index, processed_question in enumerate(processed_questions)
    if processed_question
}
vectorizer = TfidfVectorizer(ngram_range=(1, 2))
question_vectors = vectorizer.fit_transform(processed_questions)


def get_suggestions(limit: int = 6) -> list[str]:
    priority_questions = [
        "What is Artificial Intelligence?",
        "What is Machine Learning?",
        "What is Deep Learning?",
        "What is CNN?",
        "What is NLP?",
        "How does this chatbot work?",
    ]
    return priority_questions[:limit]


def find_best_answer(user_message: str) -> dict[str, object]:
    processed_message = preprocess(user_message)

    if not processed_message:
        return {
            "answer": "Please ask a complete question so I can match it with the FAQ dataset.",
            "confidence": 0,
            "matched_question": None,
        }

    if processed_message in exact_question_lookup:
        exact_index = exact_question_lookup[processed_message]
        return {
            "answer": answers[exact_index],
            "confidence": 1.0,
            "matched_question": questions[exact_index],
        }

    user_vector = vectorizer.transform([processed_message])
    similarity_scores = cosine_similarity(user_vector, question_vectors)[0]
    best_match_index = int(similarity_scores.argmax())
    best_score = float(similarity_scores[best_match_index])

    if best_score >= CONFIDENCE_THRESHOLD:
        return {
            "answer": answers[best_match_index],
            "confidence": round(best_score, 3),
            "matched_question": questions[best_match_index],
        }

    return {
        "answer": (
            "I am not fully sure about that yet. Try asking about AI, machine learning, "
            "Flask, NLP, TF-IDF, cosine similarity, deployment, or this project."
        ),
        "confidence": round(best_score, 3),
        "matched_question": None,
    }


@app.route("/")
def home():
    return render_template("index.html", suggestions=get_suggestions())


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Message is required."}), 400

    result = find_best_answer(user_message)
    return jsonify(
        {
            "response": result["answer"],
            "confidence": result["confidence"],
            "matched_question": result["matched_question"],
        }
    )


@app.route("/suggestions")
def suggestions():
    return jsonify({"suggestions": get_suggestions(8)})


@app.route("/health")
def health():
    return jsonify({"status": "healthy", "faq_count": len(faq_data)})


if __name__ == "__main__":
    app.run(debug=True)
