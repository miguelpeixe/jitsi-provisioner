const fs = require("fs");
const path = require("path");
const express = require("express");
const archiver = require("archiver");

const app = express();

app.get("/recordings", (req, res) => {
  const filePath = "/tmp/recordings.tar.gz";
  const recordingsPath = "/data/jitsi/jibri/recordings";

  fs.access(recordingsPath, (error) => {
    if (error) {
      res.status(404).send("There are no recordings");
    } else {
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
      archive.directory(recordingsPath, "recordings");
      archive.finalize();
    }
  });
});

module.exports = app;
