#!/bin/sh
docker-compose -f ../../docker-compose.yml down
docker-compose -f ../../docker-compose.yml run --service-ports backend dev-watch
