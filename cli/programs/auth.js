const { Command } = require("commander");
const ora = require("ora");

const connection = require("../utils/connection");

module.exports = function instances() {
  const program = new Command();

  const auth = program
    .command("auth")
    .option("-u, --user <user>", "Username", "admin")
    .option("-p, --password <password>", "Password", "admin")
    .option("-s, --server <url>", "Server url", "http://localhost:3030")
    .action(async (options) => {
      connection
        .auth({
          url: options.server,
          username: options.user,
          password: options.password,
        })
        .finally(() => {
          process.exit();
        });
    });

  auth
    .command("remove")
    .description("Clear authentication")
    .action(async (options) => {
      const spinner = ora().start("Removing authentication");
      connection
        .clear()
        .then(() => {
          spinner.succeed("Removed authentication");
        })
        .catch((err) => {
          spinner.fail(err.message || err);
        })
        .finally(() => {
          process.exit();
        });
    });

  return auth;
};
