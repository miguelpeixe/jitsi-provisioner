const { pick } = require("lodash");
const { Command } = require("commander");
const ora = require("ora");

const connection = require("../utils/connection");

const print = [
  "_id",
  "hostname",
  "info",
  "status",
  "publicIp",
  "region",
  "type",
];

module.exports = function instances() {
  const program = new Command();

  const instances = program.command("instances [instanceId]");

  instances.description("Jitsi Provisioner Instances").action(async (instanceId) => {
    const socket = await connection();
    try {
      if (instanceId) {
        socket.send("get", "instances", instanceId, (err, data) => {
          console.table(pick(data, print));
          process.exit();
        });
      } else {
        socket.send("find", "instances", {}, (err, data) => {
          console.table(data, print);
          process.exit();
        });
      }
    } catch (e) {
      console.error(e.message);
      process.exit();
    }
  });

  instances
    .command("create")
    .description("Create new instance")
    .option(
      "--hostname <hostname>",
      `Custom hostname (default: "<id>.example.com")`
    )
    .option("--region <region>", "Amazon region", "us-east-1")
    .option("--type <type>", "Amazon instance type", "t3.large")
    .action(async (options) => {
      const spinner = ora({
        prefixText: "Provisioning instance",
      }).start();
      const socket = await connection();
      socket.send(
        "create",
        "instances",
        {
          hostname: options.hostname,
          region: options.region,
          type: options.type,
        },
        (err, data) => {
          if (err) {
            console.error(err.message);
            process.exit(1);
          } else {
            socket.on("instances patched", (instance) => {
              if (instance._id == data._id) {
                spinner.text = instance.info;
                if (instance.status == "failed") {
                  spinner.fail(instance.info || "");
                  process.exit(1);
                }
                if (instance.status == "available" && !instance.info) {
                  spinner.succeed("Available");
                  console.table(pick(instance, print));
                  process.exit();
                }
              }
            });
          }
        }
      );
    });
  instances
    .command("provision <instanceId>")
    .description("Provision an instance")
    .action(async (instanceId, options) => {
      const spinner = ora({
        prefixText: "Provisioning instance",
      }).start();
      const socket = await connection();
      socket.send(
        "patch",
        "instances",
        instanceId,
        {
          action: "provision",
        },
        (err, data) => {
          if (err) {
            console.error(err.message);
            process.exit(1);
          } else {
            socket.on("instances patched", (instance) => {
              if (instance._id == data._id) {
                spinner.text = instance.info;
                if (instance.status == "failed") {
                  spinner.fail(instance.info || "");
                  process.exit(1);
                }
                if (instance.status == "available" && !instance.info) {
                  spinner.succeed("Provisioned");
                  console.table(pick(instance, print));
                  process.exit();
                }
              }
            });
          }
        }
      );
    });
  instances
    .command("terminate <instanceId>")
    .description("Terminate an instance")
    .action(async (instanceId) => {
      const spinner = ora({
        prefixText: "Terminating instance",
      }).start();
      const socket = await connection();
      socket.send(
        "patch",
        "instances",
        instanceId,
        {
          action: "terminate",
        },
        (err, data) => {
          if (err) {
            console.error(err.message);
            process.exit(1);
          } else {
            socket.on("instances patched", (instance) => {
              if (instance._id == data._id) {
                spinner.text = instance.info;
                if (instance.status == "failed") {
                  spinner.fail(instance.info || "");
                  process.exit(1);
                }
                if (instance.status == "terminated" && !instance.info) {
                  spinner.succeed("Terminated");
                  console.table(pick(instance, print));
                  process.exit();
                }
              }
            });
          }
        }
      );
    });
  instances
    .command("remove <instanceId>")
    .description("Remove a terminated instance")
    .action(async (instanceId, options) => {
      const spinner = ora({
        prefixText: "Removing instance",
      }).start();
      const socket = await connection();
      socket.send(
        "patch",
        "instances",
        instanceId,
        { action: "remove" },
        (err, data) => {
          if (err) {
            console.error(err.message);
            process.exit(1);
          } else {
            socket.on("instances patched", (instance) => {
              if (instance._id == data._id) {
                spinner.text = instance.info;
                if (instance.status == "failed") {
                  spinner.fail(instance.info || "");
                  process.exit(1);
                }
              }
            });
            socket.on("instances removed", (instance) => {
              if (instance._id == data._id) {
                spinner.succeed("Removed");
                process.exit();
              }
            });
          }
        }
      );
    });

  return instances;
};
