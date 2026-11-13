/* Мини-квиз: 3 шага -> рекомендация пакета -> Telegram */
(function () {
  'use strict';

  var app = document.getElementById('quiz-app');
  if (!app) return;

  var steps = Array.prototype.slice.call(app.querySelectorAll('.quiz-step'));
  var resultBox = document.getElementById('quiz-result');
  var resultTitle = document.getElementById('quiz-result-title');
  var resultText = document.getElementById('quiz-result-text');
  var resultPrice = document.getElementById('quiz-result-price');
  var tgLink = document.getElementById('quiz-tg');
  var backBtn = document.getElementById('quiz-back');
  var restartBtn = document.getElementById('quiz-restart');
  var label = document.getElementById('quiz-step-label');
  var progress = app.querySelector('.quiz-progress');
  var progressBar = document.getElementById('quiz-progress-bar');
  var hint = document.getElementById('quiz-hint');

  var TOTAL = steps.length;
  var current = 1;
  var answers = {};
  var locked = false;

  var scores = { landing: 0, leads: 0, auto: 0 };

  var points = {
    'new-site': { landing: 2 },
    'lost-leads': { leads: 2 },
    'routine': { auto: 2 },
    'night': { auto: 2 },
    'ads': { leads: 2 },
    'no-site': { landing: 1 },
    'old-site': { landing: 1 },
    'good-site': { leads: 1 },
    'fast': { landing: 1 },
    'automate': { auto: 2 },
    'advice': { leads: 1 }
  };

  var results = {
    landing: {
      title: 'Вам подойдёт «Лендинг за 3 дня»',
      text: 'Структура, тексты, дизайн и форма заявки. Быстрый способ объяснить, что вы предлагаете, и начать принимать обращения с сайта.',
      price: 'от 5 000 ₽ · запуск за 3 дня',
      message: 'Здравствуйте! Прошла квиз на сайте: нужен лендинг. Хочу обсудить задачу.'
    },
    leads: {
      title: 'Вам подойдёт «Сайт + заявки под ключ»',
      text: 'Лендинг плюс автоматизация: заявки приходят в Telegram и собираются в таблицу. Ничего не теряется в переписках.',
      price: 'цена по запросу · 3–5 дней',
      message: 'Здравствуйте! Прошла квиз на сайте: нужен сайт и автоматизация заявок. Хочу обсудить.'
    },
    auto: {
      title: 'Вам подойдёт «Автоматизация»',
      text: 'Разберём, где уходит время, и уберём ручную работу: боты, интеграции с таблицами, отчёты и напоминания.',
      price: 'цена по запросу · 1–2 недели',
      message: 'Здравствуйте! Прошла квиз на сайте: хочу автоматизировать рутину. Хочу обсудить.'
    }
  };

  function track(goal) {
    if (typeof window.trackGoal === 'function') window.trackGoal(goal);
  }

  function updateProgress() {
    if (label) label.textContent = 'Шаг ' + current + ' из ' + TOTAL;
    if (progress) progress.setAttribute('aria-valuenow', String(current));
    if (progressBar) progressBar.style.width = ((current / TOTAL) * 100) + '%';
    if (backBtn) backBtn.hidden = current <= 1;
    if (hint) hint.textContent = 'Выберите один вариант';
  }

  function showStep(step) {
    current = step;
    steps.forEach(function (el) {
      el.hidden = Number(el.getAttribute('data-step')) !== step;
    });
    resultBox.hidden = true;
    app.classList.remove('is-result');
    updateProgress();
  }

  function score() {
    scores = { landing: 0, leads: 0, auto: 0 };
    Object.keys(answers).forEach(function (key) {
      var value = answers[key];
      var add = points[value];
      if (!add) return;
      Object.keys(add).forEach(function (pkg) {
        scores[pkg] += add[pkg];
      });
    });

    // При равенстве выбираем вариант, ближе всего к первой боли
    var order = ['leads', 'landing', 'auto'];
    var best = order[0];
    order.forEach(function (pkg) {
      if (scores[pkg] > scores[best]) best = pkg;
    });
    return best;
  }

  function showResult() {
    var pkg = score();
    var data = results[pkg];

    resultTitle.textContent = data.title;
    resultText.textContent = data.text;
    resultPrice.textContent = data.price;
    tgLink.href = 'https://t.me/Aleka_Olga?text=' + encodeURIComponent(data.message);

    steps.forEach(function (el) { el.hidden = true; });
    resultBox.hidden = false;
    app.classList.add('is-result');
    if (label) label.textContent = 'Готово';
    if (progress) progress.setAttribute('aria-valuenow', String(TOTAL));
    if (progressBar) progressBar.style.width = '100%';
    if (backBtn) backBtn.hidden = false;
    if (hint) hint.textContent = 'Результат можно отправить в Telegram';
    resultBox.focus && resultBox.setAttribute('tabindex', '-1');
    resultBox.focus();

    track('quiz_complete');
  }

  function selectOption(button) {
    if (locked) return;
    locked = true;

    var stepEl = button.closest('.quiz-step');
    var step = Number(stepEl.getAttribute('data-step'));
    var value = button.getAttribute('data-value');

    stepEl.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.classList.remove('is-selected');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('is-selected');
    button.setAttribute('aria-pressed', 'true');
    answers[step] = value;

    window.setTimeout(function () {
      locked = false;
      if (step < TOTAL) {
        showStep(step + 1);
      } else {
        showResult();
      }
    }, 190);
  }

  app.addEventListener('click', function (event) {
    var option = event.target.closest('.quiz-option');
    if (option) selectOption(option);
  });

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (app.classList.contains('is-result')) {
        resultBox.hidden = true;
        app.classList.remove('is-result');
        showStep(TOTAL);
        return;
      }
      if (current > 1) showStep(current - 1);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      answers = {};
      scores = { landing: 0, leads: 0, auto: 0 };
      app.querySelectorAll('.quiz-option').forEach(function (btn) {
        btn.classList.remove('is-selected');
        btn.setAttribute('aria-pressed', 'false');
      });
      showStep(1);
    });
  }

  // Начальное состояние
  if (backBtn) backBtn.hidden = true;
  updateProgress();
})();
