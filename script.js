const sceneEl = document.getElementById("scene");
const speakerEl = document.getElementById("speaker");
const dialogueEl = document.getElementById("dialogue");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");

const waterConEl = document.getElementById("waterCon");
const fuelEl = document.getElementById("fuel");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");

let currentStep = 0;
let waterCon = 3;
let fuel = 100;
let score = 0;
let timer = 90;
let missionTimer = null;
let routeChoice = null;
let deployed = false;

const story = [
  {
    bg: "schooldesk.png",
    speaker: "Orion",
    dialogue: "Students of Earth. I am Orion. I am selecting captains for Mission Water One.",
    monitor: "Incoming transmission from Orion"
  },
  {
    bg: "schooldesk.png",
    speaker: "Orion",
    dialogue: "No current pilots. No military personnel. No one over twenty-five. Answer three physics questions. Correct answers matter. Speed matters more.",
    monitor: "Captain selection diagnostics"
  },
  {
    bg: "schooldesk.png",
    speaker: "Orion",
    dialogue: "If a hammer and a feather are dropped at the same time where there is no air, which hits first?",
    monitor: "Question 1 of 3",
    choices: [
      { text: "Hammer", nextSpeaker: "Roommate", nextDialogue: "No. Without air resistance that is not correct." },
      { text: "Feather", nextSpeaker: "Roommate", nextDialogue: "No. That is not correct either." },
      { text: "Same time", nextSpeaker: "Haley", nextDialogue: "Without air resistance, they fall together." }
    ]
  },
  {
    bg: "schooldesk.png",
    speaker: "Orion",
    dialogue: "You are floating in space. You push a toolbox away from you. What happens to you?",
    monitor: "Question 2 of 3",
    choices: [
      { text: "Nothing", nextSpeaker: "Roommate", nextDialogue: "No. Momentum has to go somewhere." },
      { text: "You move backward", nextSpeaker: "Haley", nextDialogue: "Push one way, move the other." },
      { text: "You move forward", nextSpeaker: "Roommate", nextDialogue: "No. Wrong direction." }
    ]
  },
  {
    bg: "schooldesk.png",
    speaker: "Orion",
    dialogue: "Two metal plates sit in sunlight. One is black and one is white. Which heats faster?",
    monitor: "Question 3 of 3",
    choices: [
      { text: "Black plate", nextSpeaker: "Haley", nextDialogue: "Dark surfaces absorb more energy." },
      { text: "White plate", nextSpeaker: "Roommate", nextDialogue: "No. White reflects more." },
      { text: "They heat the same", nextSpeaker: "Roommate", nextDialogue: "No. Color matters here." }
    ]
  },
  {
    bg: "schooldesk.png",
    speaker: "Orion",
    dialogue: "Fastest correct respondent: Haley. Ship One is yours. Captain Wren and Captain Voss are also assigned.",
    monitor: "Ship One assigned to Haley"
  },
  {
    bg: "cockpit.png",
    speaker: "Orion",
    dialogue: "Mission briefing. Reach the comet, secure water, and return to Earth. WaterCon is now at level three.",
    mission: true
  }
];

function updateHud() {
  waterConEl.textContent = waterCon;
  fuelEl.textContent = fuel;
  scoreEl.textContent = score;
  timerEl.textContent = timer;
}

function renderStep() {
  const step = story[currentStep];
  sceneEl.innerHTML = "";
  sceneEl.style.backgroundImage = `url('${step.bg}')`;

  speakerEl.textContent = step.speaker;
  dialogueEl.textContent = step.dialogue;
  choicesEl.innerHTML = "";

  if (step.monitor) {
    const monitor = document.createElement("div");
    monitor.className = "monitor-box";
    monitor.textContent = step.monitor;
    sceneEl.appendChild(monitor);
  }

  if (step.choices) {
    nextBtn.style.display = "none";
    step.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice.text;
      btn.onclick = () => {
        speakerEl.textContent = choice.nextSpeaker;
        dialogueEl.textContent = choice.nextDialogue;
        score += 10;
        updateHud();
        choicesEl.innerHTML = "";
        nextBtn.style.display = "inline-block";
      };
      choicesEl.appendChild(btn);
    });
  } else if (step.mission) {
    nextBtn.style.display = "none";
    renderMissionButtons();
    startMissionTimer();
  } else {
    nextBtn.style.display = "inline-block";
  }
}

function renderMissionButtons() {
  const buttonWrap = document.createElement("div");
  buttonWrap.className = "mission-buttons";

  const chaseBtn = document.createElement("button");
  chaseBtn.className = "mission-btn";
  chaseBtn.textContent = "CHASE";
  chaseBtn.onclick = () => {
    routeChoice = "chase";
    fuel -= 30;
    score -= 5;
    speakerEl.textContent = "Mission Control";
    dialogueEl.textContent = "Voss chooses to chase directly. Fuel burn is high.";
    updateHud();
  };

  const leadBtn = document.createElement("button");
  leadBtn.className = "mission-btn";
  leadBtn.textContent = "LEAD";
  leadBtn.onclick = () => {
    routeChoice = "lead";
    fuel -= 10;
    score += 15;
    speakerEl.textContent = "Haley";
    dialogueEl.textContent = "Lead the comet. Meet it where it will be.";
    updateHud();
  };

  const deployBtn = document.createElement("button");
  deployBtn.className = "mission-btn";
  deployBtn.textContent = "DEPLOY";
  deployBtn.onclick = () => {
    if (!routeChoice) {
      speakerEl.textContent = "Mission Control";
      dialogueEl.textContent = "Choose CHASE or LEAD first.";
      return;
    }
    deployed = true;
    score += 20;
    speakerEl.textContent = "Mission Control";
    dialogueEl.textContent = "Water secured. Prepare to return.";
    updateHud();
  };

  const returnBtn = document.createElement("button");
  returnBtn.className = "mission-btn";
  returnBtn.textContent = "RETURN";
  returnBtn.onclick = () => {
    if (!deployed) {
      speakerEl.textContent = "Mission Control";
      dialogueEl.textContent = "You need to deploy first.";
      return;
    }
    clearInterval(missionTimer);
    finishMission();
  };

  buttonWrap.appendChild(chaseBtn);
  buttonWrap.appendChild(leadBtn);
  buttonWrap.appendChild(deployBtn);
  buttonWrap.appendChild(returnBtn);
  sceneEl.appendChild(buttonWrap);
}

function startMissionTimer() {
  clearInterval(missionTimer);
  missionTimer = setInterval(() => {
    timer -= 1;
    if (timer === 60) waterCon = 2;
    if (timer === 30) waterCon = 1;
    updateHud();
    if (timer <= 0) {
      clearInterval(missionTimer);
      speakerEl.textContent = "Orion";
      dialogueEl.textContent = "Mission failed. Time ran out.";
      sceneEl.innerHTML = "";
    }
  }, 1000);
}

function finishMission() {
  sceneEl.innerHTML = "";
  sceneEl.style.backgroundImage = `url('cockpit.png')`;

  if (routeChoice === "chase") {
    speakerEl.textContent = "Orion";
    dialogueEl.textContent = "Captain Voss returned first and got the glory, but did not meet the operational metrics required of a captain.";
    score += 10;
  } else {
    speakerEl.textContent = "Orion";
    dialogueEl.textContent = "Haley and Wren met the captain metrics. Water delivered. Prepare for the next mission: Mars.";
    score += 50;
    waterCon = 3;
  }

  updateHud();
  nextBtn.style.display = "none";
}

nextBtn.addEventListener("click", () => {
  currentStep += 1;
  if (currentStep < story.length) {
    renderStep();
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(missionTimer);
  currentStep = 0;
  waterCon = 3;
  fuel = 100;
  score = 0;
  timer = 90;
  routeChoice = null;
  deployed = false;
  updateHud();
  renderStep();
});

updateHud();
renderStep();
