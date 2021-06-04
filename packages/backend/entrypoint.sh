#!/bin/bash

set -e

cd /usr/src/app

if [ "$1" = 'start' ]; then
    exec npm run dev
fi

if [ "$1" = 'setup' ]; then
    exec npm run setup
fi

exec npm run "$1"
