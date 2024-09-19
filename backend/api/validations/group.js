const Joi = require("joi");

module.exports = {

  createGroup: {
    body: Joi.object({
        title:Joi.string().required().min(3).max(30),
        Topic:Joi.string().min(3).max(300),
        language:Joi.string().required().min(2).max(30),
    }).options({ abortEarly: false })
  },

  getOne: {
    params: Joi.object({
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }).options({ abortEarly: false }),
  },

  deleteOne: {
    params: Joi.object({
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }).options({ abortEarly: false }),
  },

};
