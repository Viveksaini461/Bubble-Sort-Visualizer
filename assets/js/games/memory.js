(function(){
  'use strict';

  const gameId = 'memory';
  const gridEl = document.getElementById('grid');
  const startBtn = document.getElementById('start');
  const restartBtn = document.getElementById('restart');
  const timeEl = document.getElementById('time');
  const matchesEl = document.getElementById('matches');
  const movesEl = document.getElementById('moves');
  const playerNameEl = document.getElementById('playerName');
  const saveScoreBtn = document.getElementById('saveScore');

  const icons = ['🍎','🍌','🍇','🍉','🍓','🍒','🍍','🥝'];
  let cards = [];
  let first=null, second=null, lock=false, matches=0, moves=0, time=60, timerId=null, started=false;

  function makeDeck(){
    const deck = icons.concat(icons).map(function(icon, idx){
      return { id: idx+'_'+icon, icon: icon, matched: false };
    });
    for (let i=deck.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function render(){
    gridEl.innerHTML = cards.map(function(c, i){
      return '<button class="card'+(c.matched?' flip':'')+'" data-idx="'+i+'">\n'+
        '<div class="face front"></div>\n'+
        '<div class="face back">'+c.icon+'</div>\n'+
      '</button>';
    }).join('');
  }

  function start(){
    if (started) return;
    started = true;
    timerId = setInterval(function(){
      time--; timeEl.textContent = String(time);
      if (time <= 0) { end(false); }
    }, 1000);
  }

  function end(won){
    clearInterval(timerId); timerId=null; started=false; lock=true;
    if (won) {
      // allow save; score as matches*10 + time left
    }
  }

  function reset(){
    clearInterval(timerId); timerId=null; started=false;
    time = 60; timeEl.textContent = '60';
    matches = 0; matchesEl.textContent = '0';
    moves = 0; movesEl.textContent = '0';
    lock=false; first=null; second=null;
    cards = makeDeck();
    render();
  }

  function flip(idx){
    if (lock) return;
    const card = cards[idx];
    if (card.matched) return;
    const el = gridEl.querySelector('[data-idx="'+idx+'"]');
    if (el.classList.contains('flip')) return;

    el.classList.add('flip');
    if (!first) { first = { idx, card }; return; }
    if (first && !second) { second = { idx, card }; moves++; movesEl.textContent = String(moves); }

    if (first && second){
      lock = true;
      if (first.card.icon === second.card.icon){
        cards[first.idx].matched = true; cards[second.idx].matched = true;
        matches++; matchesEl.textContent = String(matches);
        first=null; second=null; lock=false;
        if (matches === icons.length) end(true);
      } else {
        setTimeout(function(){
          gridEl.querySelector('[data-idx="'+first.idx+'"]').classList.remove('flip');
          gridEl.querySelector('[data-idx="'+second.idx+'"]').classList.remove('flip');
          first=null; second=null; lock=false;
        }, 700);
      }
    }
  }

  function bind(){
    gridEl.addEventListener('click', function(e){
      const btn = e.target.closest('.card');
      if (!btn) return;
      const idx = Number(btn.getAttribute('data-idx'));
      if (!started) start();
      flip(idx);
    });
    startBtn.addEventListener('click', function(){ if (!started) start(); });
    restartBtn.addEventListener('click', reset);
    saveScoreBtn.addEventListener('click', function(){
      const score = matches*10 + time; // basic scoring
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