const app = require("./app");
const logger = require("./logger");

const server = app.listen("3030");

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason)
);

server.on("listening", () => logger.info("Application started on port 3030"));
