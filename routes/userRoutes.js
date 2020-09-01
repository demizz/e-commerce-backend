const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');

router
  .route('secret/:userId')
  .get(
    authController.requireSignin,
    authController.restrictTo,
    userController.getUserById
  );
router
  .route('/:userId')
  .get(authController.requireSignin, userController.getUserById);
router
  .route('/update/:userId')
  .put(authController.requireSignin, userController.updateUserById);
module.exports = router;
