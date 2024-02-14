const Joi = require('joi')
// module.exports.userSchema = Joi.object({
//   username: Joi.string().required(),
//   password: Joi.string().optional(),
//   contact: Joi.number().required(),
//   profileimg: Joi.string().optional(),
//   socketId: Joi.string().optional()
// }).required();

module.exports.userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().optional(),
  contact: Joi.string().required().length(10).pattern(/^[0-9]+$/).message('Contact must be a 10-digit number'),
  profileimg: Joi.string().optional(),
  socketId: Joi.string().optional()
}).required();
