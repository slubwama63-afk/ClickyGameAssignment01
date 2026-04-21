let score = 0;
let timeLeft = 60;
let gameStarted = false;
let gameEnded = false;
let timerId = null;

const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const clickButton = document.getElementById("clickButton");
const resetButton = document.getElementById("resetButton");
const submitButton = document.getElementById("submitButton");
const nameInput = document.getElementById("nameInput");
const message = document.getElementById("message");
const finalScore = document.getElementById("finalScore");
const scoreboardList = document.getElementById("scoreboardList");

// Replace these with your teacher's real URLs
const POST_URL = "https://hooks.zapier.com/hooks/catch/8338993/ujs9jj9/";
const GET_URL = "https://script.google.com/macros/s/AKfycbys5aEPMvNCutyhNYYCcQcCjzsi2UtqNspmKyCH-AicJxJbCJMrAoT0LUaYaXhTWA8n/exec";

function updateUI() {
  scoreDisplay.innerText = score;
  timerDisplay.innerText = timeLeft;
}

function startGame() {
  if (gameStarted || gameEnded) {
    return;
  }

  gameStarted = true;
  message.innerText = "Game started! Click as fast as you can.";
  timerId = setInterval(countdown, 1000);
}

function countdown() {
  timeLeft--;

  if (timeLeft <= 0) {
    timeLeft = 0;
    updateUI();
    endGame();
    return;
  }

  updateUI();
}

function increaseScore() {
  if (gameEnded) {
    return;
  }

  if (!gameStarted) {
    startGame();
  }

  score++;
  updateUI();
}

function endGame() {
  clearInterval(timerId);
  gameEnded = true;
  clickButton.disabled = true;
  submitButton.disabled = false;
  finalScore.innerText = `Final score: ${score}`;
  message.innerText = "Game over! Enter your name and submit your score.";
}

function resetGame() {
  clearInterval(timerId);
  score = 0;
  timeLeft = 60;
  gameStarted = false;
  gameEnded = false;
  timerId = null;

  clickButton.disabled = false;
  submitButton.disabled = true;
  nameInput.value = "";
  finalScore.innerText = "Final score: -";
  message.innerText = "Click the button to start the game. You have 60 seconds.";
  updateUI();
}

async function submitScore() {
  const name = nameInput.value.trim();

  if (!gameEnded) {
    message.innerText = "You can only submit your score after the game ends.";
    return;
  }

  if (!name) {
    message.innerText = "Please enter your name before submitting.";
    return;
  }

  if (POST_URL === "PASTE_YOUR_POST_URL_HERE") {
    message.innerText = "Add your real POST_URL in the code before testing submit.";
    return;
  }

  submitButton.disabled = true;
  message.innerText = "Saving your score...";

  try {
    const response = await fetch(POST_URL, {
      method: "POST",
      body: JSON.stringify({
        name: name,
        score: score
      })
    });

    if (!response.ok) {
      throw new Error("Failed to save score.");
    }

    message.innerText = "Score saved successfully!";
    await loadScoreboard();
  } catch (error) {
    message.innerText = "Could not save score. Please try again.";
    submitButton.disabled = false;
  }
}

async function loadScoreboard() {
  if (GET_URL === "PASTE_YOUR_GET_URL_HERE") {
    scoreboardList.innerHTML = "<li>Add your real GET_URL to load the scoreboard.</li>";
    return;
  }

  try {
    const response = await fetch(GET_URL);

    if (!response.ok) {
      throw new Error("Failed to load scoreboard.");
    }

    const data = await response.json();
    const cleanedData = Array.isArray(data) ? data : [];

    cleanedData.sort((a, b) => Number(b.score) - Number(a.score));
    renderScoreboard(cleanedData.slice(0, 10));
  } catch (error) {
    scoreboardList.innerHTML = "<li>Could not load scoreboard.</li>";
  }
}

function renderScoreboard(players) {
  scoreboardList.innerHTML = "";

  if (players.length === 0) {
    scoreboardList.innerHTML = "<li>No scores yet.</li>";
    return;
  }

  players.forEach((player, index) => {
    const li = document.createElement("li");

    const safeName = player.name ? player.name : "Unknown";
    const safeScore = player.score ? player.score : 0;

    li.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <span class="player-name">${safeName}</span>
      <span class="player-score">${safeScore}</span>
    `;

    scoreboardList.appendChild(li);
  });
}

clickButton.addEventListener("click", increaseScore);
resetButton.addEventListener("click", resetGame);
submitButton.addEventListener("click", submitScore);

updateUI();
loadScoreboard();
