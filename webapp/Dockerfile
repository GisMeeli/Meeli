FROM node:12.18.3-slim AS build-stage

ENV WORK_DIR /app
RUN mkdir $WORK_DIR

WORKDIR $WORK_DIR

COPY package*.json ./
RUN npm i
COPY . .

ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration $configuration

RUN npm run build

# nginx deployment starts here
FROM nginx:latest as run-stage

COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]