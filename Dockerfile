# Единый образ: клиентский сайт (/) и админ-панель (/admin) за одним nginx.
# Контекст сборки — корень репозитория (нужны и frontend/, и admin/).

# 1) Сборка сайта
FROM node:22-alpine AS build-frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2) Сборка админки (base=/admin/ задан в admin/vite.config.ts)
FROM node:22-alpine AS build-admin
WORKDIR /app
COPY admin/package.json admin/package-lock.json ./
RUN npm install
COPY admin/ ./
RUN npm run build

# 3) Раздача обоих SPA одним nginx
FROM nginx:1.27-alpine
COPY --from=build-frontend /app/dist /usr/share/nginx/html
COPY --from=build-admin /app/dist /usr/share/nginx/html/admin
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
