require('dotenv').config();
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

// Proxy requests to the user service
app.use('/users', proxy(process.env.USER_SERVICE_URL));

module.exports = app;
