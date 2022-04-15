const Joi = require("joi");

module.exports = Joi.object({
  hostname: Joi.string().hostname(),
  type: Joi.string().required().default("t3.large"),
  region: Joi.string().required().default("us-east-1"),
  recording: Joi.boolean().default(false),
});
