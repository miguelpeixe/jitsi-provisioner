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
  const certificatesPath = "/data/letsencrypt";
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

app.get("/jitsi", (req, res) => {
  const filePath = "/tmp/jitsi.tar.gz";
  const jitsiPath = "/data/jitsi";
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

app.get("/transcripts", (req, res) => {
  const filePath = "/tmp/transcripts.tar.gz";
  const transcriptsPath = "/data/jitsi/jibri/transcripts";
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
  archive.directory(transcriptsPath, "transcripts");
  archive.finalize();
});

app.listen(PORT, () => {
  console.log("Instance API started");
});
