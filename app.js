// ─── DOM Elements ───────────────────────────────────────────
const textInput     = document.getElementById('textInput');
const sendBtn       = document.getElementById('sendBtn');
const micBtn        = document.getElementById('micBtn');
const recognizedEl  = document.querySelector('#recognizedText span');
const resultEl      = document.getElementById('result');
const speakBtn      = document.getElementById('speakResult');
const historyList   = document.getElementById('historyList');
const clearBtn      = document.getElementById('clearHistory');

let lastResult = '';

// ─── 1. PARSE & CALCULATE ───────────────────────────────────
function processCommand(text) {
  text = text.toLowerCase().trim();
  recognizedEl.textContent = text;

  // Number word map
  const wordMap = {
    'zero':0,'one':1,'two':2,'three':3,'four':4,'five':5,
    'six':6,'seven':7,'eight':8,'nine':9,'ten':10,
    'eleven':11,'twelve':12,'twenty':20,'thirty':30,'hundred':100
  };

  // Replace word numbers
  Object.keys(wordMap).forEach(word => {
    text = text.replace(new RegExp(`\\b${word}\\b`, 'g'), wordMap[word]);
  });

  // Extract numbers
  const numbers = text.match(/-?\d+(\.\d+)?/g);

  if (!numbers || numbers.length < 2) {
    showResult('❌ Could not find two numbers. Try: "add 5 and 3"');
    return;
  }

  const a = parseFloat(numbers[0]);
  const b = parseFloat(numbers[1]);
  let result;
  let operationName;

  // Detect operation
  if (/add|plus|sum|and/.test(text)) {
    result = a + b; operationName = 'Addition';
  } else if (/sub|minus|subtract|difference/.test(text)) {
    result = a - b; operationName = 'Subtraction';
  } else if (/mul|times|product|into/.test(text)) {
    result = a * b; operationName = 'Multiplication';
  } else if (/div|divided|divide|quotient|over/.test(text)) {
    if (b === 0) { showResult(' Cannot divide by zero!'); return; }
    result = a / b; operationName = 'Division';
  } else if (/mod|modulo|remainder/.test(text)) {
    result = a % b; operationName = 'Modulo';
  } else if (/pow|power|exponent/.test(text)) {
    result = Math.pow(a, b); operationName = 'Power';
  } else if (/sqrt|square root/.test(text)) {
    result = Math.sqrt(a); operationName = 'Square Root';
  } else if(/love|gopika|nizam/.test(text)){
  showResult('I love you Fathima princess Chellam💜');
  return;
  } else {
    showResult(' Operation not understood. Try: add, subtract, multiply, divide, power, modulo');
    return;
  }

  // Round to 4 decimal places
  result = Math.round(result * 10000) / 10000;
  const output = `${operationName} of ${a} and ${b} = ${result}`;
  showResult(`Result: ${result}`);
  saveHistory(output);
  lastResult = `The answer is ${result}`;
}

// ─── 2. DISPLAY RESULT ──────────────────────────────────────
function showResult(text) {
  resultEl.textContent = text;
  lastResult = text;
}

// ─── 3. VOICE INPUT (Speech to Text) ────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;

  micBtn.addEventListener('click', () => {
    micBtn.textContent = '🔴 Listening...';
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    textInput.value = transcript;
    micBtn.textContent = '🎤 Speak';
    processCommand(transcript);
  };

  recognition.onerror = () => {
    micBtn.textContent = '🎤 Speak';
    showResult('❌ Mic error. Try Chrome browser.');
  };
} else {
  micBtn.disabled = true;
  micBtn.textContent = '🎤 Not supported';
}

// ─── 4. VOICE OUTPUT (Text to Speech) ───────────────────────
speakBtn.addEventListener('click', () => {
  if (!lastResult) return;
  const utterance = new SpeechSynthesisUtterance(lastResult);
  utterance.lang = 'en-US';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
});

// ─── 5. TEXT INPUT ──────────────────────────────────────────
sendBtn.addEventListener('click', () => {
  if (textInput.value.trim()) processCommand(textInput.value);
});

textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') processCommand(textInput.value);
});

// ─── 6. HISTORY ─────────────────────────────────────────────
function saveHistory(entry) {
  const time = new Date().toLocaleTimeString();
  const stored = JSON.parse(localStorage.getItem('mathHistory') || '[]');
  stored.unshift({ entry, time });
  if (stored.length > 50) stored.pop();        // Max 50 entries
  localStorage.setItem('mathHistory', JSON.stringify(stored));
  renderHistory(stored);
}

function renderHistory(stored) {
  historyList.innerHTML = '';
  stored.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `🕐 ${item.time}  →  ${item.entry}`;
    historyList.appendChild(li);
  });
}

clearBtn.addEventListener('click', () => {
  localStorage.removeItem('mathHistory');
  historyList.innerHTML = '';
});

// Load history on page load
renderHistory(JSON.parse(localStorage.getItem('mathHistory') || '[]'));
