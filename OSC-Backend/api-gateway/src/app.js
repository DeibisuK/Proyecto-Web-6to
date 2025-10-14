require('dotenv').config();
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

const userServiceUrl = process.env.USER_SERVICE_URL;
const productServiceUrl = process.env.PRODUCT_SERVICE_URL;

app.use('/u', proxy(userServiceUrl));
app.use('/p', proxy(productServiceUrl));
app.use('/b', proxy(process.env.BUY_SERVICE_URL));
app.use('/c', proxy(process.env.COURT_SERVICE_URL));
app.use('/m', proxy(process.env.MATCH_SERVICE_URL));
app.use('/i', proxy(process.env.CLOUDINARY_SERVICE_URL));

module.exports = app;
