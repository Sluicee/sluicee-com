import './style.css';
import { pb } from './lib/pocketbase.js';
import { getProjects } from './services/projects.js';
import { t, getLang, onLangChange, cycleLang, initI18n, MONTHS_SHORT } from './i18n.js';

// 24 сэкки — настоящий сегмент традиционного календаря по дате в браузере.
// [месяц, день, кандзи, ru-глосса, en-глосса]; ja-глосса не нужна — кандзи уже японский.
const SEKKI = [
  [0, 4, '小寒', 'малые холода', 'minor cold'], [0, 20, '大寒', 'разгар холода', 'the depth of cold'],
  [1, 4, '立春', 'первый вдох весны', "spring's first breath"], [1, 19, '雨水', 'снег становится дождём', 'snow turns to rain'],
  [2, 5, '啓蟄', 'просыпаются насекомые', 'insects awaken'], [2, 20, '春分', 'весеннее равноденствие', 'spring equinox'],
  [3, 5, '清明', 'воздух ясен', 'the air turns clear'], [3, 20, '穀雨', 'дожди для всходов', 'rains for the seedlings'],
  [4, 5, '立夏', 'начало лета', 'summer begins'], [4, 21, '小満', 'всё понемногу наливается', 'everything slowly ripens'],
  [5, 5, '芒種', 'пора сева', 'sowing time'], [5, 21, '夏至', 'летнее солнцестояние', 'summer solstice'],
  [6, 7, '小暑', 'жара нарастает', 'the heat builds'], [6, 22, '大暑', 'разгар жары', 'the height of heat'],
  [7, 7, '立秋', 'первый вдох осени', "autumn's first breath"], [7, 23, '処暑', 'жар отступает', 'the heat recedes'],
  [8, 7, '白露', 'белая роса', 'white dew'], [8, 23, '秋分', 'осеннее равноденствие', 'autumn equinox'],
  [9, 8, '寒露', 'холодная роса', 'cold dew'], [9, 23, '霜降', 'первый иней', 'first frost'],
  [10, 7, '立冬', 'начало зимы', 'winter begins'], [10, 22, '小雪', 'первый снег', 'first snow'],
  [11, 7, '大雪', 'снегопады', 'heavy snow'], [11, 21, '冬至', 'зимнее солнцестояние', 'winter solstice']
];
const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const LASTFM_USER = 'Sluicee1';
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

function renderFooter() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll('[data-rss-link]').forEach((el) => {
    el.href = `${pb.baseUrl}/feed.xml`;
  });
}

function renderSekki() {
  const now = new Date();
  let current = SEKKI[0];
  for (const entry of SEKKI) {
    const [month, day] = entry;
    if (new Date(now.getFullYear(), month, day) <= now) current = entry;
  }
  const [, , jp, ru, en] = current;
  const gloss = { ru, en, ja: '' }[getLang()];
  const dd = String(now.getDate()).padStart(2, '0');

  document.querySelectorAll('[data-sekki-jp]').forEach((el) => { el.textContent = jp; });
  document.querySelectorAll('[data-sekki-gloss]').forEach((el) => { el.textContent = gloss ? ` · ${gloss}` : ''; });
  document.querySelectorAll('[data-postmark-date]').forEach((el) => {
    el.textContent = `${dd}. ${ROMAN_MONTHS[now.getMonth()]}`;
  });
  document.querySelectorAll('[data-sekki-sentence]').forEach((el) => {
    el.textContent = gloss
      ? t('sekki.sentenceWithGloss', { jp, gloss })
      : t('sekki.sentenceNoGloss', { jp });
  });
}

function createProjectCard(project, index) {
  const code = `SLC-${String(index + 1).padStart(3, '0')}`;
  const hasDescription = Boolean(project.description && project.description.trim());
  const href = project.link || project.github;

  const card = document.createElement('a');
  card.className = `k-m k-proj ${index % 2 === 0 ? 'p1' : 'p2'}${hasDescription ? '' : ' is-todo'}`;
  card.href = href || '#';
  if (href) {
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
  }

  const obi = document.createElement('span');
  obi.className = 'k-mini-obi';
  obi.setAttribute('aria-hidden', 'true');
  const obiLabel = document.createElement('span');
  obiLabel.textContent = code;
  obi.appendChild(obiLabel);

  const title = document.createElement('h4');
  title.textContent = project.title;

  const description = document.createElement('p');
  description.textContent = hasDescription ? project.description : t('projects.todoDesc');

  card.append(obi, title, description);

  if (project.tags && project.tags.length) {
    const tracks = document.createElement('span');
    tracks.className = 'k-tracks';
    project.tags.forEach((tag) => {
      const tagEl = document.createElement('i');
      tagEl.textContent = tag;
      tracks.appendChild(tagEl);
    });
    card.appendChild(tracks);
  }

  return card;
}

let projectsCache = [];

function applyProjectsText() {
  const list = document.querySelector('[data-projects-list]');
  const countEl = document.querySelector('[data-projects-count]');
  if (!list) return;

  list.replaceChildren();
  if (!projectsCache.length) {
    const empty = document.createElement('p');
    empty.className = 'k-projects-empty';
    empty.textContent = t('projects.empty');
    list.appendChild(empty);
  } else {
    projectsCache.forEach((project, index) => {
      list.appendChild(createProjectCard(project, index));
    });
  }

  if (countEl) {
    const n = String(projectsCache.length).padStart(2, '0');
    countEl.textContent = t('projects.count', { n });
  }
}

async function renderProjects() {
  const { projects } = await getProjects();
  projectsCache = projects;
  applyProjectsText();
}

function starsFromRating(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '');
}

function formatDate(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
}

function formatDateLong(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS_SHORT[getLang()][m - 1]} ${y}`;
}

async function fetchMediaRecord(key) {
  try {
    return await pb.collection('media').getFirstListItem(`key = "${key}"`);
  } catch {
    return null;
  }
}

let filmCache = null;

function applyFilmText() {
  const film = filmCache;
  if (!film) return;

  document.querySelectorAll('[data-film-link]').forEach((el) => { el.href = film.link || el.href; });

  const shot = document.querySelector('[data-film-shot]');
  if (shot && film.image) {
    shot.style.backgroundImage = `url("${film.image}")`;
  }

  const reviewEl = document.querySelector('[data-film-review]');
  if (reviewEl) reviewEl.textContent = film.review || `«${film.filmTitle}»`;

  const watchedEl = document.querySelector('[data-film-watched]');
  if (watchedEl) watchedEl.textContent = `${t('film.watched')} · ${formatDate(film.watchedDate)}`;

  const titleEl = document.querySelector('[data-film-title]');
  if (titleEl) titleEl.textContent = `${film.filmTitle} · ${film.filmYear}`;

  const starsEl = document.querySelector('[data-film-stars]');
  if (starsEl) starsEl.textContent = film.rating ? starsFromRating(film.rating) : '—';

  const seatEl = document.querySelector('[data-film-seat]');
  if (seatEl) seatEl.textContent = `席 ${film.seat || '—'}`;

  const watchedFullEl = document.querySelector('[data-film-watched-full]');
  if (watchedFullEl) watchedFullEl.textContent = formatDateLong(film.watchedDate);

  const yearRatingEl = document.querySelector('[data-film-year-rating]');
  if (yearRatingEl) {
    yearRatingEl.textContent = film.rating ? `${film.filmYear} · ${starsFromRating(film.rating)}` : film.filmYear;
  }
}

async function renderFilm() {
  const record = await fetchMediaRecord('film');
  if (!record || !record.data) return;
  filmCache = record.data;
  applyFilmText();
}

async function fetchLastfmTrack() {
  if (!LASTFM_API_KEY) return null;
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const track = data?.recenttracks?.track?.[0];
    if (!track) return null;
    const nowPlaying = track['@attr']?.nowplaying === 'true';
    return {
      labelKey: nowPlaying ? 'track.now' : 'track.last',
      text: `${track.artist?.['#text'] || ''} — ${track.name || ''}`,
      href: track.url || 'https://www.last.fm/user/' + LASTFM_USER,
    };
  } catch {
    return null;
  }
}

let tapeState = null;

function applyTrack(state) {
  tapeState = state;
  const label = document.querySelector('[data-track-label]');
  const link = document.querySelector('[data-track]');
  const sub = document.querySelector('[data-track-sub]');
  if (label) label.textContent = t(state.labelKey);
  if (link) {
    link.textContent = state.textKey ? t(state.textKey) : state.text;
    link.href = state.href;
  }
  if (sub) sub.textContent = state.subKey ? t(state.subKey) : '';
}

async function renderTapeCard() {
  const lastfmTrack = await fetchLastfmTrack();
  if (lastfmTrack) {
    applyTrack({ ...lastfmTrack, subKey: 'track.rerollHint' });
  } else {
    applyTrack({ labelKey: 'track.playlist', textKey: 'track.pressReroll', href: '#', subKey: 'track.lastfmUnavailable' });
  }

  const playlistRecord = await fetchMediaRecord('youtube_playlist');
  const videos = playlistRecord?.data?.videos || [];

  document.querySelectorAll('[data-roll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!videos.length) return;
      const current = document.querySelector('[data-track]')?.href || '';
      let next = videos[Math.floor(Math.random() * videos.length)];
      while (videos.length > 1 && `https://www.youtube.com/watch?v=${next.id}` === current) {
        next = videos[Math.floor(Math.random() * videos.length)];
      }
      applyTrack({
        labelKey: 'track.video',
        text: `${next.channel} — ${next.title}`,
        href: `https://www.youtube.com/watch?v=${next.id}`,
        subKey: 'track.randomHint',
      });
    });
  });
}

async function renderHits() {
  const el = document.querySelector('[data-hits]');
  if (!el) return;
  try {
    const res = await fetch(`${pb.baseUrl}/api/hits`, { method: 'POST' });
    if (!res.ok) return;
    const { count } = await res.json();
    // текст ставит animateHits() — она запускается уже после исчезновения лоадера,
    // чтобы отсчёт был виден, а не отыгрывал вхолостую под загрузочным экраном
    el.dataset.target = String(count);
  } catch {
    // офлайн или PocketBase недоступен — просто не показываем счётчик
  }
}

function animateHits() {
  const el = document.querySelector('[data-hits]');
  if (!el || !el.dataset.target) return;
  const target = Number(el.dataset.target);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = String(target).padStart(7, '0');
    return;
  }

  const duration = 650;
  const startedAt = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = String(Math.round(target * eased)).padStart(7, '0');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function stampSeal() {
  // сама печать всегда в первом экране, так что «появление» для неё — это
  // момент, когда исчезает загрузочный экран, а не скролл до неё
  const seal = document.querySelector('.k-seal');
  if (seal) seal.classList.add('is-stamped');
}

function wireTiltCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.k-still, .k-ticket').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translate(-2px, -2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function formatDateTime(pbDate) {
  if (!pbDate) return '';
  const date = new Date(pbDate.replace(' ', 'T'));
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${dd} ${MONTHS_SHORT[getLang()][date.getMonth()]} ${date.getFullYear()}, ${hh}:${mm}`;
}

function createGuestEntry(entry) {
  const el = document.createElement('div');
  el.className = 'k-guest-entry';

  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = entry.name;

  const msg = document.createElement('div');
  msg.className = 'msg';
  msg.textContent = entry.message;

  const date = document.createElement('div');
  date.className = 'date';
  date.textContent = formatDateTime(entry.created);

  el.append(name, msg, date);
  return el;
}

let guestEntries = [];

function renderGuestList() {
  const list = document.querySelector('[data-guestbook-list]');
  const countEl = document.querySelector('[data-guestbook-count]');
  if (!list) return;

  list.replaceChildren();
  if (!guestEntries.length) {
    const empty = document.createElement('p');
    empty.className = 'k-guest-empty';
    empty.textContent = t('guest.empty');
    list.appendChild(empty);
  } else {
    guestEntries.forEach((entry) => list.appendChild(createGuestEntry(entry)));
  }
  if (countEl) countEl.textContent = t('guest.count', { n: String(guestEntries.length).padStart(2, '0') });
}

async function renderGuestbook() {
  const list = document.querySelector('[data-guestbook-list]');
  const form = document.querySelector('[data-guestbook-form]');
  if (!list || !form) return;

  try {
    guestEntries = await pb.collection('guestbook').getFullList({ sort: '-created' });
  } catch {
    // PocketBase недоступен — список останется пустым
  }
  renderGuestList();

  const statusEl = document.querySelector('[data-guestbook-status]');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const message = String(formData.get('message') || '').trim();
    if (!message) return;

    submitBtn.disabled = true;
    if (statusEl) { statusEl.textContent = t('guest.sending'); statusEl.classList.remove('is-error'); }

    try {
      const res = await fetch(`${pb.baseUrl}/api/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          message,
          hp_field: formData.get('hp_field'),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'request failed');

      if (data.entry) {
        guestEntries = [data.entry, ...guestEntries];
        renderGuestList();
      }
      form.reset();
      if (statusEl) statusEl.textContent = t('guest.sent');
    } catch {
      if (statusEl) {
        statusEl.textContent = t('guest.error');
        statusEl.classList.add('is-error');
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function hideLoader(startedAt) {
  const loader = document.querySelector('[data-loader]');
  if (!loader) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minDuration = reduceMotion ? 150 : 900;
  const elapsed = performance.now() - startedAt;
  const delay = Math.max(0, minDuration - elapsed);

  setTimeout(() => {
    loader.classList.add('is-done');
    animateHits();
    stampSeal();
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    if (reduceMotion) loader.remove();
  }, delay);
}

function wireLangSwitch() {
  document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
    btn.addEventListener('click', () => cycleLang());
  });

  onLangChange(() => {
    renderSekki();
    applyProjectsText();
    applyFilmText();
    if (tapeState) applyTrack(tapeState);
    renderGuestList();
  });
}

async function initApp() {
  const startedAt = performance.now();

  initI18n();
  renderFooter();
  renderSekki();
  wireTiltCards();
  wireLangSwitch();

  await Promise.allSettled([
    renderProjects(),
    renderHits(),
    renderFilm(),
    renderTapeCard(),
    renderGuestbook(),
  ]);

  hideLoader(startedAt);
}

initApp();
