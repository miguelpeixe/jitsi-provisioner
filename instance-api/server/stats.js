const express = require("express");
const { Docker } = require("node-docker-api");

const app = express();
const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const containers = {};

const createStream = (container) => {
  const stream = container.stats();
  stream.then((stats) => {
    stats.on("data", (data) => {
      containers[container.data.Id].Stats = JSON.parse(data.toString());
    });
    stats.on("error", (err) => {
      console.error(err);
    });
  });
};

const registerContainer = (container) => {
  if (typeof containers[container.data.Id] === "undefined") {
    createStream(container);
  }
  containers[container.data.Id] = {
    ...containers[container.data.Id],
    ...container.data,
  };
  return container;
};

const parse = (container) => {
  return {
    containerId: container.Id,
    names: container.Names,
    image: container.Image,
    imageId: container.ImageID,
    created: container.Created,
    state: container.State,
    status: container.Status,
    stats: {
      read: container.Stats?.read,
      cpu: container.Stats?.cpu_stats,
      memory: container.Stats?.memory_stats,
      networks: container.Stats?.networks,
      storage: container.Stats?.storage_stats,
    },
  };
};

app.get("/stats", (req, res) => {
  docker.container.list({ all: 1 }).then((containerList) => {
    for (const container of containerList) {
      registerContainer(container);
    }
    res.send(Object.values(containers).map(parse));
  });
});

module.exports = app;
