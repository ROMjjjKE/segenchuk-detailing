/* СЕГЕНЧУК: меню, оценка салона, форма */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* меню */
  var drawer = $('#drawer'), burger = $('#burger'), close = $('#drawerClose'), lastFocus = null;
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    var f = drawer.querySelector('a, button'); if (f) f.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', openDrawer);
  if (close) close.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') {
        var items = $$('a, button', drawer).filter(function (el) { return el.offsetParent !== null; });
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  window.addEventListener('resize', function () { if (window.innerWidth > 1099) closeDrawer(); });

  /* оценка салона */
  var quiz = $('[data-quiz]');
  if (quiz) {
    var TIME = { 'Седан': [3, 4], 'Хэтчбек': [3, 4], 'Универсал': [4, 5], 'Кроссовер': [4, 5], 'Минивэн': [5, 6], 'Микроавтобус': [6, 8] };
    var MULT = { 'Лёгкое': 0.85, 'Среднее': 1, 'Сильное': 1.3, 'После животных': 1.4 };
    var ZONES = { 'Лёгкое': 5, 'Среднее': 6, 'Сильное': 7, 'После животных': 8 };
    var BASE = ['Пылесосим салон и багажник', 'Обезжириваем пластик и панель', 'Чистим сиденья экстрактором', 'Проходим потолок и стойки', 'Ковролин и коврики', 'Сушим и собираем салон'];
    var FOCUS = {
      'Пятна': 'Отдельно работаем по пятнам: пятновыводитель под тип ткани, без разводов и жёсткой щётки.',
      'Запах': 'Убираем источник запаха, а не маскируем: обработка нейтрализатором и полная экстракция.',
      'Шерсть': 'Снимаем шерсть резиновой щёткой и пылесосом с турбощёткой до влажной чистки.',
      'Всё сразу': 'Идём полным циклом: пятна, запах и шерсть, с проверкой каждого элемента.'
    };
    var state = { body: 'Седан', state: 'Среднее', focus: 'Запах' };
    function fmt(m) { return m >= 60 ? (Math.round(m / 60 * 10) / 10 + ' ч').replace('.', ',') : m + ' мин'; }
    function render() {
      var t = TIME[state.body] || [4, 5], k = MULT[state.state] || 1;
      var lo = Math.round(t[0] * k * 60 / 15) * 15, hi = Math.round(t[1] * k * 60 / 15) * 15;
      var title = state.body + ', ' + state.state.toLowerCase() + ' загрязнение';
      if (state.state === 'После животных') title = state.body + ', салон после животных';
      $('[data-q-title]', quiz).textContent = title;
      $('[data-q-desc]', quiz).textContent = FOCUS[state.focus];
      $('[data-q-time]', quiz).textContent = fmt(lo) + ' – ' + fmt(hi);
      $('[data-q-zones]', quiz).textContent = ZONES[state.state] + ' зон';
      var list = BASE.slice(0, state.state === 'Лёгкое' ? 5 : 6);
      if (state.focus === 'Шерсть') list.splice(1, 0, 'Снимаем шерсть турбощёткой');
      if (state.state === 'После животных') list.push('Обработка нейтрализатором запаха');
      $('[data-q-list]', quiz).innerHTML = list.map(function (x) { return '<li>' + x + '</li>'; }).join('');
      var txt = 'Здравствуйте! Нужна химчистка: ' + state.body + ', состояние — ' + state.state.toLowerCase() + ', беспокоит: ' + state.focus.toLowerCase() + '. Ориентир по времени: ' + fmt(lo) + '–' + fmt(hi) + '.';
      $('[data-q-wa]', quiz).href = 'https://wa.me/375336998357?text=' + encodeURIComponent(txt);
    }
    $$('.qf__opts', quiz).forEach(function (group) {
      var key = group.getAttribute('data-q');
      $$('button', group).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('button', group).forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
          state[key] = b.getAttribute('data-v');
          render();
        });
      });
    });
    render();
  }

  /* форма → WhatsApp */
  $$('form.form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { var el = f.elements[n]; return el ? (el.value || '').trim() : ''; };
      var name = g('name'), phone = g('phone');
      if (!phone) { f.elements['phone'].focus(); return; }
      var lines = ['Здравствуйте! Заявка на химчистку авто.'];
      if (name) lines.push('Имя: ' + name);
      lines.push('Телефон: ' + phone);
      var car = g('car'); if (car) lines.push('Кузов: ' + car.replace(/^Кузов:\s*/, ''));
      var msg = g('msg'); if (msg) lines.push('Задача: ' + msg);
      window.open('https://wa.me/375336998357?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  });
})();
