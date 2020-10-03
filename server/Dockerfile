FROM node:12.18.3-slim

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 8000

CMD node dist/index.js