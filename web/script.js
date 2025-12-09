const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreTEl = document.getElementById("scoreT");
const modeEl = document.getElementById("mode");
const themeBtn = document.getElementById("themeBtn");

let state = Array(9).fill(null);
let current = "X";
let winner = null;
let moveHistory = [];
let scores = { X:0, O:0, T:0 };

function renderBoard() {
  boardEl.innerHTML = "";
  state.forEach((val,i)=>{
    const c = document.createElement("button");
    c.className = "cell";
    c.dataset.index = i;
    if (val) c.classList.add(val.toLowerCase());
    c.textContent = val || "";
    c.onclick = () => playerMove(i);
    boardEl.appendChild(c);
  });
}

function playerMove(i) {
  if (state[i] || winner) return;
  move(i);
  if (winner) return;
  if (modeEl.value !== "pvp" && current === "O") setTimeout(cpuMove, 300);
}

function move(i) {
  state[i] = current;
  moveHistory.push(i);
  checkWinner();
  if (!winner) current = current === "X" ? "O" : "X";
  updateUI();
}

function cpuMove() {
  const empty = state.map((v,i)=>v?null:i).filter(v=>v!==null);
  let choice;
  if (modeEl.value === "easy") {
    choice = empty[Math.floor(Math.random()*empty.length)];
  } else {
    choice = bestMoveAI();
  }
  move(choice);
}

const L = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner() {
  for (const [a,b,c] of L) {
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      winner = state[a];
      scores[winner]++;
      saveScores();
      return;
    }
  }
  if (state.every(Boolean)) { winner = "T"; scores.T++; saveScores(); }
}

function bestMoveAI() {
  return minimax(state, "O").index;
}

function minimax(board, player) {
  const empty = board.map((v,i)=>v?null:i).filter(v=>v!==null);
  if (checkStatic(board,"X")) return {score:-10};
  if (checkStatic(board,"O")) return {score:10};
  if (!empty.length) return {score:0};

  const result = [];
  for (const spot of empty) {
    const newBoard = [...board];
    newBoard[spot] = player;
    const score = minimax(newBoard, player==="O"?"X":"O").score;
    result.push({index:spot, score});
  }
  return player==="O"
    ? result.reduce((a,b)=>a.score>b.score?a:b)
    : result.reduce((a,b)=>a.score<b.score?a:b);
}

function checkStatic(board,p) {
  return L.some(([a,b,c])=>board[a]===p && board[b]===p && board[c]===p);
}

function updateUI() {
  renderBoard();
  if (!winner) statusEl.textContent = `Player ${current}'s turn`;
  else statusEl.textContent = winner === "T" ? "It's a tie!" : `Player ${winner} wins!`;
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreTEl.textContent = scores.T;
}

function reset(full=false) {
  state = Array(9).fill(null);
  winner = null;
  moveHistory = [];
  if (full) scores = {X:0,O:0,T:0};
  saveScores();
  updateUI();
}

document.getElementById("undoBtn").onclick = () => {
  if (!moveHistory.length || winner) return;
  let i = moveHistory.pop();
  state[i] = null;
  current = current === "X" ? "O" : "X";
  updateUI();
};

document.getElementById("newRound").onclick = () => reset(false);
document.getElementById("resetBtn").onclick = () => reset(true);

document.getElementById("startX").onclick = () => { current="X"; updateUI(); };
document.getElementById("startO").onclick = () => { current="O"; updateUI(); };
document.getElementById("startRandom").onclick = () => { current=Math.random()>0.5?"X":"O"; updateUI(); };

function saveScores(){ localStorage.setItem("ttt_scores",JSON.stringify(scores)); }
function loadScores(){
  const s = localStorage.getItem("ttt_scores");
  if (s) scores = JSON.parse(s);
}

function loadTheme(){
  const t = localStorage.getItem("theme");
  if (t === "light") document.documentElement.classList.add("light");
  themeBtn.textContent = document.documentElement.classList.contains("light") ? "☀️" : "🌙";
}

themeBtn.onclick = () => {
  document.documentElement.classList.toggle("light");
  localStorage.setItem("theme", document.documentElement.classList.contains("light") ? "light" : "dark");
  themeBtn.textContent = document.documentElement.classList.contains("light") ? "☀️" : "🌙";
};

loadTheme();
loadScores();
updateUI();
