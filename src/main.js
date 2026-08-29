import './style.css';
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

// TODO: заменить на коллекцию PocketBase со ссылками на youtube-видео,
// когда появится «случайный трек» из реального плейлиста.
const TRACKS = [
  'toe — Goodbye',
  'toe — Grand Deca Trance',
  'hitsujibungaku — more than words',
  'Ling tosite Sigure — unravel',
  'Ling tosite Sigure — abnormalize'
];

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

function wireTrackRoll() {
  document.querySelectorAll('[data-roll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const host = btn.closest('.k-tape-card');
      const out = host && host.querySelector('[data-track]');
      if (!out) return;
      let next = out.textContent.trim();
      while (next === out.textContent.trim() && TRACKS.length > 1) {
        next = TRACKS[Math.floor(Math.random() * TRACKS.length)];
      }
      out.textContent = next;
    });
  });
}

async function initApp() {
  renderSekki();
  wireTrackRoll();
  await renderProjects();
}

initApp();
