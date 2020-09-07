const express = require('express');
const router = express.Router();
const authController = require('../controller/authController.js');
const braintreeController = require('../controller/braintreeController');

router
  .route('/getToken/:userId')
  .get(authController.requireSignin, braintreeController.generateToken);
router
  .route('/payment/:userId')
  .post(authController.requireSignin, braintreeController.processPayment);
router.route('/hello').get(braintreeController.generate);
module.exports = router;
