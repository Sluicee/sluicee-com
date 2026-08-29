import './style.css';
import { pb } from './lib/pocketbase.js';
import { getProjects } from './services/projects.js';

// 24 сэкки — настоящий сегмент традиционного календаря по дате в браузере.
const SEKKI = [
  [0, 4, '小寒', 'малые холода'], [0, 20, '大寒', 'разгар холода'],
  [1, 4, '立春', 'первый вдох весны'], [1, 19, '雨水', 'снег становится дождём'],
  [2, 5, '啓蟄', 'просыпаются насекомые'], [2, 20, '春分', 'весеннее равноденствие'],
  [3, 5, '清明', 'воздух ясен'], [3, 20, '穀雨', 'дожди для всходов'],
  [4, 5, '立夏', 'начало лета'], [4, 21, '小満', 'всё понемногу наливается'],
  [5, 5, '芒種', 'пора сева'], [5, 21, '夏至', 'летнее солнцестояние'],
  [6, 7, '小暑', 'жара нарастает'], [6, 22, '大暑', 'разгар жары'],
  [7, 7, '立秋', 'первый вдох осени'], [7, 23, '処暑', 'жар отступает'],
  [8, 7, '白露', 'белая роса'], [8, 23, '秋分', 'осеннее равноденствие'],
  [9, 8, '寒露', 'холодная роса'], [9, 23, '霜降', 'первый иней'],
  [10, 7, '立冬', 'начало зимы'], [10, 22, '小雪', 'первый снег'],
  [11, 7, '大雪', 'снегопады'], [11, 21, '冬至', 'зимнее солнцестояние']
];
const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const MONTHS_RU_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const LASTFM_USER = 'Sluicee1';
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

function renderSekki() {
  const now = new Date();
  let current = SEKKI[0];
  for (const entry of SEKKI) {
    const [month, day] = entry;
    if (new Date(now.getFullYear(), month, day) <= now) current = entry;
  }
  const [, , jp, ru] = current;
  const dd = String(now.getDate()).padStart(2, '0');

  document.querySelectorAll('[data-sekki-jp]').forEach((el) => { el.textContent = jp; });
  document.querySelectorAll('[data-sekki-ru]').forEach((el) => { el.textContent = ru; });
  document.querySelectorAll('[data-postmark-date]').forEach((el) => {
    el.textContent = `${dd}. ${ROMAN_MONTHS[now.getMonth()]}`;
  });
  document.querySelectorAll('[data-sekki-sentence]').forEach((el) => {
    el.textContent = `Сейчас — «${jp}», ${ru}.`;
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
  description.textContent = hasDescription ? project.description : '— одно предложение о проекте —';

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

async function renderProjects() {
  const list = document.querySelector('[data-projects-list]');
  const countEl = document.querySelector('[data-projects-count]');
  if (!list) return;

  const { projects } = await getProjects();

  list.replaceChildren();
  if (!projects.length) {
    const empty = document.createElement('p');
    empty.className = 'k-projects-empty';
    empty.textContent = 'проектов пока нет';
    list.appendChild(empty);
  } else {
    projects.forEach((project, index) => {
      list.appendChild(createProjectCard(project, index));
    });
  }

  if (countEl) {
    const n = String(projects.length).padStart(2, '0');
    countEl.textContent = `${n} позиций · список открыт`;
  }
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
  return `${String(d).padStart(2, '0')} ${MONTHS_RU_SHORT[m - 1]} ${y}`;
}

async function fetchMediaRecord(key) {
  try {
    return await pb.collection('media').getFirstListItem(`key = "${key}"`);
  } catch {
    return null;
  }
}

async function renderFilm() {
  const record = await fetchMediaRecord('film');
  if (!record || !record.data) return;
  const film = record.data;

  document.querySelectorAll('[data-film-link]').forEach((el) => { el.href = film.link || el.href; });

  const shot = document.querySelector('[data-film-shot]');
  if (shot && film.image) {
    shot.style.backgroundImage = `url("${film.image}")`;
  }

  const reviewEl = document.querySelector('[data-film-review]');
  if (reviewEl) reviewEl.textContent = film.review || `«${film.filmTitle}»`;

  const watchedEl = document.querySelector('[data-film-watched]');
  if (watchedEl) watchedEl.textContent = `смотрел · ${formatDate(film.watchedDate)}`;

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
      label: nowPlaying ? 'сейчас · last.fm' : 'последнее · last.fm',
      text: `${track.artist?.['#text'] || ''} — ${track.name || ''}`,
      href: track.url || 'https://www.last.fm/user/' + LASTFM_USER,
    };
  } catch {
    return null;
  }
}

function applyTrack(track) {
  const label = document.querySelector('[data-track-label]');
  const link = document.querySelector('[data-track]');
  const sub = document.querySelector('[data-track-sub]');
  if (label) label.textContent = track.label;
  if (link) {
    link.textContent = track.text;
    link.href = track.href;
  }
  if (sub) sub.textContent = track.sub || '';
}

async function renderTapeCard() {
  const lastfmTrack = await fetchLastfmTrack();
  if (lastfmTrack) {
    applyTrack({ ...lastfmTrack, sub: 'перемотать → случайное видео из плейлиста' });
  } else {
    applyTrack({ label: 'плейлист · youtube', text: 'нажми «перемотать»', href: '#', sub: 'live-трек с last.fm недоступен' });
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
        label: 'видео · youtube',
        text: `${next.channel} — ${next.title}`,
        href: `https://www.youtube.com/watch?v=${next.id}`,
        sub: 'случайное видео из плейлиста',
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
    el.textContent = String(count).padStart(7, '0');
  } catch {
    // офлайн или PocketBase недоступен — просто не показываем счётчик
  }
}

async function initApp() {
  renderSekki();
  await renderProjects();
  renderHits();
  renderFilm();
  renderTapeCard();
}

initApp();
