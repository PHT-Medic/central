#!/bin/sh

docker-compose -f ../../docker-compose.yml run --service-ports backend setup
