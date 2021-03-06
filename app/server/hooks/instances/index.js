module.exports = {
  processInstance: require("./processInstance"),
  validateData: require("./validateData"),
  verifyCloudflare: require("./verifyCloudflare"),
  createPath: require("./createPath"),
  createSSHKeys: require("./createSSHKeys"),
  findAMI: require("./findAMI"),
  provisionEIP: require("./provisionEIP"),
  provisionInstance: require("./provisionInstance"),
  setDNSRecord: require("./setDNSRecord"),
  waitDNS: require("./waitDNS"),
  waitApp: require("./waitApp"),
  storeCertificate: require("./storeCertificate"),
  downloadInstance: require("./downloadInstance"),
  checkLimit: require("./checkLimit"),
  terminateEIP: require("./terminateEIP"),
  terminateInstance: require("./terminateInstance"),
  removeFiles: require("./removeFiles"),
  removeDNSRecord: require("./removeDNSRecord"),
  checkStability: require("./checkStability"),
};
