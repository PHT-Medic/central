FROM node:16-alpine

RUN mkdir -p /usr/src/project

WORKDIR /usr/src/project/

COPY . .

RUN rm -rf ./node-modules && \
    npm ci && \
    npm run bootstrap && \
    npm run build && \
    touch packages/backend/api/.env && \
    touch packages/backend/realtime/.env && \
    touch packages/backend/result/.env && \
    touch packages/frontend/ui/.env

COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["cli", "setup"]
