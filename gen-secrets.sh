#!/bin/bash

function generateSecret() {
    openssl rand -hex 16
}

JWT_SECRET=$(generateSecret)

sed -i.bak \
    -e "s#JWT_SECRET=.*#JWT_SECRET=${JWT_SECRET}#g" \
    "$(dirname "$0")/.env"
