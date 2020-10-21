import Service from "../service";

export default class Users extends Service {
  constructor(client) {
    super("users", client);
  }
}
