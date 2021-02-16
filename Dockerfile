FROM node:15-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json ./package.json

COPY . .

RUN rm -rf ./node-modules

RUN apk --no-cache add --virtual builds-deps build-base python && \
  npm install

RUN touch .env

COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["start"]
