// routes/wishlist.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/wishlist.controller');
const { requireAuth }       = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');

// Todas exigem login
router.get('/',            requireAuth, ctrl.list);
router.get('/ids',         requireAuth, ctrl.listIds);
router.post('/',           requireAuth, validate(schemas.wishlist), ctrl.add);
router.delete('/:productId', requireAuth, ctrl.remove);

module.exports = router;
