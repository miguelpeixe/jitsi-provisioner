const { init, Instance } = require("./instances");

init(() => {
  const instance = new Instance();
  instance.create().then(() => {
    setTimeout(() => {
      instance.destroy();
    }, 10 * 1000);
  });
});
