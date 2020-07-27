const Joi = require("@hapi/joi");

module.exports = Joi.object({
  hostname: Joi.string().hostname(),
  type: Joi.string(),
  region: Joi.string(),
});
