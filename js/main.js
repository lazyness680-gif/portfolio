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
  // Заявки принимает Яндекс Форма, встроенная в index.html.
})();
