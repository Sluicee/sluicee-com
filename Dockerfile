FROM node:20-alpine

WORKDIR /app

# Публичные адрес PocketBase и last.fm-ключ нужны Vite ещё на этапе сборки —
# import.meta.env.VITE_* инлайнится в бандл прямо здесь, а не в рантайме контейнера.
ARG VITE_POCKETBASE_URL
ARG VITE_LASTFM_API_KEY
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL
ENV VITE_LASTFM_API_KEY=$VITE_LASTFM_API_KEY

# Копируем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходный код и собираем проект
COPY . .
RUN npm run build

# Открываем порт для preview сервера
EXPOSE 3000

# Запускаем Vite preview на всех интерфейсах (хосте)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
