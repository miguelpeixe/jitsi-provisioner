#!/bin/bash
set -e

IP=$(curl http://checkip.amazonaws.com)
CERTIFICATE=${certificate}

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

# Setup instance api
docker pull miguelpeixe/jitsi-provisioner-instance-api:latest
docker run -d \
  --name instance-api \
  -v /etc/letsencrypt:/data/letsencrypt:ro \
  -v /jitsi/.jitsi-meet-cfg:/data/jitsi:ro \
  -p 8001:8001 \
  miguelpeixe/jitsi-provisioner-instance-api:latest

# Nginx conf
echo "${nginx}" | base64 --decode > /etc/nginx/conf.d/jitsi.conf

# Certificate renew cron
echo "${letsencrypt_renew}" | base64 --decode > /etc/cron.hourly/letsencrypt-renew
chmod +x /etc/cron.hourly/letsencrypt-renew

# Uncomment-out ssl certs, set hostname and api key
sed -i \
  -e "s/JITSI_HOSTNAME/${hostname}/g" \
  -e "s/INSTANCE_API_KEY/${instance_api_key}/g" \
  -e "s/#ssl_certificate/ssl_certificate/g" \
  /etc/nginx/conf.d/jitsi.conf

# Stop nginx
systemctl stop nginx

# Verify existing LetsEncrypt certificate
if [[ ! -z $CERTIFICATE ]]; then
  mkdir -p /etc/letsencrypt
  cd /tmp
  echo "$CERTIFICATE" | base64 --decode > ./certificate.tar.gz
  tar zxvf certificate.tar.gz
  mv certificates/* /etc/letsencrypt
  rm -r /tmp/certificate.tar.gz certificates

  # Start nginx before renew script
  systemctl start nginx

  # Attempt renew
  /etc/cron.hourly/letsencrypt-renew

# Get new certificate from LetsEncrypt
else
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
  # Start nginx
  systemctl start nginx
fi
