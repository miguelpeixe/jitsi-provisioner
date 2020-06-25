const path = require("path");

const { generateId, exec, readFile } = require("./utils");
const cloudflare = require("./cloudflare");

const appDir = path.join(__dirname, "..");
const dataDir = process.env.DATA_DIR || path.join(appDir, "data");
const terraformDir = path.join(appDir, "terraform");

const terraformExec = (cmd) => {
  return exec(cmd, { cwd: terraformDir });
};

class Instance {
  constructor(id, region = "sa-east-1", type = "t3.large") {
    this.id = id || generateId();
    this.region = region;
    this.type = type;

    this.path = path.join(dataDir, `instance-${this.id}`);
    this.serverName = `server-${this.id}`;

    this.keyPath = path.join(this.path, "key.pem");
    this.keyName = `jitsi-${this.serverName}`;

    this.domain = `${this.serverName}.${process.env.DOMAIN}`;

    this.vars = {
      aws_region: this.region,
      instance_type: this.type,
      ssh_key_name: this.keyName,
      ssh_key_path: this.keyPath,
      ssh_pubkey_path: `${this.keyPath}.pub`,
      domain_name: this.domain,
      security_group_name: `jitsi-${this.serverName}`,
    };
  }
  getParsedVars() {
    return Object.keys(this.vars)
      .map((key) => `-var "${key}=${this.vars[key]}"`)
      .join(" ");
  }
  async verifyZone() {
    const zone = await cloudflare.getZone(this.domain);
    if (!zone) {
      throw "Could not find CloudFlare Zone";
    }
    return zone;
  }
  async getPublicIp() {
    const tfstate = await readFile(path.join(this.path, "terraform.tfstate"));
    return JSON.parse(tfstate).resources.find(
      (resource) => resource.type == "aws_instance"
    ).instances[0].attributes.public_ip;
  }
  async create() {
    console.log("Verifying CloudFlare Zone");
    await this.verifyZone();
    await exec(`mkdir -p ${this.path}`);
    console.log("Generating SSH keys");
    await exec(
      `ssh-keygen -t rsa -b 2048 -N "" -m PEM -f ${this.keyPath} && \
      chmod 400 ${this.keyPath}`
    );
    console.log("Creating plan");
    await terraformExec(
      `terraform plan \
        -input=false \
        ${this.getParsedVars()} \
        -state=${this.path}/terraform.tfstate \
        -out=${this.path}/tfcreate`
    );
    console.log("Provisioning");
    await terraformExec(
      `terraform apply \
        -input=false \
        -auto-approve \
        -state=${this.path}/terraform.tfstate \
        "${this.path}/tfcreate"`
    );
    console.log("Settings DNS records");
    this.publicIp = await this.getPublicIp();
    await cloudflare.upsertRecord(this.domain, this.publicIp);
    console.log("Done");
    return this;
  }
  async destroy() {
    console.log("Removing instance");
    await terraformExec(
      `terraform destroy \
        -input=false \
        -auto-approve \
        ${this.getParsedVars()} \
        -state=${this.path}/terraform.tfstate`
    );
    console.log("Removing files");
    await exec(`rm -rf ${this.path}`);
    console.log("Removing DNS record");
    await cloudflare.deleteRecord(this.domain);
    console.log("Destroyed");
    return this;
  }
}

module.exports.init = async function () {
  console.log("Initializing Terraform");
  process.env.TF_VAR_aws_access_key = process.env.AWS_ACCESS_KEY;
  process.env.TF_VAR_aws_secret_key = process.env.AWS_SECRET_KEY;
  process.env.TF_VAR_email_address = process.env.EMAIL;
  process.env.TF_LOG = "TRACE";
  process.env.TF_LOG_PATH = "/tmp/terraform.log";
  return await terraformExec(`terraform init -input=false`);
};

module.exports.Instance = Instance;
