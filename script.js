
let quote = "";
let typed = "";
let startTime;
let timer;
let running = false;

let correct = 0;
let wrong = 0;
let seconds = 0;

const quotes = [
    "Practice typing every day to improve your speed and accuracy.",
    "Learning JavaScript is fun when you build small interactive projects.",
    "Keep practicing consistently and never stop learning new things."
];

let quoteIndex = 0;

async function getQuote() {
    try {
        let res = await fetch("https://dummyjson.com/quotes/random");
        let data = await res.json();
        quote = data.quote;
    } catch (error) {
        quote = quotes[quoteIndex];
        quoteIndex = (quoteIndex + 1) % quotes.length;
    }

    typed = "";
    displayText();
}

function displayText() {
    let text = "";

    for (let i = 0; i < quote.length; i++) {
        if (i < typed.length) {
            if (typed[i] === quote[i]) {
                text += `<span class="correct">${quote[i]}</span>`;
            } else {
                text += `<span class="wrong">${quote[i]}</span>`;
            }
        } else {
            text += quote[i];
        }
    }

    document.getElementById("passage").innerHTML = text;
}

function startGame() {
    if (running) return;

    // Reset all results
    correct = 0;
    wrong = 0;
    seconds = 0;
    typed = "";

    document.getElementById("correct-result").innerText = 0;
    document.getElementById("wrong-result").innerText = 0;
    document.getElementById("time-result").innerText = 0;
    document.getElementById("wpm-result").innerText = 0;

    displayText();

    running = true;
    startTime = Date.now();

    document.getElementById("start-btn").disabled = true;
    document.getElementById("stop-btn").disabled = false;

    timer = setInterval(function () {
        seconds = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("time-result").innerText = seconds;
    }, 1000);
}

function stopGame() {
    if (!running) return;

    running = false;
    clearInterval(timer);

    document.getElementById("start-btn").disabled = false;
    document.getElementById("stop-btn").disabled = true;

    if (seconds > 0) {
        let minutes = seconds / 60;
        let wpm = Math.round((correct / 5) / minutes);
        document.getElementById("wpm-result").innerText = wpm;
    } else {
        document.getElementById("wpm-result").innerText = 0;
    }
}

document.addEventListener("keydown", async function (event) {
    if (!running) return;

    if (event.key === "Backspace") {
        if (typed.length > 0) {
            let lastChar = typed[typed.length - 1];

            if (lastChar === quote[typed.length - 1]) {
                correct = Math.max(0, correct - 1);
            } else {
                wrong = Math.max(0, wrong - 1);
            }

            typed = typed.slice(0, -1);
        }
    } else if (event.key.length === 1) {
        if (event.key === " ") {
            event.preventDefault();
        }

        let i = typed.length;

        if (i < quote.length) {
            if (event.key === quote[i]) {
                correct++;
            } else {
                wrong++;
            }

            typed += event.key;
        }
    } else {
        return;
    }

    document.getElementById("correct-result").innerText = correct;
    document.getElementById("wrong-result").innerText = wrong;

    displayText();

    if (typed.length === quote.length) {
        await getQuote();
    }
});

document.getElementById("start-btn").onclick = startGame;
document.getElementById("stop-btn").onclick = stopGame;

getQuote();
