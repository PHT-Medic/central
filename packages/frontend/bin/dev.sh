#!/bin/sh

docker-compose -f ../../docker-compose.yml run --service-ports frontend dev
