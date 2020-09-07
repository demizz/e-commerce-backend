const User = require('../models/userModel');
const braintree = require('braintree');
const dotenv = require('dotenv');
const { Transaction } = require('braintree');
const conf = dotenv.config({ path: '../.env' });

const gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: 'my5fr9p7ddy4kw72',
  publicKey: 'n6992trjhmscv8cb',
  privateKey: '1c317368f1930f7bc2b318ab1fc5d9fa',
});
exports.generateToken = (req, res, next) => {
  gateway.clientToken.generate({}, function (err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({
        status: 'success',
        response,
      });
    }
  });
};
exports.generate = (req, res, next) => {
  res.send('hello');
};
exports.processPayment = (req, res, next) => {
  let nonceFromTheClient = req.body.paymentMethodNonce;
  let amountFromTheClient = req.body.amount;
  let newTransaction = gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    },
    (error, result) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.status(200).json({
          status: 'success',
          result,
        });
      }
    }
  );
};
