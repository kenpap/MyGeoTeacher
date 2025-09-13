// ====== Level Data ======
const LEVELS = {
  us: {
    title: "Geography Quiz",
    info: "Level: <strong>All of the United States</strong> — you have <strong>10 minutes</strong> to name all 50 states (in English).",
    map: "us-states.svg",
    time: 600,
    answers: {
      "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA",
      "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD",
      "Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ",
      "New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
      "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"
    }
  },
   eu: {
    title: "Geography Quiz — All of the European Countries",
    info: "Level: <strong>All of the European Countries</strong> — you have <strong>5 minutes</strong> to name all countries (in English).",
    map: "europe.svg",
    time: 300,
    answers: EUROPE_COUNTRIES
  }
};

// ====== State ======
let currentLevel = null;
let ANSWERS = {};
let ITEMS = [];
let found = new Set();
let timeLeft = 600;
let timerId = null;
let svgDoc = null;

// ====== DOM Elements ======
const menuSection = document.getElementById('menu');
const gameSection = document.getElementById('game');
const levelTitle = document.getElementById('level-title');
const levelInfo = document.getElementById('level-info');
const totalEl = document.getElementById('total');
const input = document.getElementById('state-input');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const hintBtn = document.getElementById('hint-btn');
const timerEl = document.getElementById('timer');
const countEl = document.getElementById('count');
const foundListEl = document.getElementById('found-list');
const svgObject = document.getElementById('map-svg');

// ====== Helpers ======
function normalize(s){ return s.trim().toLowerCase().replace(/\s+/g,' '); }
function formatTime(seconds){
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ====== Load Level ======
function loadLevel(levelKey){
  currentLevel = LEVELS[levelKey];
  if(!currentLevel) return;

  // update UI
  levelTitle.textContent = currentLevel.title;
  levelInfo.innerHTML = currentLevel.info;
  ANSWERS = currentLevel.answers;
  ITEMS = Object.keys(ANSWERS);
  totalEl.textContent = ITEMS.length;

  // load map
  svgObject.data = currentLevel.map;
  svgObject.addEventListener('load', ()=>{
    try{
      svgDoc = svgObject.contentDocument;
      ITEMS.forEach(name=>{
        const el = svgDoc.getElementById(ANSWERS[name]);
        if(el) el.classList.add('state-default');
      });
    }catch(e){
      console.warn("Could not access SVG document.");
    }
  });

  // switch sections
  menuSection.classList.add('hidden');
  gameSection.classList.remove('hidden');
}

// ====== Start / Restart Game ======
function startGame(){
  found.clear();
  foundListEl.innerHTML = '';
  timeLeft = currentLevel.time;
  timerEl.textContent = formatTime(timeLeft);
  countEl.textContent = found.size;
  input.value = '';
  input.disabled = false;
  input.focus();

  if(svgDoc){
    ITEMS.forEach(name=>{
      const el = svgDoc.getElementById(ANSWERS[name]);
      if(el) el.classList.remove('found');
    });
  }

  if(timerId) clearInterval(timerId);
  timerId = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = formatTime(timeLeft);
    if(timeLeft <= 0){
      clearInterval(timerId);
      endGame(false);
    }
  }, 1000);
}

function updateCount(){ countEl.textContent = found.size; }

function markFound(name){
  const abbr = ANSWERS[name];
  if(svgDoc){
    const el = svgDoc.getElementById(abbr);
    if(el) el.classList.add('found');
  }

  const item = document.createElement('div');
  item.className = 'found-item found';
  item.textContent = name;
  foundListEl.appendChild(item);
  updateCount();

  if(found.size === ITEMS.length){
    endGame(true);
  }
}

function endGame(won){
  input.disabled = true;
  if(timerId) clearInterval(timerId);
  setTimeout(()=>{
    alert(won 
      ? `Congratulations! You named all ${ITEMS.length}!` 
      : `Time's up! You found ${found.size} out of ${ITEMS.length}.`);
  }, 50);
}

// ====== Input Handling ======
input.addEventListener('keydown', e=>{
  if(e.key === 'Enter'){
    const value = input.value.trim();
    if(!value) return;
    const match = ITEMS.find(s => normalize(s) === normalize(value));
    if(match && !found.has(match)){
      found.add(match);
      markFound(match);
    }
    input.value = '';
  }
});

// ====== Reveal Random ======
hintBtn.addEventListener('click', ()=>{
  const remaining = ITEMS.filter(s=>!found.has(s));
  if(remaining.length===0) return;
  const pick = remaining[Math.floor(Math.random()*remaining.length)];
  found.add(pick);
  markFound(pick);
});

// ====== Button Events ======
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// ====== Level Menu Events ======
document.querySelectorAll('.level-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const level = btn.dataset.level;
    loadLevel(level);
  });
});

// ====== Page Load Setup ======
window.addEventListener('load', ()=>{
  timerEl.textContent = formatTime(timeLeft);
  countEl.textContent = found.size;
  input.disabled = true;
});
