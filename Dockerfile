FROM node:lts-slim

ENV TERRAFORM_VERSION=1.0.5
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
  if [ "$(dpkg --print-architecture)" = "armhf" ]; then \
    ARCH="arm"; \
  else \
    ARCH=$(dpkg --print-architecture); \
  fi && \
  wget -O tf.zip https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_${ARCH}.zip && \
  unzip tf.zip && chmod +x terraform && mv terraform /usr/bin && rm tf.zip && \
  mkdir -p ${DATA_PATH}

COPY app /usr/src/app

WORKDIR /usr/src/app

RUN npm install -g nodemon

RUN npm install --production=false

CMD ["npm", "start"]
