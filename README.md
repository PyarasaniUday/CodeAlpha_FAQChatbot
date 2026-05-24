# 🤖 AI FAQ Chatbot

An AI-powered FAQ Chatbot Web Application built using Flask, HTML, CSS, JavaScript, NLTK, and scikit-learn as part of the CodeAlpha Artificial Intelligence Internship.

---

## 🚀 Features

- Answer AI and Machine Learning related FAQ questions
- Find the most relevant answer using NLP
- TF-IDF based question matching
- Cosine similarity for best answer selection
- Suggested questions for quick chatting
- Voice input support
- Text-to-speech response
- Chat history stored in browser
- Confidence score for matched answers
- Modern responsive UI
- Mobile-friendly design

---

## 🛠 Technologies Used

- Python
- Flask
- HTML5
- CSS3
- JavaScript
- NLTK
- scikit-learn
- TF-IDF Vectorizer
- Cosine Similarity
- Gunicorn

---

## 📁 Project Structure

```bash
CodeAlpha_FAQChatbot/
|
|-- app.py
|-- faq.json
|-- requirements.txt
|-- Procfile
|
|-- templates/
|   `-- index.html
|
|-- static/
|   |-- style.css
|   `-- script.js
|
`-- README.md
```

---

## 🧠 How It Works

1. The user types or speaks a question in the chatbot.
2. The Flask backend receives the question through the `/chat` route.
3. The question is cleaned using NLP preprocessing.
4. Stopwords and punctuation are removed using NLTK.
5. The cleaned question is converted into a TF-IDF vector.
6. Cosine similarity compares the user question with questions in `faq.json`.
7. The chatbot returns the closest matching answer with a confidence score.

---

## 🎯 What It Is Used For

This chatbot is used to answer common questions about Artificial Intelligence, Machine Learning, Deep Learning, NLP, CNN, SVM, KNN, Flask, TF-IDF, and project-related topics.

It helps users quickly understand AI/ML concepts through a simple web-based chatbot interface.

---

---

## 🌐 Live Demo

```bash
https://codealpha-faqchatbot.onrender.com/
```

---


## 📚 FAQ Dataset

The chatbot uses `faq.json` as its knowledge base.

Example:

```json
{
  "question": "What is Machine Learning?",
  "answer": "Machine Learning is a branch of AI that allows systems to learn from data without being explicitly programmed."
}
```

You can improve the chatbot by adding more questions and answers inside `faq.json`.

---


---

## 👨‍💻 Internship Project

This project was created for the CodeAlpha Artificial Intelligence Internship to demonstrate Flask development, NLP preprocessing, machine learning based text matching, and frontend chatbot design.

---

## 📄 License

This project is open-source and available for learning and portfolio use.
