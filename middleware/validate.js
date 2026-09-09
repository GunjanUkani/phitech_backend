const Joi = require('joi');

const mouldValidation = (req, res, next) => {
  const schema = Joi.object({
    clientId: Joi.string().required(),
    productId: Joi.string().required(),
    jobNo: Joi.string().allow('', null).optional(),
    percentage: Joi.number().min(0).max(100).required(),
    startDate: Joi.date().required(),
    expectedCompletion: Joi.date().required(),
    status: Joi.string().valid('Pending', 'In Machine', 'Completed').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const adminLoginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { mouldValidation, adminLoginValidation };
