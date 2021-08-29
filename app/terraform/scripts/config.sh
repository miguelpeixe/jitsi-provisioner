#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive

IP=$(curl http://checkip.amazonaws.com)
GET_CERTIFICATE=true
CERTIFICATE=${certificate}
JITSI_RECORDING=${jitsi_recording}
REBOOT=false

# Setup instance api
docker pull miguelpeixe/jitsi-provisioner-instance-api:latest && \
  docker run -d \
    --name instance-api \
    -v /etc/letsencrypt:/data/letsencrypt:ro \
    -v /jitsi/data:/data/jitsi:ro \
    -p 8001:8001 \
    -e "JWT_SECRET=${instance_api_secret}" \
    --restart unless-stopped \
    miguelpeixe/jitsi-provisioner-instance-api:latest &

# Setup Jitsi
cd /jitsi/docker

# Jitsi env
chown -R jitsi:jitsi /jitsi

COMPOSE_VARS="-f docker-compose.yml"
UP_VARS="-d"

cp env.example .env
./gen-passwords.sh
sed -i \
  -e "s/CONFIG=~\/.jitsi-meet-cfg/CONFIG=\/jitsi\/data/g" \
  -e "s/#PUBLIC_URL=https:\/\/meet.example.com/PUBLIC_URL=https:\/\/${hostname}/g" \
  -e "s/#DOCKER_HOST_ADDRESS=192.168.1.1/DOCKER_HOST_ADDRESS=$IP/g" \
  -e "s/JVB_STUN_SERVERS/#JVB_STUN_SERVERS/g" \
  .env

echo "Jitsi recording: $JITSI_RECORDING"

if [ $JITSI_RECORDING = true ]; then
  COMPOSE_VARS="$COMPOSE_VARS -f jibri.yml"
  sed -i.bak \
  -e "s/#ENABLE_RECORDING/ENABLE_RECORDING/g" \
  .env

  # Needs reboot if alsa-loopback is not setup
  if [[ ! $(lsmod | grep snd_aloop) ]]; then
    UP_VARS="--no-start"
    REBOOT=true
  fi
fi

sudo -H -u jitsi bash -c "docker-compose $COMPOSE_VARS up $UP_VARS"

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

# Verify existing LetsEncrypt certificate
if [[ ! -z $CERTIFICATE ]]; then
  echo "Attempting existing certificate"
  if mkdir -p /etc/letsencrypt && \
      cd /tmp && \
      echo "$CERTIFICATE" | base64 --decode > ./certificate.tar.gz && \
      tar zxvf certificate.tar.gz && \
      mv certificates/* /etc/letsencrypt && \
      rm -r /tmp/certificate.tar.gz /tmp/certificates && \
      systemctl reload nginx && \
      /etc/cron.hourly/letsencrypt-renew ; then
    GET_CERTIFICATE=false
  fi
fi

# Get new certificate from LetsEncrypt
if [ $GET_CERTIFICATE = true ]; then
  echo "Requesting new certificate"

  # Stop nginx for standalone mode
  systemctl stop nginx

  if ! sudo docker run --rm --name certbot \
        -v /etc/letsencrypt:/etc/letsencrypt \
        -v /var/lib/letsencrypt:/var/lib/letsencrypt \
        -p 80:80 \
        certbot/certbot:latest certonly \
        --noninteractive \
        --standalone \
        --preferred-challenges http \
        -d ${hostname} \
        --agree-tos \
        --email ${email_address} ; then
      echo "Failed to obtain a certificate from the Let's Encrypt CA."
      exit 1
  fi
  # Start nginx if no reboot is scheduled
  if [ $REBOOT = false ]; then
    systemctl start nginx
  fi
fi

wait

if [ $REBOOT = true ]; then
  echo "${start_jitsi}" | base64 --decode > /usr/local/bin/start-jitsi
  chmod +x /usr/local/bin/start-jitsi
  echo "@reboot root /usr/local/bin/start-jitsi \"$COMPOSE_VARS\" >> /tmp/start-jitsi-cron.log 2>&1" > /etc/cron.d/jitsi
  reboot now
fi
