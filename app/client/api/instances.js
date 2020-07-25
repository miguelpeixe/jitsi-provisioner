import client from "api";
import downloadFile from "utils/download";
import { get } from "lodash";

const service = client.service("instances");

export function create(data) {
  return service.create(data);
}
export function provision(instance) {
  return service.patch(instance._id, { action: "provision" });
}
export function terminate(instance) {
  return service.patch(instance._id, { action: "terminate" });
}
export function remove(instance) {
  return service.patch(instance._id, { action: "remove" });
}

export function createAMI(region) {
  return client.service("amis").create({ region });
}

export function getUrl(instance) {
  return `https://${instance.hostname}`;
}

export function getAWS() {
  return client.get("aws") || [];
}

export function getServer(type) {
  const aws = getAWS();
  if (!aws.length || !type) return;
  return aws.find((item) => item._id == type);
}

export function hasRecording(instance) {
  return !!get(instance, "terraform.vars.jitsi_recording");
}

export function download(instance) {
  client.rest
    .get(`/instances/${instance._id}?download`, { responseType: "blob" })
    .then((res) => {
      downloadFile(
        res.data,
        `${instance._id}.tar.gz`,
        res.headers["content-type"]
      );
    });
}

export function canTerminate(instance) {
  return instance.status.match(/failed|running|available|standby/);
}

export function canRemove(instance) {
  return instance.status == "terminated";
}

export function isAvailable(instance) {
  return instance.status == "available";
}
export function isRunning(instance) {
  return instance.status.match(/available|running/);
}
export function isLoading(instance) {
  return !instance.status.match(/failed|available|standby|terminated/);
}

export default {
  create,
  provision,
  terminate,
  remove,
  createAMI,
  getUrl,
  getServer,
  getAWS,
  hasRecording,
  download,
  canTerminate,
  canRemove,
  isAvailable,
  isRunning,
  isLoading,
};
