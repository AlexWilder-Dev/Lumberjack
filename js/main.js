(() => {
  'use strict';

  /* ---------- Opening hours & live status (Europe/London) ---------- */

  // [open, close] in hours, by day of week (0 = Sunday)
  const HOURS = {
    0: [9, 16],
    1: [8, 16],
    2: [8, 16],
    3: [8, 16],
    4: [8, 16],
    5: [8, 16],
    6: [9, 16],
  };
  const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const CLOSING_SOON_MINS = 30;

  const londonFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  function londonNow(date = new Date()) {
    const parts = {};
    londonFormatter.formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
    return {
      day: DAY_INDEX[parts.weekday],
      mins: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10),
    };
  }

  function formatHour(h) {
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  }

  function getStatus(date) {
    const { day, mins } = londonNow(date);
    const [open, close] = HOURS[day];
    if (mins >= open * 60 && mins < close * 60) {
      const left = close * 60 - mins;
      if (left <= CLOSING_SOON_MINS) {
        return { state: 'soon', label: 'Closing soon', short: 'Closing', detail: `Open today until ${formatHour(close)}`, day };
      }
      return { state: 'open', label: 'Open now', short: 'Open', detail: `Until ${formatHour(close)} today`, day };
    }
    if (mins < open * 60) {
      return { state: 'closed', label: 'Closed now', short: 'Closed', detail: `Opens today at ${formatHour(open)}`, day };
    }
    const next = (day + 1) % 7;
    return { state: 'closed', label: 'Closed now', short: 'Closed', detail: `Opens tomorrow at ${formatHour(HOURS[next][0])}`, day };
  }

  function renderStatus() {
    const s = getStatus();
    document.querySelectorAll('[data-status]').forEach((el) => {
      el.classList.remove('is-open', 'is-soon', 'is-closed');
      el.classList.add(`is-${s.state}`);
      const text = el.querySelector('[data-status-text]');
      const detail = el.querySelector('[data-status-detail]');
      const short = el.querySelector('[data-status-short]');
      if (text) text.textContent = s.label;
      if (short) short.textContent = s.short;
      if (detail) detail.textContent = s.detail;
      if (el.classList.contains('status-pill')) {
        el.setAttribute('aria-label', `${s.label}. ${s.detail}. See opening hours.`);
      }
    });
    document.querySelectorAll('.hours tr[data-day]').forEach((row) => {
      row.classList.toggle('is-today', Number(row.dataset.day) === s.day);
    });
  }

  renderStatus();
  setInterval(renderStatus, 30 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderStatus();
  });

  /* ---------- Header & navigation ---------- */

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setNav(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !e.target.closest('[data-header]')) setNav(false);
  });
  window.matchMedia('(min-width: 1000px)').addEventListener('change', () => setNav(false));

  /* ---------- The shelves ---------- */

  const panelsWrap = document.querySelector('[data-shelf-panels]');
  const tabsWrap = document.querySelector('[data-shelf-tabs]');
  const searchWrap = document.querySelector('[data-shelf-search]');
  const searchInput = document.getElementById('shelf-q');
  const results = document.querySelector('[data-shelf-results]');
  const resultsBoard = document.querySelector('[data-results-board]');
  const resultsSummary = document.querySelector('[data-results-summary]');

  const panels = Array.from(panelsWrap.querySelectorAll('.shelf'));
  const tabs = [];

  const normalise = (str) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  // Producers line for each shelf, built from its labels
  panels.forEach((panel) => {
    const names = [];
    panel.querySelectorAll('.label[data-producer]').forEach((label) => {
      const name = label.dataset.producer;
      if (!names.includes(name)) names.push(name);
    });
    const line = panel.querySelector('[data-producers]');
    if (line && names.length) {
      const strong = document.createElement('b');
      strong.textContent = names.length === 1 ? 'Producer: ' : `${names.length} producers: `;
      line.append(strong, document.createTextNode(names.join(', ')));
    }
  });

  function selectTab(index, focus) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) {
      tabs[index].focus();
      tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  panels.forEach((panel, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'shelf-tab';
    tab.id = `${panel.id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);

    const name = document.createElement('span');
    name.textContent = panel.dataset.shelf;
    const count = document.createElement('span');
    count.className = 'shelf-tab-count';
    const n = panel.querySelectorAll('.label').length;
    count.textContent = String(n);
    count.setAttribute('aria-label', `${n} items`);
    tab.append(name, count);

    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;

    tab.addEventListener('click', () => {
      clearSearch();
      selectTab(i, false);
    });
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % panels.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + panels.length) % panels.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = panels.length - 1;
      if (next !== null) {
        e.preventDefault();
        clearSearch();
        selectTab(next, true);
      }
    });

    tabs.push(tab);
    tabsWrap.append(tab);
  });

  tabsWrap.hidden = false;
  searchWrap.hidden = false;
  selectTab(0, false);

  // Search across every shelf
  const index = [];
  panels.forEach((panel, panelIndex) => {
    panel.querySelectorAll('.label').forEach((label) => {
      index.push({
        label,
        panelIndex,
        text: normalise(`${label.textContent} ${panel.dataset.shelf} ${label.dataset.producer || ''}`),
      });
    });
  });

  function clearSearch() {
    if (!searchInput.value) return;
    searchInput.value = '';
    runSearch();
  }

  function showShelfFromResult(panelIndex) {
    clearSearch();
    selectTab(panelIndex, true);
  }

  function runSearch() {
    const q = normalise(searchInput.value);
    resultsBoard.replaceChildren();
    resultsSummary.replaceChildren();

    const searching = q.length >= 2;
    tabsWrap.classList.toggle('is-searching', searching);
    if (!searching) {
      results.hidden = true;
      panelsWrap.hidden = false;
      return;
    }

    const words = q.split(' ');
    const matches = index.filter((item) => words.every((w) => item.text.includes(w)));

    results.hidden = false;
    panelsWrap.hidden = true;

    const shown = searchInput.value.trim();
    if (!matches.length) {
      resultsSummary.append(`Nothing on the shelves matches “${shown}”. `);
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.textContent = 'Back to the shelves';
      reset.addEventListener('click', () => { clearSearch(); searchInput.focus(); });
      resultsSummary.append(reset);
      resultsBoard.hidden = true;
      return;
    }

    resultsBoard.hidden = false;
    resultsSummary.textContent = `${matches.length} ${matches.length === 1 ? 'thing' : 'things'} on the shelves for “${shown}”`;
    matches.forEach(({ label, panelIndex }) => {
      const copy = label.cloneNode(true);
      copy.querySelectorAll('.tag').forEach((t) => t.remove());
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'label-shelf';
      link.textContent = `${panels[panelIndex].dataset.shelf} shelf`;
      link.setAttribute('aria-label', `Open the ${panels[panelIndex].dataset.shelf} shelf`);
      link.addEventListener('click', () => showShelfFromResult(panelIndex));
      copy.append(link);
      resultsBoard.append(copy);
    });
  }

  searchInput.addEventListener('input', runSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearSearch();
  });

  /* ---------- Contact form (front end only) ---------- */

  const form = document.querySelector('[data-contact-form]');
  const success = document.querySelector('[data-form-success]');
  const successName = document.querySelector('[data-success-name]');
  const resetBtn = document.querySelector('[data-form-reset]');

  const messages = {
    'cf-name': { valueMissing: 'Please tell us your name.' },
    'cf-email': {
      valueMissing: 'We need an email address to reply to.',
      typeMismatch: 'That email address doesn’t look quite right.',
    },
    'cf-message': { valueMissing: 'Don’t forget your message.' },
  };

  function validateField(field) {
    const wrap = field.closest('.field');
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    if (field.type !== 'email' && field.value.trim() === '' && field.value !== '') field.value = '';
    let msg = '';
    if (field.validity.valueMissing) msg = messages[field.id].valueMissing;
    else if (field.validity.typeMismatch) msg = messages[field.id].typeMismatch;
    wrap.classList.toggle('has-error', Boolean(msg));
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    error.textContent = msg;
    return !msg;
  }

  const fields = Array.from(form.querySelectorAll('input, textarea'));
  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      if (field.value || field.closest('.field').classList.contains('has-error')) validateField(field);
    });
    field.addEventListener('input', () => {
      if (field.closest('.field').classList.contains('has-error')) validateField(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = fields.filter((f) => !validateField(f));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    const first = form.elements.name.value.trim().split(/\s+/)[0];
    successName.textContent = first ? `, ${first}` : '';
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    fields.forEach((f) => {
      f.closest('.field').classList.remove('has-error');
      f.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });

  /* ---------- Gentle reveal on scroll ---------- */

  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
})();
