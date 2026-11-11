/* Переключатель светлой и тёмной темы */
(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncLabel() {
    var isDark = currentTheme() === 'dark';
    var label = isDark ? 'Включить светлую тему' : 'Включить тёмную тему';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
  }

  toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* приватный режим */ }
    syncLabel();
  });

  // Если тема ещё не сохранена — следим за системной
  try {
    var media = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (event) {
      if (localStorage.getItem('theme')) return;
      root.setAttribute('data-theme', event.matches ? 'dark' : 'light');
      syncLabel();
    };
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
    } else if (typeof media.addListener === 'function') {
      media.addListener(onChange);
    }
  } catch (e) { /* noop */ }

  syncLabel();
})();
