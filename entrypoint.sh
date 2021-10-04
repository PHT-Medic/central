#!/bin/bash

#
# Copyright (c) 2021-2021.
# Author Peter Placzek (tada5hi)
# For the full copyright and license information,
# view the LICENSE file that was distributed with this source code.
#

set -e

cd /usr/src/project

if [ "$1" = "frontend-start" ]; then
    export NUXT_HOST=0.0.0.0
    export NUXT_PORT=3000
    exec npm run start --workspace=packages/frontend
elif [ "$1" = "backend-start" ]; then
    exec npm run start --workspace=packages/backend
fi

cd /usr/src/project/packages/backend

exec node dist/cli/index.js "$@"
