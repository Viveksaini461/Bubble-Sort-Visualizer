(function(){
  'use strict';

  const gameId = 'tic_tac_toe';

  const boardEl = document.getElementById('board');
  const cells = Array.from(boardEl.querySelectorAll('.cell'));
  const modeEl = document.getElementById('mode');
  const aiSideWrap = document.getElementById('aiSideWrap');
  const aiSideEl = document.getElementById('aiSide');
  const restartBtn = document.getElementById('restart');
  const turnEl = document.getElementById('turn');
  const resultEl = document.getElementById('result');
  const winsEl = document.getElementById('wins');
  const lossesEl = document.getElementById('losses');
  const drawsEl = document.getElementById('draws');

  const playerNameEl = document.getElementById('playerName');
  const saveScoreBtn = document.getElementById('saveScore');

  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  let board = Array(9).fill('');
  let current = 'X';
  let isOver = false;
  let wins = 0, losses = 0, draws = 0;

  function setModeUi(){
    aiSideWrap.style.display = modeEl.value === 'ai' ? '' : 'none';
  }

  function reset(){
    board = Array(9).fill('');
    current = 'X';
    isOver = false;
    resultEl.textContent = 'In progress';
    turnEl.textContent = current;
    cells.forEach(function(c){ c.textContent=''; c.disabled=false; });
    if (modeEl.value === 'ai' && aiSideEl.value === 'O') {
      // AI starts as X if player chose O
      aiMove();
    }
  }

  function checkWinner(b){
    for (var i=0;i<WIN_LINES.length;i++){
      var line = WIN_LINES[i];
      var a=b[line[0]], c=b[line[1]], d=b[line[2]];
      if (a && a===c && a===d) return a;
    }
    if (b.every(Boolean)) return 'draw';
    return null;
  }

  function handleCellClick(e){
    const idx = Number(e.currentTarget.getAttribute('data-idx'));
    if (isOver || board[idx]) return;
    move(idx, current);
    const res = checkWinner(board);
    if (res) return end(res);
    if (modeEl.value === 'ai') {
      aiMove();
    }
  }

  function move(idx, side){
    board[idx] = side;
    cells[idx].textContent = side;
    cells[idx].disabled = true;
    current = side === 'X' ? 'O' : 'X';
    turnEl.textContent = current;
  }

  function end(res){
    isOver = true;
    cells.forEach(function(c){ c.disabled = true; });
    if (res === 'draw') {
      resultEl.textContent = 'Draw';
      draws++;
      drawsEl.textContent = String(draws);
    } else {
      resultEl.textContent = res + ' wins';
      // determine perspective for player in AI mode
      if (modeEl.value === 'ai') {
        const humanSide = aiSideEl.value === 'X' ? 'O' : 'X';
        if (res === humanSide) { wins++; winsEl.textContent = String(wins); }
        else { losses++; lossesEl.textContent = String(losses); }
      }
    }
  }

  function aiMove(){
    if (isOver) return;
    const aiSide = aiSideEl.value;
    const humanSide = aiSide === 'X' ? 'O' : 'X';
    const idx = bestMove(board.slice(), aiSide, humanSide);
    if (idx != null) {
      move(idx, aiSide);
      const res = checkWinner(board);
      if (res) end(res);
    }
  }

  function bestMove(b, ai, human){
    // If board empty and AI starts, pick a corner for speed
    if (b.every(v => !v)) return 0;
    let bestScore = -Infinity, moveIdx = null;
    for (let i=0;i<9;i++){
      if (!b[i]){
        b[i] = ai;
        const score = minimax(b, 0, false, ai, human);
        b[i] = '';
        if (score > bestScore){ bestScore = score; moveIdx = i; }
      }
    }
    return moveIdx;
  }

  function minimax(b, depth, isMax, ai, human){
    const res = checkWinner(b);
    if (res === ai) return 10 - depth;
    if (res === human) return depth - 10;
    if (res === 'draw') return 0;

    if (isMax){
      let best = -Infinity;
      for (let i=0;i<9;i++) if (!b[i]){
        b[i] = ai;
        best = Math.max(best, minimax(b, depth+1, false, ai, human));
        b[i] = '';
      }
      return best;
    } else {
      let best = Infinity;
      for (let i=0;i<9;i++) if (!b[i]){
        b[i] = human;
        best = Math.min(best, minimax(b, depth+1, true, ai, human));
        b[i] = '';
      }
      return best;
    }
  }

  function bind(){
    cells.forEach(function(c){ c.addEventListener('click', handleCellClick); });
    restartBtn.addEventListener('click', reset);
    modeEl.addEventListener('change', function(){ setModeUi(); reset(); });
    aiSideEl.addEventListener('change', function(){ reset(); });
    saveScoreBtn.addEventListener('click', function(){
      const totalScore = wins * 3 + draws; // win=3, draw=1
      PlayZoneUtils.saveScore(gameId, playerNameEl.value, totalScore);
      PlayZoneUtils.renderLeaderboard('#leaderboard', gameId, { unit: 'pts' });
    });
  }

  function init(){
    setModeUi();
    bind();
    PlayZoneUtils.renderLeaderboard('#leaderboard', gameId, { unit: 'pts' });
    reset();
  }

  document.addEventListener('DOMContentLoaded', init);
})();