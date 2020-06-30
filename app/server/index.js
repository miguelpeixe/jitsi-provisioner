const app = require("./app");

const server = app.listen("3030");

process.on("unhandledRejection", (reason, p) =>
  console.error("Unhandled Rejection at: Promise ", p, reason)
);

server.on("listening", () => console.info("Application started on port 3030"));
