const { pick } = require("lodash");
const { Command } = require("commander");
const ora = require("ora");

const connection = require("../utils/connection");
const getOrFind = require("../utils/getOrFind");

const fields = [
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

  instances
    .description("Jitsi Provisioner Instances")
    .action(async (instanceId) => {
      const client = await connection();
      const service = client.instances;
      await getOrFind({ service, id: instanceId, fields });
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
      const client = await connection();
      const service = client.instances;
      try {
        const data = await service.create({
          hostname: options.hostname,
          region: options.region,
          type: options.type,
        });
        service.on("patched", async (instance) => {
          if (instance._id == data._id) {
            spinner.text = instance.info;
            if (instance.status == "failed") {
              spinner.fail(instance.info || "");
              process.exit(1);
            }
            if (instance.status == "available" && !instance.info) {
              spinner.succeed("Available");
              await getOrFind({ service, id: instance._id, fields });
            }
          }
        });
      } catch (err) {
        spinner.fail(err.message || err);
        process.exit(1);
      }
    });
  instances
    .command("provision <instanceId>")
    .description("Provision an instance")
    .action(async (instanceId, options) => {
      const spinner = ora({
        prefixText: "Provisioning instance",
      }).start();
      const client = await connection();
      const service = client.instances;
      try {
        const data = await service.provision(instanceId);
        service.on("patched", async (instance) => {
          if (instance._id == data._id) {
            spinner.text = instance.info;
            if (instance.status == "failed") {
              spinner.fail(instance.info || "");
              process.exit(1);
            }
            if (instance.status == "available" && !instance.info) {
              spinner.succeed("Available");
              await getOrFind({ service, id: instance._id, fields });
            }
          }
        });
      } catch (err) {
        spinner.fail(err.message || err);
        process.exit(1);
      }
    });
  instances
    .command("terminate <instanceId>")
    .description("Terminate an instance")
    .action(async (instanceId) => {
      const spinner = ora({
        prefixText: "Terminating instance",
      }).start();
      const client = await connection();
      const service = client.instances;
      try {
        const data = await service.terminate(instanceId);
        service.on("patched", async (instance) => {
          if (instance._id == data._id) {
            spinner.text = instance.info;
            if (instance.status == "failed") {
              spinner.fail(instance.info || "");
              process.exit(1);
            }
            if (instance.status == "terminated" && !instance.info) {
              spinner.succeed("Terminated");
              await getOrFind({ service, id: instance._id, fields });
            }
          }
        });
      } catch (err) {
        spinner.fail(err.message || err);
        process.exit(1);
      }
    });
  instances
    .command("remove <instanceId>")
    .description("Remove a terminated instance")
    .action(async (instanceId, options) => {
      const spinner = ora({
        prefixText: "Removing instance",
      }).start();
      const client = await connection();
      const service = client.instances;
      try {
        const data = await service.remove(instanceId);
        service.on("patched", async (instance) => {
          if (instance._id == data._id) {
            spinner.text = instance.info;
            if (instance.status == "failed") {
              spinner.fail(instance.info || "");
              process.exit(1);
            }
          }
        });
        service.on("removed", async (instance) => {
          if (instance._id == data._id) {
            spinner.succeed("Removed");
            process.exit();
          }
        });
      } catch (err) {
        spinner.fail(err.message || err);
        process.exit(1);
      }
    });

  return instances;
};
