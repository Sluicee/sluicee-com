import { nameToEmoji } from 'gemoji';

/**
 * Популярные эмодзи для быстрой вставки в гостевой книге
 */
export const POPULAR_EMOJIS = [
  { emoji: '🍄', code: ':mushroom:', title: 'mushroom' },
  { emoji: '🌸', code: ':cherry_blossom:', title: 'cherry blossom' },
  { emoji: '🍵', code: ':tea:', title: 'tea' },
  { emoji: '🍙', code: ':rice_ball:', title: 'rice ball' },
  { emoji: '🍣', code: ':sushi:', title: 'sushi' },
  { emoji: '🍜', code: ':ramen:', title: 'ramen' },
  { emoji: '👾', code: ':space_invader:', title: 'space invader' },
  { emoji: '✨', code: ':sparkles:', title: 'sparkles' },
  { emoji: '🐱', code: ':cat:', title: 'cat' },
  { emoji: '❤️', code: ':heart:', title: 'heart' },
  { emoji: '🔥', code: ':fire:', title: 'fire' },
  { emoji: '🎉', code: ':tada:', title: 'tada' },
];

/**
 * Заменяет шорткоды вида :mushroom: на соответствующие Unicode эмодзи (🍄).
 * Если шорткод не найден в словаре, он остаётся без изменений.
 *
 * @param {string} text Входной текст
 * @returns {string} Текст с подставленными Unicode эмодзи
 */
export function replaceEmojiShortcodes(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, rawCode) => {
    const code = rawCode.toLowerCase();
    return Object.prototype.hasOwnProperty.call(nameToEmoji, code) ? nameToEmoji[code] : match;
  });
}
