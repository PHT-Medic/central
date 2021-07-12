FROM node:15-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json ./package.json

COPY . .

RUN rm -rf ./node-modules
RUN rm -rf ./.nuxt

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

RUN npm install && \
  npm run build

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["start"]
