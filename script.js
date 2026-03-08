const hud = document.getElementById("hud");
const storyScene = document.getElementById("storyScene");
const cockpitScene = document.getElementById("cockpitScene");
const monitorOverlay = document.getElementById("monitorOverlay");

const speakerEl = document.getElementById("speaker");
const textEl = document.getElementById("dialogueText");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const waterBar = document.getElementById("waterBar");
const fuelBar = document.getElementById("fuelBar");
const waterValue = document.getElementById("waterValue");
const fuelValue = document.getElementById("fuelValue");
const timeValue = document.getElementById("timeValue");
const scoreValue = document.getElementById("scoreValue");

const missionButtons = document.getElementById("missionButtons");
const btnChase = document.getElementById("btnChase");
const btnLead = document.getElementById("btnLead");
const btnDeploy = document.getElementById("btnDeploy");
const btnReturn = document.getElementById("btnReturn");

const ship = document.getElementById("ship");
const comet = document.getElementById("comet");
const statusToast = document.getElementById("statusToast");

let sceneIndex = 0;
let missionStarted = false;
let timer = 90;
let fuel = 100;
let waterCon = 3;
let score = 0;
let missionInterval = null;
let choiceMade = null;
let deployed = false;
let returned = false;

const scenes = [
  {
    type: "story",
    speaker: "Orion",
    text: "Students of Earth. I am Orion. I am selecting captains for Mission Water One.",
    monitor: "Incoming transmission from Orion"
  },
  {
    type: "story",
    speaker: "Orion",
    text: "No current pilots. No military personnel. No one over twenty-five. To apply, answer three questions of physics. Correct answers matter. Speed matters more.",
    monitor: "Captain recruitment now open"
  },
  {
    type: "question",
    speaker: "Orion",
    text: "If a hammer and a feather are dropped at the same time where there is no air, which one hits first?",
    monitor: "Question 1 of 3",
    choices: [
      { text: "Hammer", correct: false, feedbackSpeaker: "Roommate", feedback: "That was my first thought too." },
      { text: "Feather", correct: false, feedbackSpeaker: "Roommate", feedback: "No, that doesn't feel right." },
      { text: "Same time", correct: true, feedbackSpeaker: "Haley", feedback: "Without air resistance, they fall together." }
    ]
  },
  {
    type: "question",
    speaker: "Orion",
    text: "You are floating in space. You push a toolbox away from you. What happens to you?",
    monitor: "Question 2 of 3",
    choices: [
      { text: "Nothing", correct: false, feedbackSpeaker: "Roommate", feedback: "If nothing happened, rockets wouldn't work." },
      { text: "You move backward", correct: true, feedbackSpeaker: "Haley", feedback: "Push one way, move the other way." },
      { text: "You move forward", correct: false, feedbackSpeaker: "Roommate", feedback: "That would be backwards." }
    ]
  },
  {
    type: "question",
    speaker: "Orion",
    text: "Two identical metal plates sit in sunlight. One is black. One is white. Which gets hotter first?",
    monitor: "Question 3 of 3",
    choices: [
      { text: "Black plate", correct: true, feedbackSpeaker: "Haley", feedback: "Dark surfaces absorb more energy." },
      { text: "White plate", correct: false, feedbackSpeaker: "Roommate", feedback: "White reflects more light." },
      { text: "They heat the same", correct: false, feedbackSpeaker: "Roommate", feedback: "Same metal, different color, different heat." }
    ]
  },
  {
    type: "story",
    speaker: "Orion",
    text: "Fastest correct respondent: Haley. Ship One is yours. Captain Wren and Captain Voss are also assigned.",
    monitor: "Ship One assigned to Haley"
  },
  {
    type: "story",
    speaker: "Orion",
    text: "Your mission is simple. Reach the comet. Deploy the miners. Return water to Earth. WaterCon is now three. Launch immediately.",
    monitor: "Mission Water One: Launch briefing"
  },
  {
    type: "missionIntro",
    speaker: "Mission Control",
    text: "Mission screen active. Voss will chase. Haley and Wren must lead. Make the better captain choice."
  }
];

function updateHUD() {
  waterValue.textContent = waterCon;
  fuelValue.textContent = fuel;
  timeValue.textContent = timer;
  scoreValue.textContent = score;

  waterBar.style.width = `${(waterCon / 5) * 100}%`;
  fuelBar.style.width = `${fuel}%`;

  if (waterCon >= 3) waterBar.style.background = "#39aa55";
  else if (waterCon === 2) waterBar.style.background = "#d39a2a";
  else waterBar.style.background = "#d44646";

  if (fuel > 60) fuelBar.style.background = "#f3c744";
  else if (fuel > 25) fuelBar.style.background = "#e08c2b";
  else fuelBar.style.background = "#d44646";
}

function showStory() {
  storyScene.classList.add("active");
  cockpitScene.classList.remove("active");
  hud.classList.add("hidden");
  missionButtons.classList.add("hidden");
  statusToast.classList.add("hidden");
}

function showCockpit() {
  storyScene.classList.remove("active");
  cockpitScene.classList.add("active");
  hud.classList.remove("hidden");
  missionButtons.classList.remove("hidden");
}

function loadScene() {
  choicesEl.innerHTML = "";
  restartBtn.classList.add("hidden");
  nextBtn.classList.remove("hidden");

  const scene = scenes[sceneIndex];
  if (!scene) return;

  if (scene.type === "story") {
    showStory();
    monitorOverlay.textContent = scene.monitor || "";
    speakerEl.textContent = scene.speaker;
    textEl.textContent = scene.text;
  }

  if (scene.type === "question") {
    showStory();
    monitorOverlay.textContent = scene.monitor || "";
    speakerEl.textContent = scene.speaker;
    textEl.textContent = scene.text;
    nextBtn.classList.add("hidden");

    scene.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice.text;
      btn.onclick = () => handleChoice(choice);
      choicesEl.appendChild(btn);
    });
  }

  if (scene.type === "missionIntro") {
    beginMission(scene);
  }
}

function handleChoice(choice) {
  choicesEl.innerHTML = "";
  speakerEl.textContent = choice.feedbackSpeaker;
  textEl.textContent = choice.feedback;
  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {
  sceneIndex++;
  loadScene();
});

function beginMission(scene) {
  showCockpit();
  speakerEl.textContent = scene.speaker;
  textEl.textContent = scene.text;
  missionStarted = true;
  updateHUD();
  startTimer();
}

function startTimer() {
  clearInterval(missionInterval);
  missionInterval = setInterval(() => {
    if (!missionStarted || returned) return;

    timer--;
    if (timer === 65) waterCon = 2;
    if (timer === 35) waterCon = 1;

    if (timer <= 0) {
      timer = 0;
      failMission("Time ran out. Earth remained in crisis.");
    }

    updateHUD();
  }, 1000);
}

function showToast(message) {
  statusToast.textContent = message;
  statusToast.classList.remove("hidden");
}

btnChase.addEventListener("click", () => {
  if (!missionStarted || returned) return;
  choiceMade = "chase";
  fuel = Math.max(0, fuel - 28);
  ship.style.left = "66%";
  ship.style.bottom = "54%";
  comet.style.left = "22%";
  comet.style.top = "26%";
  speakerEl.textContent = "Mission Control";
  textEl.textContent = "Chasing burns fuel fast. Voss likes this move.";
  showToast("High fuel burn detected");
  updateHUD();

  if (fuel <= 0) failMission("You exhausted your fuel by chasing the comet.");
});

btnLead.addEventListener("click", () => {
  if (!missionStarted || returned) return;
  choiceMade = "lead";
  fuel = Math.max(0, fuel - 12);
  ship.style.left = "56%";
  ship.style.bottom = "46%";
  comet.style.left = "18%";
  comet.style.top = "24%";
  speakerEl.textContent = "Haley";
  textEl.textContent = "Lead the comet. Meet it where it will be.";
  showToast("Efficient intercept path selected");
  updateHUD();
});

btnDeploy.addEventListener("click", () => {
  if (!missionStarted || returned) return;

  if (!choiceMade) {
    speakerEl.textContent = "Mission Control";
    textEl.textContent = "Choose CHASE or LEAD before deploying.";
    return;
  }

  if (choiceMade === "chase") {
    deployed = true;
    fuel = Math.max(0, fuel - 18);
    score += 100;
    speakerEl.textContent = "Mission Control";
    textEl.textContent = "Deployment successful, but fuel reserves are poor.";
    showToast("Water secured");
  } else {
    deployed = true;
    fuel = Math.max(0, fuel - 8);
    score += 100;
    speakerEl.textContent = "Mission Control";
    textEl.textContent = "Deployment successful. Return window remains stable.";
    showToast("Water secured");
  }

  updateHUD();

  if (fuel <= 0) failMission("You secured water, but became gravity-well bound.");
});

btnReturn.addEventListener("click", () => {
  if (!missionStarted || returned) return;

  if (!deployed) {
    speakerEl.textContent = "Mission Control";
    textEl.textContent = "Deploy the miners first.";
    return;
  }

  returned = true;
  clearInterval(missionInterval);

  fuel = Math.max(0, fuel - 16);
  ship.style.left = "24%";
  ship.style.bottom = "30%";
  updateHUD();

  if (choiceMade === "chase") {
    waterCon = Math.max(waterCon, 2);
    score += 100;
    speakerEl.textContent = "Orion";
    textEl.textContent =
      "Captain Voss returned first and received the glory. But he did not meet the operational metrics required of a captain.";
  } else {
    waterCon = Math.max(waterCon, 3);
    score += 200;
    speakerEl.textContent = "Orion";
    textEl.textContent =
      "Haley and Wren met the captain metrics. Water delivered. Prepare for the next adventure: Mars.";
  }

  updateHUD();
  restartBtn.classList.remove("hidden");
  nextBtn.classList.add("hidden");
  missionButtons.classList.add("hidden");
  showToast("Mission complete");
});

function failMission(message) {
  missionStarted = false;
  returned = true;
  clearInterval(missionInterval);
  speakerEl.textContent = "Orion";
  textEl.textContent = message;
  restartBtn.classList.remove("hidden");
  nextBtn.classList.add("hidden");
  missionButtons.classList.add("hidden");
}

restartBtn.addEventListener("click", () => {
  sceneIndex = 0;
  timer = 90;
  fuel = 100;
  waterCon = 3;
  score = 0;
  missionStarted = false;
  choiceMade = null;
  deployed = false;
  returned = false;

  ship.style.left = "22%";
  ship.style.bottom = "28%";
  comet.style.left = "14%";
  comet.style.top = "22%";

  updateHUD();
  loadScene();
});

updateHUD();
loadScene();
