(function(){
  'use strict';

  const gameId = 'rps';
  const picks = Array.from(document.querySelectorAll('.pick'));
  const yourHand = document.getElementById('yourHand');
  const cpuHand = document.getElementById('cpuHand');
  const resultEl = document.getElementById('result');
  const winsEl = document.getElementById('wins');
  const lossesEl = document.getElementById('losses');
  const drawsEl = document.getElementById('draws');
  const restartBtn = document.getElementById('restart');
  const playerNameEl = document.getElementById('playerName');
  const saveScoreBtn = document.getElementById('saveScore');

  let wins=0, losses=0, draws=0, lock=false;

  const toEmoji = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
  };
  const allMoves = Object.keys(toEmoji);

  function cpuPick(){
    const r = Math.floor(Math.random()*3);
    return allMoves[r];
  }

  function scoreRound(player, cpu){
    if (player === cpu) return 'draw';
    if ((player==='rock' && cpu==='scissors') || (player==='paper' && cpu==='rock') || (player==='scissors' && cpu==='paper')) return 'win';
    return 'lose';
  }

  function play(move){
    if (lock) return; lock = true;
    yourHand.textContent = toEmoji[move];
    yourHand.style.animation = 'none'; cpuHand.style.animation = 'none';
    void yourHand.offsetWidth; void cpuHand.offsetWidth;
    yourHand.style.animation = 'bounce 1.1s 1';
    cpuHand.style.animation = 'bounce 1.1s 1';

    setTimeout(function(){
      const cpu = cpuPick();
      cpuHand.textContent = toEmoji[cpu];
      const res = scoreRound(move, cpu);
      if (res === 'win') { wins++; winsEl.textContent = String(wins); resultEl.textContent = 'You win!'; }
      else if (res === 'lose') { losses++; lossesEl.textContent = String(losses); resultEl.textContent = 'You lose!'; }
      else { draws++; drawsEl.textContent = String(draws); resultEl.textContent = 'Draw'; }
      lock = false;
    }, 500);
  }

  function restart(){ wins=0; losses=0; draws=0; winsEl.textContent='0'; lossesEl.textContent='0'; drawsEl.textContent='0'; resultEl.textContent='—'; yourHand.textContent='🤜'; cpuHand.textContent='🤛'; }

  function bind(){
    picks.forEach(function(btn){ btn.addEventListener('click', function(){ play(btn.getAttribute('data-move')); }); });
    restartBtn.addEventListener('click', restart);
    saveScoreBtn.addEventListener('click', function(){
      const totalScore = wins*2 + draws; // weight wins more
      PlayZoneUtils.saveScore(gameId, playerNameEl.value, totalScore);
      PlayZoneUtils.renderLeaderboard('#leaderboard', gameId, { unit: 'pts' });
    });
  }

  function init(){
    PlayZoneUtils.renderLeaderboard('#leaderboard', gameId, { unit: 'pts' });
    bind();
  }

  document.addEventListener('DOMContentLoaded', init);
})();