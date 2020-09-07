const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');
const productRoutes = require('./Routes/productRoutes');
const braintreeRoutes = require('./Routes/braintreeRoutes');
const expressValidator = require('express-validator');
const conf = dotenv.config({ path: './.env' });
const HttpError = require('./util/httpError');
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('connection to DataBase successfully');
  });
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(expressValidator());
app.use(cors());
app.use('*', cors());

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/braintree', braintreeRoutes);
app.use('/api/v1/order', orderRoutes);
app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.use('*', (req, res, next) => {
  return next(new HttpError('this route is not found', 404));
});
app.use((err, req, res, next) => {
  res.status(err.code || 500).json({
    message: err.message || 'unkown error',
  });
});
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server start at port ${port}`);
});
