let quote = "";
let typed = "";
let startTime = null;
let timer = null;
let isPlaying = false;
let gameStarted = false;

let correct = 0;
let wrong = 0;
let seconds = 0;

const list = [
    "Practice typing every day to improve your speed and accuracy.",
    "Learning JavaScript is fun when you build small interactive projects.",
    "Keep practicing consistently and never stop learning new things."
];

let index = 0;
let nextQuoteCache = null;

async function fetchQuote() {
    let text = "";
    try {
        let res = await fetch("https://dummyjson.com/quotes/random");
        let data = await res.json();
        text = data.quote;
    } catch (err) {
        text = list[index];
        index = (index + 1) % list.length;
    }
    return text;
}

async function init() {
    let first;
    if (nextQuoteCache) {
        first = nextQuoteCache;
    } else {
        first = await fetchQuote();
    }
    
    let second = await fetchQuote();
    quote = first + " " + second;
    typed = "";
    correct = 0;
    wrong = 0;
    seconds = 0;
    gameStarted = false;
    isPlaying = true;

    document.getElementById("correct-result").innerText = 0;
    document.getElementById("wrong-result").innerText = 0;
    document.getElementById("time-result").innerText = 0;
    document.getElementById("wpm-result").innerText = 0;

    render();
    nextQuoteCache = await fetchQuote();
}

function render() {
    let html = "";
    for (let i = 0; i < quote.length; i++) {
        if (i < typed.length) {
            if (typed[i] === quote[i]) {
                html += `<span class="correct">${quote[i]}</span>`;
            } else {
                html += `<span class="wrong">${quote[i]}</span>`;
            }
        } else {
            html += `<span>${quote[i]}</span>`;
        }
    }
    
    let innerDiv = document.getElementById("passage-inner");
    innerDiv.innerHTML = html;

    let spans = innerDiv.querySelectorAll("span");
    let offset = 0;
    if (typed.length > 0 && typed.length <= spans.length) {
        let currentSpan = spans[typed.length - 1];
        offset = currentSpan.offsetLeft - 50;
        if (offset < 0) offset = 0;
    }
    innerDiv.style.transform = `translateX(-${offset}px)`;
}

function stopGame() {
    isPlaying = false;
    clearInterval(timer);

    if (seconds > 0) {
        let mins = seconds / 60;
        let wpm = Math.round((correct / 5) / mins);
        document.getElementById("wpm-result").innerText = wpm;
    } else {
        document.getElementById("wpm-result").innerText = 0;
    }
}

window.addEventListener("keydown", async function (e) {
    if (!isPlaying) return;

    if (!gameStarted) {
        gameStarted = true;
        startTime = Date.now();
        timer = setInterval(function () {
            seconds = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById("time-result").innerText = seconds;
        }, 1000);
    }

    if (e.key === "Backspace") {
        if (typed.length > 0) {
            let last = typed[typed.length - 1];

            if (last === quote[typed.length - 1]) {
                correct = Math.max(0, correct - 1);
            } else {
                wrong = Math.max(0, wrong - 1);
            }

            typed = typed.slice(0, -1);
        }
    } else if (e.key.length === 1) {
        if (e.key === " ") {
            e.preventDefault();
        }

        let pos = typed.length;

        if (pos < quote.length) {
            if (e.key === quote[pos]) {
                correct++;
            } else {
                wrong++;
            }

            typed += e.key;
        }
    } else {
        return;
    }

    document.getElementById("correct-result").innerText = correct;
    document.getElementById("wrong-result").innerText = wrong;

    render();

    if (typed.length === quote.length) {
        stopGame();
        setTimeout(async () => {
            await init();
        }, 1500);
        return;
    }

    let left = quote.length - typed.length;
    if (left <= 20 && nextQuoteCache) {
        let next = nextQuoteCache;
        quote += " " + next;
        render();
        nextQuoteCache = await fetchQuote();
    }
});

init();
