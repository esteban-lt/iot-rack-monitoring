FROM oven/bun:1.2.19-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ARG VITE_TB_API_URL=https://thingsboard.cloud
RUN bun run test && bun run build

FROM nginx:1.28-alpine
ENV PORT=80
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
