#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

while getopts t:c: flag
do
    case "${flag}" in
        t) CONTAINER_TAG=${OPTARG};;
        c) CONTAINER_CLI=${OPTARG};;
    esac
done
if [ -z "$CONTAINER_TAG" ]; then
    CONTAINER_TAG="latest"
fi
if [ -z "$CONTAINER_CLI" ]; then
    alias ccli='docker'
else
    alias ccli=$CONTAINER_CLI
fi

echo "Using ${BASH_ALIASES[ccli]} to build container image..."
${BASH_ALIASES[ccli]} build --no-cache -t data_abstraction_platform/website:$CONTAINER_TAG $SCRIPT_DIR
echo "... container complete"