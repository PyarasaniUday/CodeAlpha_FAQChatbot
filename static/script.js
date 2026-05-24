const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const clearChatButton = document.getElementById("clear-chat");
const voiceButton = document.getElementById("voice-button");
const suggestionButtons = document.querySelectorAll(".suggestion-chip");

const STORAGE_KEY = "codealpha_faq_chat_history";

const welcomeMessage = {
    role: "bot",
    text: "👋 Hello! I am your AI/ML Assistant.\nAsk me about ML algorithms, NLP, CNN, ANN, and more about AI/ML.",
    meta: "✅ Ready"
};

function loadHistory() {
    const savedHistory = localStorage.getItem(STORAGE_KEY);

    if (!savedHistory) {
        return [welcomeMessage];
    }

    try {
        const parsedHistory = JSON.parse(savedHistory);
        return Array.isArray(parsedHistory) && parsedHistory.length
            ? parsedHistory
            : [welcomeMessage];
    } catch {
        return [welcomeMessage];
    }
}

function saveHistory(history) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-40)));
}

let chatHistory = loadHistory();

function renderChat() {
    chatBox.innerHTML = "";
    chatHistory.forEach((message) => addMessage(message, false));
    scrollToBottom();
}

function addMessage(message, shouldSave = true) {
    const row = document.createElement("div");
    row.className = `message-row ${message.role}`;

    const bubble = document.createElement("div");
    bubble.className = `message ${message.role}`;
    bubble.textContent = message.text;

    const avatar = document.createElement("span");
    avatar.className = `message-symbol ${message.role}`;
    avatar.textContent = message.role === "user" ? "👤" : "🤖";
    avatar.setAttribute("aria-hidden", "true");

    if (message.meta) {
        const meta = document.createElement("span");
        meta.className = "message-meta";
        meta.textContent = message.meta;
        bubble.appendChild(meta);
    }

    if (message.role === "user") {
        row.appendChild(bubble);
        row.appendChild(avatar);
    } else {
        row.appendChild(avatar);
        row.appendChild(bubble);
    }
    chatBox.appendChild(row);

    if (shouldSave) {
        chatHistory.push(message);
        saveHistory(chatHistory);
    }

    scrollToBottom();
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingAnimation() {
    const row = document.createElement("div");
    row.className = "message-row bot";
    row.id = "typing-row";

    const bubble = document.createElement("div");
    bubble.className = "message bot typing";
    bubble.innerHTML = "<span></span><span></span><span></span>";

    row.appendChild(bubble);
    chatBox.appendChild(row);
    scrollToBottom();
}

function removeTypingAnimation() {
    const typingRow = document.getElementById("typing-row");
    if (typingRow) {
        typingRow.remove();
    }
}

function speakText(text) {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.95;
    window.speechSynthesis.speak(speech);
}

async function sendMessage(messageText) {
    const message = messageText.trim();

    if (!message) {
        return;
    }

    addMessage({ role: "user", text: message });
    userInput.value = "";
    showTypingAnimation();

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        removeTypingAnimation();

        const confidence = Math.round((data.confidence || 0) * 100);
        const meta = data.matched_question
            ? `🎯 Matched: "${data.matched_question}" | Confidence: ${confidence}%`
            : `🎯 Confidence: ${confidence}%`;

        addMessage({ role: "bot", text: data.response, meta });
        speakText(data.response);
    } catch (error) {
        removeTypingAnimation();
        addMessage({
            role: "bot",
            text: "I could not reach the chatbot server. Please make sure Flask is running and try again.",
            meta: error.message
        });
    }
}

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        addMessage({
            role: "bot",
            text: "Voice input is not supported in this browser. Please type your question instead.",
            meta: "Browser limitation"
        });
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    voiceButton.classList.add("listening");
    voiceButton.textContent = "Listening";
    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage(transcript);
    };

    recognition.onerror = () => {
        addMessage({
            role: "bot",
            text: "I could not hear that clearly. Please try the microphone again or type your question.",
            meta: "Voice input"
        });
    };

    recognition.onend = () => {
        voiceButton.classList.remove("listening");
        voiceButton.textContent = "🎤";
    };
}

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(userInput.value);
});

clearChatButton.addEventListener("click", () => {
    chatHistory = [welcomeMessage];
    saveHistory(chatHistory);
    renderChat();
});

voiceButton.addEventListener("click", startVoiceInput);

suggestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        sendMessage(button.dataset.question);
    });
});

renderChat();
