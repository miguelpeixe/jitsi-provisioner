const Joi = require("@hapi/joi");

module.exports = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().required(),
  role: Joi.string(),
  demo: Joi.boolean(),
});
