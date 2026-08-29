import { pb } from '../lib/pocketbase.js';
import { mockProjects } from '../data/mockProjects.js';

const COLLECTION_NAME = 'projects';

/**
 * Получить список всех проектов из PocketBase (или моковые данные при ошибке подключения).
 * @param {Object} [options] - Опции сортировки и фильтрации PocketBase
 * @returns {Promise<{ projects: Array, isLive: boolean }>}
 */
export async function getProjects(options = { sort: '-created' }) {
  try {
    const records = await pb.collection(COLLECTION_NAME).getFullList({
      sort: options.sort || '-created',
      requestKey: null // отключение автоотмены запросов при быстром перезапросе
    });

    if (records && records.length > 0) {
      return {
        projects: records.map(normalizeProject),
        isLive: true
      };
    }

    // Если коллекция пока пустая, возвращаем моковые данные
    return {
      projects: mockProjects,
      isLive: false
    };
  } catch (error) {
    console.warn('[Projects Service] Не удалось загрузить проекты из PocketBase. Используются локальные данные:', error.message);
    return {
      projects: mockProjects,
      isLive: false
    };
  }
}

/**
 * Получить полный URL к загруженному файлу изображения в PocketBase.
 * @param {Object} project - Объект проекта
 * @param {string} [thumb] - Размер превью (например, '100x100' или '400x300')
 * @returns {string} URL изображения
 */
export function getProjectImageUrl(project, thumb = '') {
  if (!project || !project.image) {
    return '';
  }

  // Если это уже внешняя ссылка или data:url
  if (typeof project.image === 'string' && (project.image.startsWith('http') || project.image.startsWith('/'))) {
    return project.image;
  }

  try {
    return pb.files.getURL(project, project.image, thumb ? { thumb } : undefined);
  } catch {
    return '';
  }
}

/**
 * Нормализация объекта проекта из PocketBase.
 */
function normalizeProject(record) {
  return {
    id: record.id,
    title: record.title || '',
    description: record.description || '',
    tags: Array.isArray(record.tags)
      ? record.tags
      : typeof record.tags === 'string' && record.tags.trim()
        ? record.tags.split(',').map(t => t.trim())
        : [],
    link: record.link || '',
    github: record.github || '',
    featured: Boolean(record.featured),
    image: record.image || record.cover || '',
    created: record.created,
    updated: record.updated,
    _raw: record
  };
}
