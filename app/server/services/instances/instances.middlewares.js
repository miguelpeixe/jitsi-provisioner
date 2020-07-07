const fs = require("fs");
const archiver = require("archiver");
const logger = require("../../logger");

module.exports.detectDownload = (req, res, next) => {
  if (typeof req.query.download != "undefined") {
    delete req.query.download;
    req.params.download = 1;
  }
  next();
};

module.exports.download = (req, res, next) => {
  if (req.method == "GET" && res.data._id && req.params.download) {
    const app = req.app;
    const filepath = `/tmp/${res.data._id}.tar.gz`;
    const output = fs.createWriteStream(filepath);
    const archive = archiver("tar", {
      gzip: true,
      gzipOptions: {
        level: 1,
      },
    });

    output.on("close", () => {
      res.download(filepath);
    });

    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        // log warning
        logger.warn(err);
      } else {
        // throw error
        res.status(500).send(err);
      }
    });

    archive.on("error", function (err) {
      res.status(500).send(err);
    });

    archive.pipe(output);
    archive.directory(res.data.path, res.data._id);
    archive.finalize();
  } else {
    next();
  }
};
