#!/bin/bash

COMMAND=""

if [ -f ./.env ]; then
    source ./.env
fi

if [[ -z "${DOCKER_IMAGE_NAME}" || -z "${DOCKER_NETWORK_NAME}" || -z "${DOCKER_NAME}" ]]; then
    echo "DOCKER_IMAGE_NAME, DOCKER_NETWORK_NAME, DOCKER_NAME must be provided in .env file."
    exit 1
fi;

# Pull latest image
docker pull "${DOCKER_IMAGE_NAME}":latest

case "${1}" in
    start) COMMAND=start;;
    stop) COMMAND=stop;;
    *) echo "Unknown command: ${1}";;
esac

function usageAndExit() {
    printf 'Usage:\n'
    printf '  start\n    Start service\n'
    printf '  stop\n    Stop service\n'
    exit 0
}

if [[ -z "${COMMAND}" ]]; then
  usageAndExit
fi

shift

DOCKER_PORT="${DOCKER_PORT:3003}"

case "${COMMAND}" in
    start)
        docker run \
                -d \
                -v ./src:/usr/src/app/src \
                -v ./writable:/usr/src/app/writable \
                -p "${DOCKER_PORT}":3000 \
                --restart=always \
                --network="${DOCKER_NETWORK_NAME}" \
                --env-file ./.env \
                --name="${DOCKER_NAME}" \
                "${DOCKER_IMAGE_NAME}":latest backend start
        ;;
    stop)

        ;;
esac
