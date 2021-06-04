FROM node:15-alpine

RUN mkdir -p /usr/src/app
<<<<<<< HEAD
=======
RUN mkdir -p /usr/src/app/writable
>>>>>>> result-service/master

WORKDIR /usr/src/app

COPY package.json ./package.json

COPY . .

RUN rm -rf ./node-modules
<<<<<<< HEAD
RUN rm -rf ./.nuxt

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

RUN npm install && \
  npm run build

CMD ["npm", "run", "start"]
=======

RUN apk --no-cache add --virtual builds-deps build-base python && \
  npm install

RUN touch .env

COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["start"]
>>>>>>> result-service/master
