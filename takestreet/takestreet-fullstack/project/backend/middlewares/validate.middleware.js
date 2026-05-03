// middlewares/validate.middleware.js
const Joi = require('joi');

/**
 * Factory: retorna middleware que valida req.body com o schema Joi
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // retorna todos os erros de uma vez
      stripUnknown: true   // remove campos não definidos no schema
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ error: messages.join('; ') });
    }

    req.body = value; // usa os valores sanitizados
    next();
  };
}

/* ── Schemas ─────────────────────────────────── */

const schemas = {

  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3).max(30)
      .required()
      .messages({
        'string.alphanum': 'Usuário deve conter apenas letras e números.',
        'string.min': 'Usuário deve ter no mínimo 3 caracteres.',
        'string.max': 'Usuário deve ter no máximo 30 caracteres.',
        'any.required': 'Usuário é obrigatório.'
      }),
    email: Joi.string().email().max(100).optional().allow(''),
    password: Joi.string().min(6).max(72).required()
      .messages({
        'string.min': 'Senha deve ter no mínimo 6 caracteres.',
        'any.required': 'Senha é obrigatória.'
      })
  }),

  login: Joi.object({
    username: Joi.string().min(1).max(30).required()
      .messages({ 'any.required': 'Usuário é obrigatório.' }),
    password: Joi.string().min(1).max(72).required()
      .messages({ 'any.required': 'Senha é obrigatória.' })
  }),

  product: Joi.object({
    name:     Joi.string().min(2).max(100).required(),
    brand:    Joi.string().min(1).max(60).required(),
    price:    Joi.number().positive().precision(2).required(),
    oldPrice: Joi.number().positive().precision(2).optional().allow(null),
    gender:   Joi.string().valid('masculino', 'feminino', 'unissex').required(),
    category: Joi.string().valid('camisetas','moletons','calcas','jaquetas','tenis','acessorios').required(),
    platform: Joi.string().max(40).required(),
    badge:    Joi.string().max(30).optional().allow(null, ''),
    icon:     Joi.string().max(30).default('default'),
    tags:     Joi.array().items(Joi.string().max(30)).max(10).default([]),
    desc:     Joi.string().max(500).optional().allow(''),
    link:     Joi.string().uri().max(500).optional().allow(''),
    img:      Joi.string().max(500).optional().allow('')
  }),

  wishlist: Joi.object({
    productId: Joi.number().integer().positive().required()
  })
};

module.exports = { validate, schemas };
