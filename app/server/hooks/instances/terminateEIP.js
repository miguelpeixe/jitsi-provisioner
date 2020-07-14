const path = require("path");
const logger = require("../../logger");
const { sleep } = require("../../utils");
const { getParsedVars } = require("./utils");

module.exports = (options = {}) => {
  return async (context) => {
    const app = context.app;
    const service = context.service;

    const data = await service.get(context.id);

    const DEMO = data.demo;

    const eipPath = path.join(data.path, "eip");

    if (!DEMO) {
      try {
        await app.terraformExec(`terraform destroy \
            -input=false \
            -auto-approve \
            -target=aws_eip.default \
            -var "aws_region=${data.region}" \
            -state=${eipPath}/tfstate`);
      } catch (e) {
        logger.error(e);
      }
    } else {
      await sleep(1 * 1000);
    }

    return context;
  };
};
