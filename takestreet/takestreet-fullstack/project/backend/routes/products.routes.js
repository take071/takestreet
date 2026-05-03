// routes/products.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/products.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');
const { validate, schemas }         = require('../middlewares/validate.middleware');

// Públicas
router.get('/',        ctrl.list);
router.get('/search',  ctrl.search);
router.get('/:id',     ctrl.getById);

// Admin
router.post('/',      requireAuth, requireAdmin, validate(schemas.product), ctrl.create);
router.put('/:id',    requireAuth, requireAdmin, validate(schemas.product), ctrl.update);
router.delete('/:id', requireAuth, requireAdmin,                            ctrl.remove);

module.exports = router;
