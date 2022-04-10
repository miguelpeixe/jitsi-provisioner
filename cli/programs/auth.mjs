import { Command } from "commander";
import ora from "ora";

import connection from "../utils/connection.mjs";

export default function instances() {
  const program = new Command();

  const auth = program
    .command("auth")
    .option("-u, --user <user>", "Username", "admin")
    .option("-p, --password <password>", "Password", "admin")
    .option("-s, --server <url>", "Server url", "http://localhost:3030")
    .action(async (options) => {
      const spinner = ora().start("Authenticating");
      connection
        .auth({
          url: options.server,
          username: options.user,
          password: options.password,
        })
        .then((err) => {
          spinner.succeed(`Authenticated to ${options.server}`);
        })
        .catch((err) => {
          spinner.fail(err.message || err);
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
}
