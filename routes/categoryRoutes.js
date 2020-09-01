const express = require('express');
const categoryController = require('../controller/categoryController');
const authController = require('../controller/authController');
const router = express.Router();
router.route('/all').get(categoryController.getAllCategory);
router.route('/:categoryId').get(categoryController.getCategoryById);

router
  .route('/create/:userId')
  .post(
    authController.requireSignin,
    authController.restrictTo,
    categoryController.createCategory
  );
router
  .route('/:categoryId/:userId')
  .put(
    authController.requireSignin,
    authController.restrictTo,
    categoryController.updateCategory
  );
router
  .route('/:categoryId/:userId')
  .delete(
    authController.requireSignin,
    authController.restrictTo,
    categoryController.deleteCategory
  );

module.exports = router;
