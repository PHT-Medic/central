#!/bin/bash

#
# Copyright (c) 2021-2021.
# Author Peter Placzek (tada5hi)
# For the full copyright and license information,
# view the LICENSE file that was distributed with this source code.
#

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
