(function(){
  'use strict';

  const gameId = 'snake';

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('start');
  const restartBtn = document.getElementById('restart');
  const speedEl = document.getElementById('speed');
  const dpad = document.querySelector('.dpad');
  const playerNameEl = document.getElementById('playerName');
  const saveScoreBtn = document.getElementById('saveScore');

  const gridSize = 21; // 21x21
  const cell = Math.floor(canvas.width / gridSize);

  let snake, apple, dir, nextDir, score, running, loopId;

  function reset(){
    snake = [{x:10, y:10}];
    dir = {x:1, y:0};
    nextDir = {x:1, y:0};
    score = 0;
    scoreEl.textContent = '0';
    apple = randomApple();
    running = false;
    drawAll();
  }

  function randomApple(){
    let pos;
    while(true){
      pos = {x: Math.floor(Math.random()*gridSize), y: Math.floor(Math.random()*gridSize)};
      if (!snake.some(s => s.x===pos.x && s.y===pos.y)) return pos;
    }
  }

  function drawAll(){
    // background
    const g1 = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g1.addColorStop(0, 'rgba(34,197,94,0.3)');
    g1.addColorStop(1, 'rgba(22,163,74,0.3)');
    ctx.fillStyle = g1;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // grid light lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i=0;i<=gridSize;i++){
      ctx.beginPath(); ctx.moveTo(i*cell, 0); ctx.lineTo(i*cell, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i*cell); ctx.lineTo(canvas.width, i*cell); ctx.stroke();
    }

    // snake
    ctx.fillStyle = '#16a34a';
    snake.forEach((s, idx) => {
      ctx.fillStyle = idx === 0 ? '#22c55e' : '#16a34a';
      ctx.fillRect(s.x*cell+1, s.y*cell+1, cell-2, cell-2);
    });

    // apple
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    const ax = apple.x*cell + cell/2;
    const ay = apple.y*cell + cell/2;
    ctx.arc(ax, ay, cell*0.35, 0, Math.PI*2);
    ctx.fill();
  }

  function tick(){
    dir = nextDir;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    // collisions
    if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize) {
      return gameOver();
    }
    if (snake.some(s => s.x===head.x && s.y===head.y)) {
      return gameOver();
    }

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
      score += 10;
      scoreEl.textContent = String(score);
      apple = randomApple();
    } else {
      snake.pop();
    }

    drawAll();
  }

  function gameOver(){
    running = false;
    cancelAnimationFrame(loopId);
    // Dim overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Poppins, Arial';
    ctx.fillText('Game Over', 20, 40);
    ctx.font = '16px Poppins, Arial';
    ctx.fillText('Score: ' + score, 20, 64);
  }

  function loop(){
    const speed = Number(speedEl.value); // 5..20
    const interval = Math.floor(1000 / speed);
    let last = 0;
    function frame(ts){
      if (!running) return;
      if (ts - last > interval){
        last = ts;
        tick();
      }
      loopId = requestAnimationFrame(frame);
    }
    loopId = requestAnimationFrame(frame);
  }

  function start(){
    if (running) return;
    running = true;
    loop();
  }

  function restart(){
    cancelAnimationFrame(loopId);
    reset();
    running = false;
  }

  function keyDown(e){
    const k = e.key;
    if (k === 'ArrowUp' && dir.y !== 1) nextDir = {x:0, y:-1};
    else if (k === 'ArrowDown' && dir.y !== -1) nextDir = {x:0, y:1};
    else if (k === 'ArrowLeft' && dir.x !== 1) nextDir = {x:-1, y:0};
    else if (k === 'ArrowRight' && dir.x !== -1) nextDir = {x:1, y:0};
  }

  function dpadClick(e){
    const btn = e.target.closest('button[data-dir]');
    if (!btn) return;
    const d = btn.getAttribute('data-dir');
    if (d === 'up' && dir.y !== 1) nextDir = {x:0, y:-1};
    if (d === 'down' && dir.y !== -1) nextDir = {x:0, y:1};
    if (d === 'left' && dir.x !== 1) nextDir = {x:-1, y:0};
    if (d === 'right' && dir.x !== -1) nextDir = {x:1, y:0};
  }

  function bind(){
    document.addEventListener('keydown', keyDown);
    if (dpad) dpad.addEventListener('click', dpadClick);
    startBtn.addEventListener('click', start);
    restartBtn.addEventListener('click', restart);
    saveScoreBtn.addEventListener('click', function(){
      PlayZoneUtils.saveScore(gameId, playerNameEl.value, score);
      PlayZoneUtils.renderLeaderboard('#leaderboard', gameId, { unit: 'pts' });
    });
  }

  function init(){
    PlayZoneUtils.renderLeaderboard('#leaderboard', gameId, { unit: 'pts' });
    reset();
    bind();
  }

  document.addEventListener('DOMContentLoaded', init);
})();