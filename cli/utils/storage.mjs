import fs from "fs";
class FileStorage {
  constructor(path) {
    this.path = path;
  }
  getConfig() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, (err, data) => {
        if (err) {
          resolve({});
        } else {
          resolve(JSON.parse(data || "{}"));
        }
      });
    });
  }
  writeConfig(object) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, JSON.stringify(object), (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  purge() {
    return new Promise((resolve, reject) => {
      fs.unlink(this.path, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.path);
        }
      });
    });
  }
  async getItem(key) {
    const config = await this.getConfig();
    return config[key];
  }
  async setItem(key, value) {
    const config = await this.getConfig();
    config[key] = value;
    await this.writeConfig(config);
    return value;
  }
  async removeItem(key) {
    const config = await this.getConfig();
    const value = config[key];
    delete config[key];
    await this.writeConfig(config);
    return value;
  }
}

export default FileStorage;
