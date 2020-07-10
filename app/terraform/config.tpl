#!/bin/bash
set -e

IP=$(curl http://checkip.amazonaws.com)

cd /jitsi/docker

# Config
cp env.example .env
./gen-passwords.sh
sed -i.bak \
  -e "s/HTTP_PORT=8000/HTTP_PORT=80/g" \
  -e "s/HTTPS_PORT=8443/HTTPS_PORT=443/g" \
  -e "s/#PUBLIC_URL=https:\/\/meet.example.com/PUBLIC_URL=https:\/\/${hostname}/g" \
  -e "s/#DOCKER_HOST_ADDRESS=192.168.1.1/DOCKER_HOST_ADDRESS=$IP/g" \
  -e "s/JVB_STUN_SERVERS/#JVB_STUN_SERVERS/g" \
  -e "s/#ENABLE_LETSENCRYPT/ENABLE_LETSENCRYPT/g" \
  -e "s/#LETSENCRYPT_DOMAIN=meet.example.com/LETSENCRYPT_DOMAIN=${hostname}/g" \
  -e "s/#LETSENCRYPT_EMAIL=alice@atlanta.net/LETSENCRYPT_EMAIL=${email_address}/g" \
  -e "s/#ENABLE_HTTP_REDIRECT=1/ENABLE_HTTP_REDIRECT=1/g" \
  .env

# Fix permissions and start server
chown -R jitsi:jitsi /jitsi
sudo -H -u jitsi bash -c "docker-compose up -d"
