#!/bin/bash
set -e

echo "Waiting docker to be available"
while ! pgrep -f docker; do
  sleep 1
done

sleep 2

echo "Starting jitsi"
sudo -H -u jitsi bash -c "cd /jitsi/docker && docker-compose $1 up -d"
