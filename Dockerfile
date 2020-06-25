FROM node:lts-slim

ENV TERRAFORM_VERSION=0.12.26
ENV DATA_DIR=/data

RUN \
  apt-get update && \
  apt-get install -y --no-install-recommends \
    ca-certificates \
    openssh-client \
    wget \
    unzip && \
  rm -rf /var/lib/apt/lists/*

RUN \
  wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  chmod +x terraform && \
  mv terraform /usr/bin && \
  rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  mkdir -p ${DATA_DIR}

COPY app /app

WORKDIR /app

RUN npm install
