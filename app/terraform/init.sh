#!/bin/bash
set -e

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

# Install docker compose
curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create jitsi group and user
groupadd jitsi
useradd -m -d /jitsi -s /bin/bash -g jitsi -G docker jitsi

# Clone and prepare directories
git clone https://github.com/jitsi/docker-jitsi-meet.git /jitsi/docker
cd /jitsi/docker
mkdir -p /jitsi/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}

# Pull docker images
cp env.example .env
docker-compose -f docker-compose.yml -f jigasi.yml -f jibri.yml pull
