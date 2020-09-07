const express = require('express');
const router = express.Router();
const authController = require('../controller/authController.js');
const orderController = require('../controller/orderController');
const userController = require('../controller/userController');
const productController = require('../controller/productController');
router
  .route('/create/:userId')
  .post(
    authController.requireSignin,
    userController.addOrderToUserHistory,
    productController.decreaseQuantity,
    orderController.createOrder
  );
router
  .route('/list/:userId')
  .get(
    authController.requireSignin,
    authController.restrictTo,
    orderController.listOfAllOrders
  );
router
  .route('/status-values/:userId')
  .get(
    authController.requireSignin,
    authController.restrictTo,
    orderController.getStatusValues
  );
router
  .route('/update-order/:orderId/:userId')
  .put(
    authController.requireSignin,
    authController.restrictTo,
    orderController.updateOrderStatus
  );

module.exports = router;
