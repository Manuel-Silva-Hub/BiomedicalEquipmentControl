# Stage 1: Build
FROM node:18 AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
