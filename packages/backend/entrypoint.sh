#!/bin/bash

set -e

cd /usr/src/app

if [ "$1" = "dev" ]; then
    exec npm run dev
fi

if [ "$1" = "dev-watch" ]; then
    exec npm run dev-watch
fi

if [ "$1" = "start" ]; then
    exec node dist/index.js
fi

exec ts-node src/cli/index.ts "$@"
