const fs = require("fs");
const path = require("path");
const express = require("express");
const archiver = require("archiver");

const PORT = 8001;

const app = express();

app.get("/", (req, res) => {
  res.status(400).send("Bad request");
});

app.get("/certificates", (req, res) => {
  const filePath = "/tmp/certificates.tar.gz";
  const certificatesPath = `/data/letsencrypt`;
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
  archive.directory(certificatesPath, "certificates");
  archive.finalize();
});

app.listen(PORT, () => {
  console.log("Instance API started");
});
