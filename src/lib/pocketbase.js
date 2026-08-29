import PocketBase from 'pocketbase';

// URL к PocketBase из переменных окружения или локальный fallback
const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(pbUrl);
