const logger = require("../../logger");

module.exports.fail = async (service, id, err) => {
  await service.patch(id, { status: "failed" });
  logger.error(err);
  throw new Error(err);
};

module.exports.getParsedVars = (vars) => {
  return Object.keys(vars)
    .map((key) => `-var "${key}=${vars[key]}"`)
    .join(" ");
};

module.exports.getPublicIp = (data) => {
  if (data.publicIp) {
    return data.publicIp;
  }
  if (data.terraform.state.terraform_version) {
    return data.terraform.state.resources.find(
      (resource) => resource.type == "aws_instance"
    ).instances[0].attributes.public_ip;
  }
  return false;
};
