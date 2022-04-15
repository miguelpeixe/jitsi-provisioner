const fs = require("fs");
const express = require("express");
const archiver = require("archiver");

const app = express();

app.get("/jitsi", (req, res) => {
  const filePath = "/tmp/jitsi.tar.gz";
  const jitsiPath = req.app.get("jitsiPath");
  const output = fs.createWriteStream(filePath);
  const archive = archiver("tar", {
    gzip: true,
    gzipOptions: {
      level: 1,
    },
  });
  output.on("close", () => {
    res.download(filePath);
  });

  archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
      // log warning
      console.warn(err);
    } else {
      // throw error
      res.status(500).send(err);
    }
  });

  archive.on("error", function (err) {
    res.status(500).send(err);
  });

  archive.pipe(output);
  archive.directory(`${jitsiPath}/web`, "web");
  archive.directory(`${jitsiPath}/prosody`, "prosody");
  archive.directory(`${jitsiPath}/jvb`, "jvb");
  archive.directory(`${jitsiPath}/jigasi`, "jigasi");
  archive.directory(`${jitsiPath}/jicofo`, "jicofo");
  archive.finalize();
});

module.exports = app;
