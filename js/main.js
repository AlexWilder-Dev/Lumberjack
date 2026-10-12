(() => {
  'use strict';

  /* ---------- Opening hours & live status (Europe/London) ---------- */

  // [open, close] in hours, by day of week (0 = Sunday)
  const HOURS = { 0: [9, 16], 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: [8, 16], 6: [9, 16] };
  const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const CLOSING_SOON_MINS = 30;

  const londonFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });

  function londonNow(date = new Date()) {
    const parts = {};
    londonFormatter.formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
    return { day: DAY_INDEX[parts.weekday], mins: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10) };
  }

  const formatHour = (h) => (h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`);

  function getStatus() {
    const { day, mins } = londonNow();
    const [open, close] = HOURS[day];
    if (mins >= open * 60 && mins < close * 60) {
      if (close * 60 - mins <= CLOSING_SOON_MINS) {
        return { state: 'soon', label: 'Closing soon', short: 'Closing', detail: `until ${formatHour(close)}`, day };
      }
      return { state: 'open', label: 'Open now', short: 'Open', detail: `until ${formatHour(close)}`, day };
    }
    if (mins < open * 60) {
      return { state: 'closed', label: 'Closed', short: 'Closed', detail: `opens at ${formatHour(open)}`, day };
    }
    const next = (day + 1) % 7;
    return { state: 'closed', label: 'Closed', short: 'Closed', detail: `opens tomorrow at ${formatHour(HOURS[next][0])}`, day };
  }

  function renderStatus() {
    const s = getStatus();
    document.querySelectorAll('[data-status]').forEach((el) => {
      el.classList.remove('is-open', 'is-soon', 'is-closed');
      el.classList.add(`is-${s.state}`);
      const text = el.querySelector('[data-status-text]');
      const short = el.querySelector('[data-status-short]');
      const detail = el.querySelector('[data-status-detail]');
      if (text) text.textContent = s.label;
      if (short) short.textContent = s.short;
      if (detail) detail.textContent = s.detail;
      if (el.matches('a')) el.setAttribute('aria-label', `${s.label}, ${s.detail}. Opening hours`);
    });
    document.querySelectorAll('.hours tr[data-day]').forEach((row) => {
      row.classList.toggle('is-today', Number(row.dataset.day) === s.day);
    });
  }

  renderStatus();
  setInterval(renderStatus, 30 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderStatus(); });

  /* ---------- Header & navigation ---------- */

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !e.target.closest('[data-header]')) setNav(false);
  });
  window.matchMedia('(min-width: 960px)').addEventListener('change', () => setNav(false));

  /* ---------- The A-frame shelves ---------- */

  const aframe = document.querySelector('[data-aframe]');
  if (aframe) {
    const tabs = Array.from(aframe.querySelectorAll('.af-shelf'));
    const keyOf = (tab) => tab.id.replace('tab-', '');
    const plank = (key) => aframe.querySelector(`[data-plank="${key}"]`);
    const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));
    const stacked = window.matchMedia('(max-width: 959px)');

    function select(tab, { focus = false, reveal = false } = {}) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        plank(keyOf(t)).classList.toggle('is-active', on);
        panelOf(t).classList.toggle('is-active', on);
      });
      if (focus) tab.focus();
      if (reveal && stacked.matches) {
        const panel = panelOf(tab);
        const top = panel.getBoundingClientRect().top;
        if (top > window.innerHeight * 0.7) panel.scrollIntoView({ block: 'start' });
      }
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, { reveal: true }));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); select(tabs[next], { focus: true }); }
      });
      const hover = (on) => plank(keyOf(tab)).classList.toggle('is-hover', on);
      tab.addEventListener('pointerenter', () => hover(true));
      tab.addEventListener('pointerleave', () => hover(false));
      tab.addEventListener('focus', () => hover(true));
      tab.addEventListener('blur', () => hover(false));
    });

    select(tabs[0]);
  }

  /* ---------- Contact form (front end only) ---------- */

  const form = document.querySelector('[data-contact-form]');
  const success = document.querySelector('[data-form-success]');
  const successName = document.querySelector('[data-success-name]');
  const resetBtn = document.querySelector('[data-form-reset]');
  const messages = {
    'cf-name': { valueMissing: 'Please tell us your name.' },
    'cf-email': { valueMissing: 'We need an email address to reply to.', typeMismatch: 'That email address doesn’t look quite right.' },
    'cf-message': { valueMissing: 'Don’t forget your message.' },
  };
  const fields = Array.from(form.querySelectorAll('input, textarea'));

  function validate(field) {
    if (field.value.trim() === '') field.value = '';
    let msg = '';
    if (field.validity.valueMissing) msg = messages[field.id].valueMissing;
    else if (field.validity.typeMismatch) msg = messages[field.id].typeMismatch;
    field.closest('.field').classList.toggle('has-error', Boolean(msg));
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    form.querySelector(`[data-error-for="${field.id}"]`).textContent = msg;
    return !msg;
  }

  fields.forEach((f) => {
    f.addEventListener('blur', () => { if (f.value || f.closest('.field').classList.contains('has-error')) validate(f); });
    f.addEventListener('input', () => { if (f.closest('.field').classList.contains('has-error')) validate(f); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = fields.filter((f) => !validate(f));
    if (bad.length) { bad[0].focus(); return; }
    const first = form.elements.name.value.trim().split(/\s+/)[0];
    successName.textContent = first ? `, ${first}` : '';
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    fields.forEach((f) => { f.closest('.field').classList.remove('has-error'); f.removeAttribute('aria-invalid'); });
    form.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
