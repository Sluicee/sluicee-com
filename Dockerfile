FROM node:20-alpine

WORKDIR /app

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
