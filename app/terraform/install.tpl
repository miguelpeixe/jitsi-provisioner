#!/bin/bash
set -e

IP=$(curl http://checkip.amazonaws.com)

echo -e "nameserver 8.8.8.8\nnameserver 8.8.4.4" >> /etc/resolv.conf

# Disable ipv6
sysctl -w net.ipv6.conf.all.disable_ipv6=1
sysctl -w net.ipv6.conf.default.disable_ipv6=1

echo -e "DefaultLimitNOFILE=65000\nDefaultLimitNPROC=65000\nDefaultTasksMax=65000" >> /etc/systemd/system.conf

# Install Docker
apt-get update
apt-get install -y --no-install-recommends \
  git \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable" -y

apt-get install -y --no-install-recommends \
  docker-ce \
  docker-ce-cli \
  containerd.io

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create jitsi group and user
groupadd jitsi
useradd -m -d /jitsi -s /bin/bash -g jitsi -G docker jitsi

git clone https://github.com/jitsi/docker-jitsi-meet.git /jitsi/docker
cd /jitsi/docker
cp env.example .env
./gen-passwords.sh
mkdir -p /jitsi/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}

sed -i \
  -e "s/HTTP_PORT=8000/HTTP_PORT=80/g" \
  -e "s/HTTPS_PORT=8443/HTTPS_PORT=443/g" \
  -e "s/#PUBLIC_URL=https:\/\/meet.example.com/PUBLIC_URL=https:\/\/${hostname}/g" \
  -e "s/#DOCKER_HOST_ADDRESS=192.168.1.1/DOCKER_HOST_ADDRESS=$IP/g" \
  -e "s/#ENABLE_LETSENCRYPT/ENABLE_LETSENCRYPT/g" \
  -e "s/#LETSENCRYPT_DOMAIN=meet.example.com/LETSENCRYPT_DOMAIN=${hostname}/g" \
  -e "s/#LETSENCRYPT_EMAIL=alice@atlanta.net/LETSENCRYPT_EMAIL=${email_address}/g" \
  -e "s/#ENABLE_HTTP_REDIRECT=1/ENABLE_HTTP_REDIRECT=1/g" \
  -e "s/JVB_STUN_SERVERS/#JVB_STUN_SERVERS/g" \
  .env

# Fix permissions and start server
chown -R jitsi:jitsi /jitsi
sudo -H -u jitsi bash -c "docker-compose up -d"
