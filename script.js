// Mapping: full state name -> USPS 2-letter code
const STATE_TO_ABBR = {
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA",
  "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD",
  "Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ",
  "New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
  "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"
};

const STATES = Object.keys(STATE_TO_ABBR);
let found = new Set();
let timeLeft = 600; // 10 minutes
let timerId = null;
let svgDoc = null;

const input = document.getElementById('state-input');
const startBtn = document.getElementById('start-btn');
const hintBtn = document.getElementById('hint-btn');
const timerEl = document.getElementById('timer');
const countEl = document.getElementById('count');
const foundListEl = document.getElementById('found-list');
const svgObject = document.getElementById('us-svg');

function normalize(s){ return s.trim().toLowerCase().replace(/\s+/g,' '); }

// Convert seconds to mm:ss
function formatTime(seconds){
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Load SVG
svgObject.addEventListener('load', ()=>{
  try{
    svgDoc = svgObject.contentDocument;
    STATES.forEach(name=>{
      const el = svgDoc.getElementById(STATE_TO_ABBR[name]);
      if(el) el.classList.add('state-default');
    });
  }catch(e){
    console.warn('Could not access SVG document (CORS?). If so, download the SVG locally.');
  }
});

function startGame(){
  // reset
  found.clear();
  foundListEl.innerHTML = '';
  timeLeft = 600;
  timerEl.textContent = formatTime(timeLeft);
  countEl.textContent = found.size;
  input.value = '';
  input.disabled = false;
  input.focus();

  // reset SVG
  if(svgDoc){
    STATES.forEach(name=>{
      const el = svgDoc.getElementById(STATE_TO_ABBR[name]);
      if(el) el.classList.remove('found');
    });
  }

  // clear previous timer
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

function markFound(stateName){
  const abbr = STATE_TO_ABBR[stateName];
  if(svgDoc){
    const el = svgDoc.getElementById(abbr);
    if(el) el.classList.add('found');
  }

  const item = document.createElement('div');
  item.className = 'found-item found';
  item.textContent = stateName;
  foundListEl.appendChild(item);
  updateCount();

  if(found.size === STATES.length){
    endGame(true);
  }
}

function endGame(won){
  input.disabled = true;
  if(timerId) clearInterval(timerId);
  setTimeout(()=>{
    alert(won ? 'Congratulations! You named all 50 states!' : `Time's up! You found ${found.size} states.`);
  }, 50);
}

// Submit state on Enter
input.addEventListener('keydown', e=>{
  if(e.key === 'Enter'){
    const value = input.value.trim();
    if(!value) return;
    const match = STATES.find(s => normalize(s) === normalize(value));
    if(match && !found.has(match)){
      found.add(match);
      markFound(match);
    }
    input.value = '';
  }
});

// Reveal random state
hintBtn.addEventListener('click', ()=>{
  const remaining = STATES.filter(s=>!found.has(s));
  if(remaining.length===0) return;
  const pick = remaining[Math.floor(Math.random()*remaining.length)];
  found.add(pick);
  markFound(pick);
});

// Start game only on button click
startBtn.addEventListener('click', startGame);

// On page load, just show timer and 0/50
window.addEventListener('load', ()=>{
  timerEl.textContent = formatTime(timeLeft);
  countEl.textContent = found.size;
  input.disabled = true; // disabled until Start Game
});
