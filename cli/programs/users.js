const { pick } = require("lodash");
const { Command } = require("commander");
const ora = require("ora");

const connection = require("../utils/connection");
const getOrFind = require("../utils/getOrFind");

module.exports = function users() {
  const program = new Command();

  const users = program.command("users [userId]");

  users.description("Jitsi Provisioner Users").action(async (userId) => {
    const client = await connection();
    const service = client.service("users");
    await getOrFind({ service, id: userId });
  });

  users
    .command("create <username>")
    .option("-p, --password <password>", "User password")
    .option("-r, --role <role>", "User role", "user")
    .description("Create new user")
    .action(async (username, options) => {
      const spinner = ora().start("Creating user");
      const client = await connection();
      const service = client.service("users");
      try {
        const data = await service.create({
          username,
          password: options.password,
          role: options.role,
        });
        spinner.succeed("Created");
        console.table(data);
        process.exit();
      } catch (err) {
        spinner.fail(err.message || err);
        process.exit(1);
      }
    });
  users
    .command("changePassword <username> <newPassword>")
    .description("Change user password")
    .action(async (username, newPassword) => {
      const spinner = ora().start("Changing password");
      const client = await connection();
      const service = client.service("users");
      try {
        const users = await service.find({ query: { username } });
        if (!users.length) {
          throw new Error("User not found");
        }
        const user = users[0];
        await service.patch(user._id, { password: newPassword });
        spinner.succeed("Password changed");
        process.exit();
      } catch (err) {
        spinner.fail(err.message || err);
        process.exit(1);
      }
    });
  users
    .command("changeRole <username> <role>")
    .description("Change user role (admin or user)")
    .action(async (username, role) => {
      const spinner = ora().start("Changing role");
      const client = await connection();
      const service = client.service("users");
      try {
        const users = await service.find({ query: { username } });
        if (!users.length) {
          throw new Error("User not found");
        }
        const user = users[0];
        await service.patch(user._id, { role });
        spinner.succeed("Role changed");
        process.exit();
      } catch (err) {
        spinner.fail(err.message || err);
        process.exit(1);
      }
    });
  users
    .command("remove <username>")
    .description("Remove user")
    .action(async (username) => {
      const spinner = ora().start("Removing user");
      const client = await connection();
      const service = client.service("users");
      try {
        const users = await service.find({ query: { username } });
        if (!users.length) {
          throw new Error("User not found");
        }
        const user = users[0];
        await service.remove(user._id);
        spinner.succeed("User removed");
        process.exit();
      } catch (err) {
        spinner.fail(err.message || err);
        process.exit(1);
      }
    });

  return users;
};
