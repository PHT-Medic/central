#!/bin/bash

#
# Copyright (c) 2021-2021.
# Author Peter Placzek (tada5hi)
# For the full copyright and license information,
# view the LICENSE file that was distributed with this source code.
#

set -e

BASE_DIR=/usr/src/project

cd "${BASE_DIR}"

case "${1}" in
    backend) PACKAGE=backend;;
    frontend) PACKAGE=frontend;;
    *) echo "Unknown package: ${1}";;
esac

shift

if [[ -z "${PACKAGE}" ]]; then
    printf 'Usage:\n'
    printf '  frontend <command>\n    Start or run the frontend app in dev mode.\n'
    printf '  backend <command>\n    Start or run the back app in dev mode.\n'
    exit 0
fi

case "${PACKAGE}" in
    backend)
        if [[ -z "$2" ]]; then
            exec npm run "$@" --workspace=packages/backend
        else
            cd "${BASE_DIR}packages/backend"
            exec node dist/cli/index.js "$@"
        fi
        ;;
    frontend)
        export NUXT_HOST=0.0.0.0
        export NUXT_PORT=3000
        exec npm run "$1" --workspace=packages/frontend
        ;;
esac


