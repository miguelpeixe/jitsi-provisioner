const express = require("express");
const jwt = require("express-jwt");

const stats = require("./stats");
const certificates = require("./certificates");
const jitsi = require("./jitsi");
const recordings = require("./recordings");
const transcripts = require("./transcripts");

const PORT = 8001;

const app = express();

const config = {
  secret: process.env.JWT_SECRET,
  jitsiPath: process.env.JITSI_PATH || "/jitsi/.jitsi-meet-cfg",
  certificatesPath: process.env.CERTIFICATES_PATH || "/etc/letsencrypt",
};

for (const key in config) {
  app.set(key, config[key]);
}

if (app.get("secret")) {
  app.use(jwt({ secret: app.get("secret"), algorithms: ["HS256"] }));
} else {
  console.warn("WARNING: Secret is not set. The app is not protected.");
}

app.get("/", (req, res) => {
  res.status(400).send("Bad request");
});

app.use(stats);
app.use(certificates);
app.use(jitsi);
app.use(recordings);
app.use(transcripts);

app.listen(PORT, () => {
  console.log("Instance API started");
});
