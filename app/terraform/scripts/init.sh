#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive

echo -e "nameserver 8.8.8.8\nnameserver 8.8.4.4" >> /etc/resolv.conf

echo -e "DefaultLimitNOFILE=65000\nDefaultLimitNPROC=65000\nDefaultTasksMax=65000" >> /etc/systemd/system.conf

# Install Docker
curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" | apt-key add -
add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable" -y
apt-get install -y --no-install-recommends \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  git \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg-agent \
  software-properties-common \
  linux-image-extra-virtual \
  nginx

# Install docker compose
curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
  chmod +x /usr/local/bin/docker-compose &

# Create jitsi group and user
groupadd jitsi
useradd -m -d /jitsi -s /bin/bash -g jitsi -G docker jitsi

# Configure alsa loopback for Jibri
echo "options snd-aloop enable=1,1,1,1,1 index=0,1,2,3,4" > /etc/modprobe.d/alsa-loopback.conf && \
  echo "snd-aloop" >> /etc/modules && \
  sed -i \
    -e "s/GRUB_DEFAULT=0/GRUB_DEFAULT=\"1>2\"/g" \
    /etc/default/grub && \
  update-grub &

# Clone and prepare directories
git clone https://github.com/jitsi/docker-jitsi-meet.git /jitsi/docker && \
  cd /jitsi/docker && \
  mkdir -p /jitsi/data/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri} && \
  cp env.example .env && \
  docker-compose -f docker-compose.yml -f jigasi.yml -f jibri.yml pull &

# Pull instance api image
docker pull miguelpeixe/jitsi-provisioner-instance-api:latest &

# Pull certbot image
docker pull certbot/certbot:latest &

# Wait background scripts before continuing
wait
