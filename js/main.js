/* Основной скрипт: шапка, меню, аккордеоны, анимации, форма */
(function () {
  'use strict';

  /* ---------- Аналитика ---------- */
  var METRIKA_ID = 0; // TODO: вписать номер счётчика Яндекс.Метрики

  window.trackGoal = function (goal) {
    document.dispatchEvent(new CustomEvent('goal', { detail: goal }));
    if (METRIKA_ID && typeof window.ym === 'function') {
      window.ym(METRIKA_ID, 'reachGoal', goal);
    }
  };

  document.addEventListener('click', function (event) {
    var target = event.target.closest('[data-goal]');
    if (target) window.trackGoal(target.getAttribute('data-goal'));
  });

  /* ---------- Шапка ---------- */
  var header = document.getElementById('header');
  var toTop = document.getElementById('to-top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || burger.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  /* ---------- Кнопка «наверх» ---------- */
  if (toTop) {
    toTop.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Появление секций ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  revealEls.forEach(function (el) {
    var delay = el.getAttribute('data-delay');
    if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Подсветка пункта меню при скролле ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Аккордеоны ---------- */
  var caseItems = Array.prototype.slice.call(document.querySelectorAll('details.case'));
  caseItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      caseItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
      var title = item.querySelector('h3');
      window.trackGoal('case_open');
      if (title && window.console && console.debug) {
        console.debug('case_open:', title.textContent);
      }
    });
  });

  var faqItems = Array.prototype.slice.call(document.querySelectorAll('details.faq-item'));
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Год в подвале ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Форма заявки ---------- */
  var form = document.getElementById('lead-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');
  var nameInput = document.getElementById('name');
  var contactInput = document.getElementById('lead-contact');
  var consentInput = document.getElementById('consent');

  function rowOf(input) {
    return input.closest('.form-row');
  }

  function setError(input, message) {
    var row = rowOf(input);
    if (row) row.classList.add('is-invalid');
    var error = document.getElementById(input.id + '-error');
    if (error) error.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    var row = rowOf(input);
    if (row) row.classList.remove('is-invalid');
    var error = document.getElementById(input.id + '-error');
    if (error) error.textContent = '';
    input.removeAttribute('aria-invalid');
  }

  [nameInput, contactInput, consentInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () { clearError(input); });
    input.addEventListener('change', function () { clearError(input); });
  });

  function validate() {
    var valid = true;

    if (nameInput && nameInput.value.trim().length < 2) {
      setError(nameInput, 'Напишите имя — хотя бы 2 символа');
      valid = false;
    }
    if (contactInput && contactInput.value.trim().length < 3) {
      setError(contactInput, 'Оставьте Telegram, телефон или e-mail');
      valid = false;
    }
    if (consentInput && !consentInput.checked) {
      setError(consentInput, 'Без согласия я не могу принять заявку');
      valid = false;
    }

    return valid;
  }

  function showStatus(type, html) {
    if (!status) return;
    status.className = 'form-status is-' + type;
    status.innerHTML = html;
  }

  function resetStatus() {
    if (!status) return;
    status.className = 'form-status';
    status.textContent = '';
  }

  // UTM и служебные поля
  var params = new URLSearchParams(window.location.search);
  var tsField = form.elements.ts;

  function fillMeta() {
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
      var field = form.elements[key];
      if (field) field.value = params.get(key) || '';
    });
    var pageField = form.elements.page;
    if (pageField) pageField.value = window.location.href;
    if (tsField) tsField.value = String(Date.now());
  }

  fillMeta();

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    resetStatus();

    if (!validate()) {
      var firstInvalid = form.querySelector('.is-invalid input, .is-invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (tsField) tsField.value = String(Date.now());

    form.classList.add('is-sending');
    if (submitBtn) submitBtn.disabled = true;

    var data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(function (response) {
        return response.json().catch(function () {
          throw new Error('bad-json');
        });
      })
      .then(function (result) {
        if (!result || result.ok !== true) {
          throw new Error((result && result.error) || 'send-failed');
        }

        form.reset();
        fillMeta();

        showStatus(
          'success',
          'Спасибо! Заявка у меня — отвечу в течение дня. Если срочно, напишите сразу в ' +
          '<a href="https://t.me/Aleka_Olga" target="_blank" rel="noopener">Telegram</a>.'
        );
        window.trackGoal('lead_submit');
        if (status) status.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      })
      .catch(function () {
        showStatus(
          'error',
          'Не получилось отправить. Напишите напрямую в ' +
          '<a href="https://t.me/Aleka_Olga" target="_blank" rel="noopener">Telegram</a> ' +
          'или на <a href="mailto:kosyha@list.ru">kosyha@list.ru</a>.'
        );
      })
      .then(function () {
        form.classList.remove('is-sending');
        if (submitBtn) submitBtn.disabled = false;
      });
  });

  // Если форма отправлена без JS и сервер вернул ?sent=1
  if (params.get('sent') === '1') {
    showStatus(
      'success',
      'Спасибо! Заявка у меня — отвечу в течение дня. Если срочно, напишите в ' +
      '<a href="https://t.me/Aleka_Olga" target="_blank" rel="noopener">Telegram</a>.'
    );
  }
})();
