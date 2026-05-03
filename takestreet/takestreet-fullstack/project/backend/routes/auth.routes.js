// routes/auth.routes.js
const router     = require('express').Router();
const ctrl       = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validate.middleware');
const { requireAuth }       = require('../middlewares/auth.middleware');
const { authLimiter }       = require('../middlewares/rateLimit.middleware');

router.post('/register', authLimiter, validate(schemas.register), ctrl.register);
router.post('/login',    authLimiter, validate(schemas.login),    ctrl.login);
router.get('/me',        requireAuth,                             ctrl.me);

module.exports = router;
