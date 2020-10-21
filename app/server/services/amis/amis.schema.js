const Joi = require("@hapi/joi");

module.exports = Joi.object({
  region: Joi.string(),
});
