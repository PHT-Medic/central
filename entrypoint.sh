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
    realtime) PACKAGE=realtime;;
    result-service) PACKAGE=result-service;;
    cli) PACKAGE=cli;;
    *) echo "Unknown package: ${1}";;
esac

shift

if [[ -z "${PACKAGE}" ]]; then
    printf 'Usage:\n'
    printf '  api <command>\n    Start or run the api service in dev mode.\n'
    printf '  ui <command>\n    Start or run the ui in dev mode.\n'
    printf '  realtime<command>\n    Start or run the realtime service in dev mode.\n'
    printf '  result<command>\n    Start or run the result service in dev mode.\n'
    printf '  cli <command>\n    Run a CLI command.\n'
    exit 0
fi

case "${PACKAGE}" in
    api)
        exec npm run "$1" --workspace=packages/backend/api
        ;;
    ui)
        export NUXT_HOST=0.0.0.0
        export NUXT_PORT=3000
        exec npm run "$1" --workspace=packages/frontend/ui
        ;;
    realtime)
        exec npm run "$1" --workspace=packages/backend/realtime
        ;;
    result)
        exec npm run "$1" --workspace=packages/backend/result
        ;;
    cli)
        exec npm run cli --workspace=packages/backend/api -- "$@"
        ;;
esac


