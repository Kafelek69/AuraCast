FROM node:20-alpine

WORKDIR /app

# Kopiowanie definicji zależności
COPY package*.json tsconfig.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie kodu źródłowego
COPY src ./src

# Kompilacja TypeScript do katalogu dist/
RUN npm run build

# Porty: 4000 (API & WebSockets), 1935 (RTMP OBS), 8000 (HTTP-FLV)
EXPOSE 4000 1935 8000

ENV NODE_ENV=production

CMD ["npm", "start"]
