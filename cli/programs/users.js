const { pick } = require("lodash");
const { Command } = require("commander");
const ora = require("ora");

const connection = require("../utils/connection");

module.exports = function users() {
  const program = new Command();

  const users = program.command("users");

  users.description("Jitsi Provisioner Users").action(async () => {
    const socket = await connection();
    try {
      socket.send("find", "users", {}, (err, data) => {
        console.table(data);
        process.exit();
      });
    } catch (e) {
      console.error(e.message);
      process.exit();
    }
  });

  users
    .command("create <username> <password>")
    .description("Create new user")
    .action(async (username, password) => {
      const socket = await connection();
      socket.send("create", "users", { username, password }, (err, data) => {
        if (err) {
          console.error(err.message);
          process.exit(1);
        } else {
          console.table(data);
          process.exit();
        }
      });
    });
  users
    .command("changePassword <username> <newPassword>")
    .description("Change user password")
    .action(async (username, newPassword) => {
      const socket = await connection();

      socket.send("find", "users", { username }, (err, data) => {
        if (!data.length) {
          console.error("User not found");
          process.exit(1);
        } else {
          socket.send(
            "patch",
            "users",
            data[0]._id,
            { password: newPassword },
            (err, data) => {
              if (err) {
                console.error(err.message || err);
                process.exit(1);
              } else {
                console.table(data);
                process.exit();
              }
            }
          );
        }
      });
    });
  users
    .command("changeRole <username> <role>")
    .description("Change user role (admin or user)")
    .action(async (username, role) => {
      const socket = await connection();
      socket.send("find", "users", { username }, (err, data) => {
        if (!data.length) {
          console.error("User not found");
          process.exit(1);
        } else {
          socket.send("patch", "users", data[0]._id, { role }, (err, data) => {
            if (err) {
              console.error(err.message);
              process.exit(1);
            } else {
              console.table(data);
              process.exit();
            }
          });
        }
      });
    });
  users
    .command("remove <username>")
    .description("Remove user")
    .action(async (username) => {
      const socket = await connection();
      socket.send("find", "users", { username }, (err, data) => {
        if (!data.length) {
          console.error("User not found");
          process.exit(1);
        } else {
          socket.send("remove", "users", data[0]._id, (err, data) => {
            if (err) {
              console.error(err.message);
              process.exit(1);
            } else {
              console.table(data);
              process.exit();
            }
          });
        }
      });
    });

  return users;
};
