FROM node:lts-slim

ENV TERRAFORM_VERSION=0.12.28
ENV DATA_PATH=/data

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
  mkdir -p ${DATA_PATH}

COPY app /app

WORKDIR /app

RUN npm install -g nodemon

RUN npm install --production=false

CMD ["npm", "start"]
