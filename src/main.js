import './style.css';
import { getProjects } from './services/projects.js';

// Пример получения проектов (из PocketBase или мок-данных)
async function initApp() {
  const { projects, isLive } = await getProjects();
  console.log(`[App] Загружено проектов: ${projects.length} (Источник: ${isLive ? 'PocketBase' : 'Mock Data'})`, projects);
}

initApp();
