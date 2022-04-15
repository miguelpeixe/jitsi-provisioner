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
  if (!containers[container.data.Id]) {
    containers[container.data.Id] = container.data;
    createStream(container);
  }
  return container;
};

const parse = (container) => {
  if (container.Stats) {
    return container.Stats;
  }
  return {
    id: container.Id,
  };
};

app.get("/stats", (req, res) => {
  docker.container.list().then((containerList) => {
    for (const container of containerList) {
      registerContainer(container);
    }
    res.send(Object.values(containers).map(parse));
  });
});

module.exports = app;
