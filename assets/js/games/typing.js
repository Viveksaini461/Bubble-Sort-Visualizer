(function(){
  'use strict';

  const gameId = 'typing';
  const promptEl = document.getElementById('prompt');
  const inputEl = document.getElementById('input');
  const startBtn = document.getElementById('start');
  const restartBtn = document.getElementById('restart');
  const timeEl = document.getElementById('time');
  const wpmEl = document.getElementById('wpm');
  const accEl = document.getElementById('acc');
  const playerNameEl = document.getElementById('playerName');
  const saveScoreBtn = document.getElementById('saveScore');

  const texts = [
    'Practice makes perfect in the world of typing speed tests.',
    'JavaScript powers interactive features across the modern web.',
    'Typing quickly is useful, but accuracy is even more important.',
    'PlayZone offers fun games that run on any device in your browser.'
  ];

  let target = '',
      time = 60,
      started = false,
      timerId = null,
      typedChars = 0,
      correctChars = 0;

  function pickText(){
    const i = Math.floor(Math.random()*texts.length);
    return texts[i];
  }

  function renderPrompt(){
    const chars = target.split('').map(function(ch, i){
      return '<span data-i="'+i+'">'+ch.replace(/ /g, '&nbsp;')+'</span>';
    }).join('');
    promptEl.innerHTML = chars;
  }

  function start(){
    if (started) return;
    started = true;
    time = 60; timeEl.textContent = String(time);
    target = pickText();
    renderPrompt();
    inputEl.value = '';
    typedChars = 0; correctChars = 0; updateStats();
    inputEl.focus();
    timerId = setInterval(function(){
      time--; timeEl.textContent = String(time);
      if (time <= 0) end();
    }, 1000);
  }

  function end(){
    clearInterval(timerId); timerId = null; started = false; inputEl.blur();
  }

  function restart(){
    clearInterval(timerId); timerId=null; started=false;
    time = 60; timeEl.textContent = '60';
    target = pickText(); renderPrompt();
    inputEl.value = ''; typedChars=0; correctChars=0; updateStats();
  }

  function updateStats(){
    const minutes = (60 - time) / 60 || 1/60; // avoid zero
    const wpm = Math.max(0, Math.round((correctChars/5) / minutes));
    const acc = typedChars ? Math.round((correctChars/typedChars)*100) : 100;
    wpmEl.textContent = String(wpm);
    accEl.textContent = acc + '%';
  }

  function onInput(){
    const val = inputEl.value;
    typedChars = val.length;
    correctChars = 0;
    const spans = promptEl.querySelectorAll('span');
    for (let i=0;i<spans.length;i++){
      const expected = target[i] || '';
      const given = val[i] || '';
      if (given === '') { spans[i].style.background=''; spans[i].style.color=''; continue; }
      if (given === expected) { spans[i].style.background='rgba(34,197,94,0.15)'; spans[i].style.color=''; correctChars++; }
      else { spans[i].style.background='rgba(239,68,68,0.15)'; spans[i].style.color=''; }
    }
    updateStats();
  }

  function bind(){
    startBtn.addEventListener('click', start);
    restartBtn.addEventListener('click', restart);
    inputEl.addEventListener('input', onInput);
    saveScoreBtn.addEventListener('click', function(){
      const wpm = Number(wpmEl.textContent) || 0;
      // score: prioritize WPM, small bonus for accuracy
      const acc = Number((accEl.textContent || '0%').replace('%','')) || 0;
      const score = Math.round(wpm * (1 + (acc-80)/100));
      PlayZoneUtils.saveScore(gameId, playerNameEl.value, score);
      PlayZoneUtils.renderLeaderboard('#leaderboard', gameId, { unit: 'WPM' });
    });
  }

  function init(){
    PlayZoneUtils.renderLeaderboard('#leaderboard', gameId, { unit: 'WPM' });
    restart();
    bind();
  }

  document.addEventListener('DOMContentLoaded', init);
})();