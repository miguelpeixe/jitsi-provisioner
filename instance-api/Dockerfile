FROM node:lts-slim

RUN \
  apt-get update && \
  apt-get install -y --no-install-recommends \
    ca-certificates && \
  rm -rf /var/lib/apt/lists/* && \
  mkdir -p /data

COPY . /app

WORKDIR /app

RUN npm install -g nodemon

RUN npm install

CMD ["npm", "start"]
