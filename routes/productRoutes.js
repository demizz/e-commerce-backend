const express = require('express');
const productController = require('../controller/productController');
const authController = require('../controller/authController');
const router = express.Router();
router
  .route('/create/:userId')
  .post(
    authController.requireSignin,
    authController.restrictTo,
    productController.createProduct
  );
router.route('/list').get(productController.list);
router.route('/related/:productId').get(productController.relatedList);
router.route('/category').get(productController.listCategory);
router.route('/by/search').post(productController.listBySearch);
router.route('/photo/:productId').get(productController.productPhoto);
router.route('/search/').get(productController.querySearch);

router
  .route('/:productId')
  .get(productController.getProductById, productController.read);
router
  .route('/:productId/:userId')
  .delete(
    authController.requireSignin,
    authController.restrictTo,
    productController.deleteProduct
  );
router
  .route('/:productId/:userId')
  .put(
    authController.requireSignin,
    authController.restrictTo,
    productController.updateProduct
  );
module.exports = router;
