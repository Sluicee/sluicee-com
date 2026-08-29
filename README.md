# sluicee.com

Сайт-портфолио на Vite с интеграцией селф-хост бэкенда **PocketBase**.

---

## Быстрый старт

### 1. Локальная разработка (без Docker)

```bash
# Установка зависимостей
npm install

# Запуск локального dev-сервера фронтенда
npm run dev
```

> **Примечание:** Если PocketBase еще не запущен, сервис автоматически использует моковые данные из `src/data/mockProjects.js`.

---

### 2. Запуск через Docker Compose (Фронтенд + PocketBase)

```bash
# Сборка и запуск контейнеров в фоновом режиме
docker compose up -d --build

# Остановка контейнеров
docker compose down
```

* **Фронтенд:** [http://localhost:3000](http://localhost:3000)
* **PocketBase API & Админка:** [http://localhost:8090/_/](http://localhost:8090/_/)

---

## Настройка PocketBase для карточек проектов

1. Откройте веб-админку: [http://localhost:8090/_/](http://localhost:8090/_/)
2. Создайте учетную запись администратора при первом входе.
3. Перейдите в **Collections** ➔ **New collection**:
   * Название коллекции: `projects`
   * Тип: **Base collection**
4. Добавьте поля:
   * `title` (тип: **Plain text**, обязательное)
   * `description` (тип: **Plain text** или **Rich Editor**)
   * `link` (тип: **URL**)
   * `github` (тип: **URL**)
   * `tags` (тип: **JSON** или **Plain text**)
   * `image` (тип: **File**, типы: jpg, png, svg, webp)
   * `featured` (тип: **Bool**)
5. В разделе **API Rules** коллекции `projects`:
   * Разрешите публичное чтение: оставьте поле **List/Search Rule** и **View Rule** пустыми (или поставьте галочку `Unlock`), чтобы гости могли просматривать карточки без авторизации.
6. Нажмите **Create** и добавьте свои первые карточки проектов!

---

## Использование в коде

### Клиент PocketBase
Модуль инициализирован в [`src/lib/pocketbase.js`](./src/lib/pocketbase.js).

### Сервис работы с проектами
В [`src/services/projects.js`](./src/services/projects.js) доступны готовые функции:
```javascript
import { getProjects, getProjectImageUrl } from './services/projects.js';

// Получение списка проектов (с автоматическим fallback на моки)
const { projects, isLive } = await getProjects();

// Получение URL изображения для карточки
const imageUrl = getProjectImageUrl(project);
```

---

## Доступные скрипты

* `npm run dev` — запуск локального dev-сервера Vite
* `npm run build` — продакшн сборка в папку `dist`
* `npm run preview` — локальный предпросмотр сборки
