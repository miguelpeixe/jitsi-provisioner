const path = require("path");
const logger = require("./logger");
const { exec } = require("./utils");

module.exports = async (app) => {
  if (app.get("demo")) return;
  const terraformPath = path.join(app.get("appPath"), "terraform");
  app.set("terraformPath", terraformPath);

  app.terraformExec = (cmd) => {
    return exec(cmd, { cwd: terraformPath });
  };

  logger.info("Initializing Terraform");

  process.env.TF_VAR_aws_access_key = process.env.AWS_ACCESS_KEY_ID;
  process.env.TF_VAR_aws_secret_key = process.env.AWS_SECRET_ACCESS_KEY;
  process.env.TF_VAR_email_address = process.env.EMAIL;

  // process.env.TF_LOG = "TRACE";
  // process.env.TF_LOG_PATH = "/tmp/terraform.log";

  await app.terraformExec(`terraform init -input=false`);
};
