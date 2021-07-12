#!/bin/bash

set -e

cd /usr/src/app

exec npm run "$@"
