const STORAGE_KEY = 'lang';
const SUPPORTED = ['ru', 'en', 'ja'];

const dict = {
  ru: {
    'bio.poem': 'Стыдно заниматься искусством если, по ходу<br>Конец не встретишь самоубийством или дуркой<br><br>Делаю сервисы для своих. Заработать на этом не получается.',
    'bio.tags': 'Энтузиаст, вайб-кодер, японофил, мерзавец, подлец, себялюбец, лентяй',
    'social.cap': '連絡先 · где меня найти',
    'memo.caption': 'wip',
    'media.subtitle': 'кино и музыка',
    'media.note': 'обновляется само',
    'tape.reroll': '▶ перемотать',
    'guest.name.label': 'имя (необязательно)',
    'guest.name.placeholder': 'аноним',
    'guest.message.label': 'сообщение',
    'guest.message.placeholder': 'что скажешь',
    'guest.hp.label': 'сайт',
    'guest.submit': 'оставить запись',
    'guest.empty': 'записей пока нет — будь первым',
    'foot.sources': 'исходники',
    'foot.guestbook': 'гостевая книга',
    'foot.madeAtHome': 'сделано дома · 自宅にて',
    'projects.empty': 'проектов пока нет',
    'projects.count': '{n} позиций · список открыт',
    'projects.todoDesc': '— одно предложение о проекте —',
    'film.watched': 'смотрел',
    'track.now': 'сейчас · last.fm',
    'track.last': 'последнее · last.fm',
    'track.playlist': 'плейлист · youtube',
    'track.pressReroll': 'нажми «перемотать»',
    'track.lastfmUnavailable': 'live-трек с last.fm недоступен',
    'track.rerollHint': 'перемотать → случайное видео из плейлиста',
    'track.video': 'видео · youtube',
    'track.randomHint': 'случайное видео из плейлиста',
    'guest.count': '{n} записей',
    'guest.sending': 'отправляю…',
    'guest.sent': 'записано.',
    'guest.error': 'не получилось отправить, попробуй ещё раз',
    'sekki.sentenceWithGloss': 'Сейчас — «{jp}», {gloss}.',
    'sekki.sentenceNoGloss': 'Сейчас — «{jp}».',
  },
  en: {
    'bio.poem': "It's shameful to make art if, along the way,<br>you don't meet your end by suicide or the madhouse<br><br>I build things for people I know. Making money off it never works out.",
    'bio.tags': 'Enthusiast, vibe-coder, japanophile, scoundrel, cad, egotist, sloth',
    'social.cap': '連絡先 · where to find me',
    'memo.caption': 'wip',
    'media.subtitle': 'film & music',
    'media.note': 'updates itself',
    'tape.reroll': '▶ reroll',
    'guest.name.label': 'name (optional)',
    'guest.name.placeholder': 'anon',
    'guest.message.label': 'message',
    'guest.message.placeholder': 'say something',
    'guest.hp.label': 'website',
    'guest.submit': 'leave a note',
    'guest.empty': 'no entries yet — be the first',
    'foot.sources': 'source',
    'foot.guestbook': 'guestbook',
    'foot.madeAtHome': 'made at home · 自宅にて',
    'projects.empty': 'no projects yet',
    'projects.count': '{n} items · list open',
    'projects.todoDesc': '— a one-line description, coming —',
    'film.watched': 'watched',
    'track.now': 'now · last.fm',
    'track.last': 'last played · last.fm',
    'track.playlist': 'playlist · youtube',
    'track.pressReroll': 'press "reroll"',
    'track.lastfmUnavailable': 'live track from last.fm unavailable',
    'track.rerollHint': 'reroll → random video from the playlist',
    'track.video': 'video · youtube',
    'track.randomHint': 'random video from the playlist',
    'guest.count': '{n} entries',
    'guest.sending': 'sending…',
    'guest.sent': 'sent.',
    'guest.error': "couldn't send, try again",
    'sekki.sentenceWithGloss': 'Now — “{jp}”, {gloss}.',
    'sekki.sentenceNoGloss': 'Now — “{jp}”.',
  },
  ja: {
    'bio.poem': '芸術なんてものは、恥ずかしい話<br>自殺か発狂で終わらないなら<br><br>身内のためにサービスを作っている。それで稼げたことはない。',
    'bio.tags': '愛好家、バイブコーダー、日本かぶれ、悪党、卑劣漢、利己主義者、怠け者',
    'social.cap': '連絡先',
    'memo.caption': 'wip',
    'media.subtitle': '映画と音楽',
    'media.note': '自動更新',
    'tape.reroll': '▶ シャッフル',
    'guest.name.label': '名前(任意)',
    'guest.name.placeholder': '名無し',
    'guest.message.label': 'メッセージ',
    'guest.message.placeholder': 'ひとこと',
    'guest.hp.label': 'サイト',
    'guest.submit': '記帳する',
    'guest.empty': 'まだ記帳がない — 一番乗りをどうぞ',
    'foot.sources': 'ソース',
    'foot.guestbook': '芳名録',
    'foot.madeAtHome': '自宅にて',
    'projects.empty': 'プロジェクトはまだありません',
    'projects.count': '{n}件 · 公開中',
    'projects.todoDesc': '— 説明は準備中 —',
    'film.watched': '鑑賞',
    'track.now': '再生中 · last.fm',
    'track.last': '最近再生 · last.fm',
    'track.playlist': 'プレイリスト · youtube',
    'track.pressReroll': '「シャッフル」を押して',
    'track.lastfmUnavailable': 'last.fmのライブ情報が取得できません',
    'track.rerollHint': 'シャッフル → プレイリストからランダム再生',
    'track.video': '動画 · youtube',
    'track.randomHint': 'プレイリストからランダム再生',
    'guest.count': '{n}件',
    'guest.sending': '送信中…',
    'guest.sent': '記帳しました。',
    'guest.error': '送信に失敗しました。もう一度お試しください',
    'sekki.sentenceWithGloss': '只今 — 「{jp}」。',
    'sekki.sentenceNoGloss': '只今 — 「{jp}」。',
  },
};

export const MONTHS_SHORT = {
  ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

const LANG_LABEL = { ru: 'RU', en: 'EN', ja: '日' };

function detectLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED.includes(saved)) return saved;
  const nav = (navigator.language || 'ru').slice(0, 2);
  if (nav === 'ja') return 'ja';
  if (nav === 'en') return 'en';
  return 'ru';
}

let currentLang = detectLang();
const listeners = new Set();

export function getLang() {
  return currentLang;
}

export function langLabel(lang = currentLang) {
  return LANG_LABEL[lang];
}

export function t(key, vars) {
  let str = dict[currentLang]?.[key] ?? dict.ru[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, v);
  }
  return str;
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-lang-switch]').forEach((el) => {
    el.textContent = langLabel();
  });
}

export function onLangChange(fn) {
  listeners.add(fn);
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === currentLang) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  applyStaticTranslations();
  listeners.forEach((fn) => fn(lang));
}

export function cycleLang() {
  const next = SUPPORTED[(SUPPORTED.indexOf(currentLang) + 1) % SUPPORTED.length];
  setLang(next);
}

export function initI18n() {
  applyStaticTranslations();
}
