const Joi = require("joi");

module.exports = Joi.object({
  region: Joi.string(),
});
