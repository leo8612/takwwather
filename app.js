let total = parseInt(localStorage.getItem("total")) || 0;
let goal = parseInt(localStorage.getItem("goal")) || 1000;
let intervalTime = parseInt(localStorage.getItem("interval")) || 3600000;
let history = JSON.parse(localStorage.getItem("history")) || {};
let reminder;
let countdownInterval;
let nextTriggerTime;
let soundEnabled = localStorage.getItem("sound") !== "false";
let vibrationEnabled = localStorage.getItem("vibration") !== "false";

const status = document.getElementById("status");
const progressBar = document.getElementById("progress-bar");
const goalSelect = document.getElementById("goalSelect");
const intervalSelect = document.getElementById("intervalSelect");
const historyList = document.getElementById("history");
const countdownEl = document.getElementById("countdown");
const body = document.getElementById("body");
const soundToggle = document.getElementById("soundToggle");
const vibrationToggle = document.getElementById("vibrationToggle");

soundToggle.checked = soundEnabled;
vibrationToggle.checked = vibrationEnabled;

goalSelect.value = goal;
intervalSelect.value = intervalTime;

function updateUI() {
  status.innerText = `${total} ml / ${goal} ml`;
  progressBar.style.width = (total / goal) * 100 + "%";
}

function addWater(amount) {
  total += amount;
  if (total >= goal) {
    total = goal;
    notify("🎉 Meta alcanzada", "Completaste tu hidratación.");
  }
  localStorage.setItem("total", total);
  updateUI();
}

function resetDay() {
  const today = new Date().toLocaleDateString();
  history[today] = total;
  localStorage.setItem("history", JSON.stringify(history));

  total = 0;
  localStorage.setItem("total", total);
  updateUI();
  renderHistory();
}

function changeGoal() {
  goal = parseInt(goalSelect.value);
  localStorage.setItem("goal", goal);
  updateUI();
}

function changeInterval() {
  intervalTime = parseInt(intervalSelect.value);
  localStorage.setItem("interval", intervalTime);
  startReminder();
}

function startReminder() {
  if (reminder) clearInterval(reminder);
  if (countdownInterval) clearInterval(countdownInterval);

  nextTriggerTime = Date.now() + intervalTime;

  reminder = setInterval(() => {
    if (total < goal) {
      notify("💧 Hora de hidratarte", "Toma un poco de agua.");
    }
    nextTriggerTime = Date.now() + intervalTime;
  }, intervalTime);

  startCountdown();
}

function startCountdown() {
  countdownInterval = setInterval(() => {
    let remaining = nextTriggerTime - Date.now();

    if (remaining < 0) remaining = 0;

    let minutes = Math.floor(remaining / 60000);
    let seconds = Math.floor((remaining % 60000) / 1000);

    countdownEl.innerText =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
}

function notify(title, bodyText) {

  // 🔔 Notificación visual
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body: bodyText });
  }

  // 🔊 Voz (Text To Speech)
  if (soundEnabled && "speechSynthesis" in window) {

        const firstPart = new SpeechSynthesisUtterance("Hello!, it's time.");
        firstPart.lang = "en-US";
        firstPart.rate = 0.90;
        firstPart.pitch = 1.1;

        const secondPart = new SpeechSynthesisUtterance("Toma un poco de agua.");
        secondPart.lang = "en-Us";
        secondPart.rate = 0.90;
        secondPart.pitch = 1.1;

        // Cuando termine la primera frase
        firstPart.onend = () => {
            setTimeout(() => {
            speechSynthesis.speak(secondPart);
            }, 100); // pausa real
        };

        speechSynthesis.cancel(); // limpia cola anterior
        speechSynthesis.speak(firstPart);
    }

  // 📳 Vibración
    navigator.vibrate([
        1000, 300,
        1000, 300,
        1000, 300,
        1000
    ]);
}

function renderHistory() {
  historyList.innerHTML = "";
  for (let date in history) {
    let li = document.createElement("li");
    li.textContent = `${date}: ${history[date]} ml`;
    historyList.appendChild(li);
  }
}

function toggleDarkMode() {
  body.classList.toggle("dark");
  localStorage.setItem("dark", body.classList.contains("dark"));
}

function toggleSound() {
  soundEnabled = soundToggle.checked;
  localStorage.setItem("sound", soundEnabled);
}

function toggleVibration() {
  vibrationEnabled = vibrationToggle.checked;
  localStorage.setItem("vibration", vibrationEnabled);
}

if (localStorage.getItem("dark") === "true") {
  body.classList.add("dark");
}

updateUI();
renderHistory();
startReminder();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
