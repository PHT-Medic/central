FROM node:16-alpine

RUN mkdir -p /usr/src/project

WORKDIR /usr/src/project/

COPY . .

RUN rm -rf ./node-modules

RUN npm ci
RUN npm run bootstrap
RUN npm run build

RUN touch packages/backend/.env
RUN touch packages/frontend/.env
RUN touch packages/realtime/.env
RUN touch packages/result-service/.env

COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["cli", "setup"]
