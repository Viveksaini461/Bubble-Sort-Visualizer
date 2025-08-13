(function() {
  'use strict';

  function getPreferredTheme() {
    const stored = localStorage.getItem('pz_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('#themeToggle .toggle-icon');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('pz_theme', next);
    applyTheme(next);
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  }

  function initYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) {
      const now = new Date();
      yearEl.textContent = String(now.getFullYear());
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initYear();
  });
})();