const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

// Proxy requests to the user service
app.use('/users', proxy('http://localhost:3002')); // Assuming user-service runs on port 3002

module.exports = app;
