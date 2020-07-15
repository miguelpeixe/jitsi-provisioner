const path = require("path");
const parseDomain = require("parse-domain").parseDomain;
const { generateId, randomBytes } = require("../../utils");

module.exports = (options = {}) => {
  return async (context) => {
    const { data } = context;

    const app = context.app;
    const dataPath = app.get("dataPath");
    const domain = app.get("domain");

    const id = generateId();
    const instancePath = path.join(dataPath, "instances", id);
    const hostname = data.hostname || `${id}.${domain}`;

    const parsedHostname = parseDomain(hostname);
    const name = parsedHostname.subDomains.join(".");

    const enableRecording = !!data.recording;

    context.data = {
      _id: id,
      name: name,
      hostname: hostname,
      status: "draft",
      demo: !!app.get("demo"),
      createdAt: new Date(),
      region: data.region || "us-east-1",
      type: data.type || "t3.large",
      path: instancePath,
      key: {
        path: path.join(instancePath, "key.pem"),
        name: `jitsi-${name}`,
      },
      terraform: {
        vars: {},
      },
    };

    context.data.apiKey = await randomBytes(48);

    context.data.terraform.vars = {
      name: `jitsi-${name}`,
      aws_region: context.data.region,
      instance_type: context.data.type,
      ssh_key_name: context.data.key.name,
      ssh_pubkey_path: `${context.data.key.path}.pub`,
      hostname: context.data.hostname,
      security_group_name: `jitsi-${context.data.name}`,
      instance_api_key: context.data.apiKey,
      jitsi_recording: enableRecording,
    };

    return context;
  };
};
