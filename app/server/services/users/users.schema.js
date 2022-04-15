const Joi = require("joi");

module.exports = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().required(),
  role: Joi.string().required().default("user"),
  demo: Joi.boolean(),
});
