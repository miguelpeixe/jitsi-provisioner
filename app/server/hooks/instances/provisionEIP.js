const path = require("path");
const { set } = require("lodash");
const logger = require("../../logger");
const { exec, sleep, readFile } = require("../../utils");
const { fail } = require("./utils");

const getAttributes = (tfstate) => {
  if (tfstate.terraform_version) {
    return tfstate.resources.find((resource) => resource.type == "aws_eip")
      .instances[0].attributes;
  }
  return {};
};

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;
    const data = context.result;

    const DEMO = data.demo;

    // Skip if instance has a provisioned public ip
    if (data.publicIp) {
      return context;
    }

    const eipPath = path.join(data.path, "eip");
    await exec(`mkdir -p ${eipPath}`);

    let patchData = {};

    if (!DEMO) {
      try {
        logger.info("Creating EIP plan");
        await app.terraformExec(`terraform plan \
          -input=false \
          -target=aws_eip.default \
          -var "aws_region=${data.region}" \
          -state=${eipPath}/tfstate \
          -out=${eipPath}/tfcreate`);

        logger.info("Provisioning EIP");
        await app.terraformExec(`terraform apply \
              -input=false \
              -auto-approve \
              -state=${eipPath}/tfstate \
              "${eipPath}/tfcreate"`);

        const stateFile = await readFile(path.join(eipPath, "tfstate"));
        const tfstate = JSON.parse(stateFile);

        const attributes = getAttributes(tfstate);
        patchData = {
          publicIp: attributes.public_ip,
          "terraform.vars.eip_id": attributes.id,
        };
      } catch (e) {
        await fail(service, data._id, e);
      }
    } else {
      patchData = {
        publicIp: `100.0.0.${Math.floor(Math.random() * (255 - 1 + 1) + 1)}`,
        eipId: "eip-12456789",
      };
      await sleep(1 * 1000);
    }

    if (Object.keys(patchData).length) {
      await service.patch(data._id, patchData);
      for (const key in patchData) {
        set(context.result, key, patchData[key]);
      }
    }

    return context;
  };
};
