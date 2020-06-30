const { program } = require("commander");
const jwt = require("jsonwebtoken");
const feathers = require("@feathersjs/feathers");
const rest = require("@feathersjs/rest-client");
const axios = require("axios");

const app = feathers();
const restClient = rest("http://localhost:3030");

const getToken = () => {
  return jwt.sign({}, process.env.JWT_SECRET, {
    audience: `https://${process.env.DOMAIN}`,
    issuer: "jitsi-provisioner",
    expiresIn: "1m",
  });
};

const init = () => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;
  app.configure(restClient.axios(axios));
};

async function main() {
  program.version("0.0.1");
  program
    .command("addUser <username> <password>")
    .description("Create new user")
    .action(async function (username, password) {
      init();
      try {
        await app.service("users").create({
          username,
          password,
        });
        console.log(`${username} added`);
      } catch (e) {
        console.error(e.message);
      }
    });
  program
    .command("removeUser <username>")
    .description("Remove user")
    .action(async function (username) {
      init();
      const user = await app.service("users").find({ query: { username } });
      if (user.length) {
        try {
          await app.service("users").remove(user[0]._id);
          console.log(`${username} removed`);
        } catch (e) {
          console.error(e.message);
        }
      } else {
        console.error("User not found");
      }
    });

  await program.parseAsync(process.argv);
}

main();
