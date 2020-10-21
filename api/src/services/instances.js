import get from "lodash/get";

import downloadFile from "../utils/download";
import Service from "../service";

export default class Instances extends Service {
  constructor(client) {
    super("instances", client);
    this._amiService = this._api.service("amis");
  }
  _parseInstanceParam = (instanceId) => {
    if (typeof instanceId == "object") {
      return instanceId._id;
    }
    return instanceId;
  };
  async _getInstance(instance) {
    if (typeof instance == "string") {
      instance = await this._service.get(instance);
    }
    return instance;
  }
  provision(instanceId) {
    return this._service.patch(this._parseInstanceParam(instanceId), {
      action: "provision",
    });
  }
  terminate(instanceId) {
    return this._service.patch(this._parseInstanceParam(instanceId), {
      action: "terminate",
    });
  }
  remove(instanceId) {
    return this._service.patch(this._parseInstanceParam(instanceId), {
      action: "remove",
    });
  }
  createAMI(region) {
    return this._amiService.create({ region });
  }
  async removeAMI(region) {
    const regionAmis = await this._amiService.find({ query: { region } });
    if (regionAmis.length) {
      return this._amiService.remove(regionAmis[0]._id);
    } else {
      throw new Error("No AMIs found in this region");
    }
  }
  getUrl(instance) {
    return `https://${instance.hostname}`;
  }
  hasRecording(instance) {
    return !!get(instance, "terraform.vars.jitsi_recording");
  }
  canTerminate(instance) {
    return instance.status.match(/failed|running|available|standby/);
  }
  canRemove(instance) {
    return instance.status == "terminated";
  }
  isAvailable(instance) {
    return instance.status == "available";
  }
  isRunning(instance) {
    return instance.status.match(/available|running/);
  }
  isLoading(instance) {
    return !instance.status.match(/failed|available|standby|terminated/);
  }
  async download(instance) {
    const path = `/instances/${instance._id}?download`;
    if (typeof window === "undefined") {
      const res = await this._api._rest.get(path);
      return res.data;
    } else {
      const res = await this._api._rest.get(path, { responseType: "blob" });
      downloadFile(
        res.data,
        `${instance._id}.tar.gz`,
        res.headers["content-type"]
      );
    }
  }
}
