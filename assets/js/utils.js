// Shared utilities for PlayZone
(function(global) {
  'use strict';

  const STORAGE_PREFIX = 'pz_leaderboard_';

  function getLeaderboard(gameId) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + gameId);
      if (!raw) return [];
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list;
    } catch (e) {
      console.error('Failed to load leaderboard', e);
      return [];
    }
  }

  function saveLeaderboard(gameId, entries) {
    try {
      localStorage.setItem(STORAGE_PREFIX + gameId, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save leaderboard', e);
    }
  }

  function saveScore(gameId, playerName, score) {
    const name = (playerName || 'Player').trim().slice(0, 24) || 'Player';
    const newEntry = {
      name,
      score: Number(score) || 0,
      date: new Date().toISOString()
    };
    const list = getLeaderboard(gameId);
    list.push(newEntry);
    list.sort(function(a, b) { return b.score - a.score; });
    const trimmed = list.slice(0, 10);
    saveLeaderboard(gameId, trimmed);
    return trimmed;
  }

  function renderLeaderboard(container, gameId, options) {
    const target = typeof container === 'string' ? document.querySelector(container) : container;
    if (!target) return;
    const unit = options && options.unit ? options.unit : 'pts';
    const entries = getLeaderboard(gameId);
    const rows = entries.map(function(entry, index) {
      const rank = index + 1;
      const dateStr = new Date(entry.date).toLocaleDateString();
      return '<tr>' +
        '<td>#' + rank + '</td>' +
        '<td>' + escapeHtml(entry.name) + '</td>' +
        '<td>' + entry.score + ' ' + unit + '</td>' +
        '<td>' + dateStr + '</td>' +
      '</tr>';
    }).join('');

    target.innerHTML = (
      '<div class="leaderboard">' +
        '<h3>Local Leaderboard</h3>' +
        '<table>' +
          '<thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Date</th></tr></thead>' +
          '<tbody>' + (rows || '<tr><td colspan="4">No scores yet. Be the first!</td></tr>') + '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  global.PlayZoneUtils = {
    getLeaderboard,
    saveScore,
    renderLeaderboard
  };

})(window);