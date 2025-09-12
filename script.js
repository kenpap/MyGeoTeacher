// Mapping: full state name (English) -> USPS 2-letter code used as SVG IDs in the Commons file
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
let svgDoc = null; // will hold the inline SVG document

const input = document.getElementById('state-input');
const startBtn = document.getElementById('start-btn');
const hintBtn = document.getElementById('hint-btn');
const timerEl = document.getElementById('timer');
const countEl = document.getElementById('count');
const foundListEl = document.getElementById('found-list');
const svgObject = document.getElementById('us-svg');

function normalize(s){ return s.trim().toLowerCase().replace(/\s+/g,' '); }

// Wait until the object SVG loads, then keep reference to its document.
svgObject.addEventListener('load', ()=>{
  try{
    svgDoc = svgObject.contentDocument;
    // Ensure default styling for all states in the SVG: add a common class if present
    STATES.forEach(name=>{
      const abbr = STATE_TO_ABBR[name];
      const el = svgDoc.getElementById(abbr);
      if(el) el.classList.add('state-default');
    });
  }catch(e){
    console.warn('Could not access SVG document (CORS?). If so, download the SVG into your repo and load it locally.');
  }
});

function startGame(){
  // reset
  found.clear();
  foundListEl.innerHTML = '';
  updateCount();
  timeLeft = 600;
  timerEl.textContent = timeLeft;
  input.value = '';
  input.disabled = false;
  input.focus();
  // clear fills in svg (if available)
  if(svgDoc){
    STATES.forEach(name=>{
      const el = svgDoc.getElementById(STATE_TO_ABBR[name]);
      if(el) el.classList.remove('found');
    });
  }
  if(timerId) clearInterval(timerId);
  timerId = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = timeLeft;
    if(timeLeft <= 0){
      clearInterval(timerId);
      endGame(false);
    }
  },1000);
}

function updateCount(){
  countEl.textContent = found.size;
}

function markFound(stateName){
  const abbr = STATE_TO_ABBR[stateName];
  // Mark on SVG if possible
  if(svgDoc){
    const el = svgDoc.getElementById(abbr);
    if(el) el.classList.add('found');
  }
  // Add to found list UI
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
  if(won){
    setTimeout(()=> alert('Congratulations! You named all 50 states!'),50);
  }else{
    setTimeout(()=> alert(`Time's up! You found ${found.size} states.`),50);
  }
}

// Listener for submitting a state (Enter key)
input.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    const value = input.value.trim();
    if(!value) return;
    // Try to find a matching state (case-insensitive, allow extra spaces)
    const match = STATES.find(s => normalize(s) === normalize(value));
    if(match){
      if(!found.has(match)){
        found.add(match);
        markFound(match);
      }
      input.value = '';
    }else{
      // not a valid state; give a gentle feedback
      input.animate([{background:'#fff8f0'},{background:'#fff'}],{duration:300});
    }
  }
});

// Reveal a random not-yet-found state (hint)
hintBtn.addEventListener('click', ()=>{
  const remaining = STATES.filter(s=>!found.has(s));
  if(remaining.length===0) return;
  const pick = remaining[Math.floor(Math.random()*remaining.length)];
  found.add(pick);
  markFound(pick);
});

startBtn.addEventListener('click', startGame);

// Start the game automatically on page load
window.addEventListener('load', ()=>{
  setTimeout(()=>{ input.focus(); },300);
  startGame();
});
