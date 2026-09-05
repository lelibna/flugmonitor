FROM node:22.23-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

CMD [ "node"]