FROM node:12.18.3-slim

ENV WORK_DIR /app
RUN mkdir $WORK_DIR

WORKDIR $WORK_DIR

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 8000
EXPOSE 8001

CMD node dist/index.js