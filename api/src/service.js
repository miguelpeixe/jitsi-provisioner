export default class Service {
  constructor(serviceName, client) {
    this._api = client;
    this._service = this._api.service(serviceName);
  }
  get(id) {
    return this._service.get(id);
  }
  find(query) {
    return this._service.find(query);
  }
  create(data) {
    return this._service.create(data);
  }
  patch(id, data) {
    return this._service.patch(id, data);
  }
  update(id, data) {
    return this._service.update(id, data);
  }
  remove(id) {
    return this._service.remove(id);
  }
  on(event, listener) {
    return this._service.on(event, listener);
  }
  off(event, listener) {
    return this._service.off(event, listener);
  }
}
