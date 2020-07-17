const express = require("express");
const jwt = require("express-jwt");

const certificates = require("./certificates");
const jitsi = require("./jitsi");
const recordings = require("./recordings");
const transcripts = require("./transcripts");

const PORT = 8001;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();

if (JWT_SECRET) {
  app.use(jwt({ secret: JWT_SECRET, algorithms: ["HS256"] }));
}

app.get("/", (req, res) => {
  res.status(400).send("Bad request");
});

app.use(certificates);
app.use(jitsi);
app.use(recordings);
app.use(transcripts);

app.listen(PORT, () => {
  console.log("Instance API started");
});
