const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const app = express();

const port = 8001;

app.get("/", (req, res) => {
  res.status(400).send("Bad request");
});

app.get("/certificates", (req, res) => {
  const filePath = "/tmp/certificates.tar.gz";
  const certificatesPath = `/data/letsencrypt`;
  // const certificatesPath = path.join(__dirname, "etc/letsencrypt/live");
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

app.listen(port, () => {
  console.log("Instance API started");
});
