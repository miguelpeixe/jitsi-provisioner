const {
  AuthenticationService,
  JWTStrategy,
} = require("@feathersjs/authentication");
const { LocalStrategy } = require("@feathersjs/authentication-local");
const jwt = require("jsonwebtoken");

module.exports = (app) => {
  app.set("authentication", {
    secret: process.env.JWT_SECRET,
    entity: null,
    authStrategies: ["jwt", "local"],
    jwtOptions: {
      header: { typ: "access" },
      audience: `https://${process.env.DOMAIN}`,
      issuer: "jitsi-provisioner",
      algorithm: "HS256",
      expiresIn: "1d",
    },
    local: {
      entity: "user",
      service: "users",
      usernameField: "username",
      passwordField: "password",
    },
  });

  const authentication = new AuthenticationService(app);

  authentication.register("jwt", new JWTStrategy());
  authentication.register("local", new LocalStrategy());

  app.use("/authentication", authentication);

  const service = app.service("authentication");

  // Hooks for using entity when coming from local auth
  service.hooks({
    before: {
      create: [
        async (context) => {
          if (context.data.strategy == "local") {
            const user = await app
              .service("users")
              .find({ query: { username: context.data.username } });
            if (user && user.length) {
              context.params.payload = {
                ...(context.params.payload || {}),
                sub: user[0]._id,
              };
            }
          }
          if (context.data.strategy == "jwt") {
            const data = jwt.decode(context.data.accessToken);
            if (data.sub) {
              await app.service("users").get(data.sub);
            }
          }
          return context;
        },
      ],
    },
    after: {
      create: [
        async (context) => {
          if (context.data.strategy == "jwt") {
            const { payload } = context.result.authentication;
            if (payload.sub) {
              context.result.user = await context.app
                .service("users")
                .get(payload.sub);
              // protect password
              delete context.result.user.password;
            }
          }
          return context;
        },
      ],
    },
  });
};
