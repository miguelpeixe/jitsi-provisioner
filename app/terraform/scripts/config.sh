#!/bin/bash
set -e

IP=$(curl http://checkip.amazonaws.com)

cd /jitsi/docker

# Jitsi env
cp env.example .env
./gen-passwords.sh
sed -i.bak \
  -e "s/#PUBLIC_URL=https:\/\/meet.example.com/PUBLIC_URL=https:\/\/${hostname}/g" \
  -e "s/#DOCKER_HOST_ADDRESS=192.168.1.1/DOCKER_HOST_ADDRESS=$IP/g" \
  -e "s/JVB_STUN_SERVERS/#JVB_STUN_SERVERS/g" \
  .env

# Fix permissions and start server
chown -R jitsi:jitsi /jitsi
sudo -H -u jitsi bash -c "docker-compose up -d"

# Stop nginx
systemctl stop nginx

# Get certificate
if [[ ! -f /etc/letsencrypt/live/${hostname}/fullchain.pem ]]; then
  if ! certbot-auto \
        certonly \
        --no-bootstrap \
        --no-self-upgrade \
        --noninteractive \
        --standalone \
        --preferred-challenges http \
        -d ${hostname} \
        --agree-tos \
        --email ${email_address} ; then
      echo "Failed to obtain a certificate from the Let's Encrypt CA."
      exit 1
  fi
fi

# Nginx conf
echo "${nginx}" | base64 --decode > /etc/nginx/conf.d/jitsi.conf

# Certificate renew cron
echo "${letsencrypt}" | base64 --decode > /etc/cron.hourly/letsencrypt-renew
chmod +x /etc/cron.hourly/letsencrypt-renew

# Uncomment-out ssl certs and set hostname
sed -i \
  -e "s/JITSI_HOSTNAME/${hostname}/g" \
  -e "s/#ssl_certificate/ssl_certificate/g" \
  /etc/nginx/conf.d/jitsi.conf

# Start nginx
systemctl start nginx
