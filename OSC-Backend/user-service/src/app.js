const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
    res.send('User service is alive!');
});

// Here you would define your user routes, controllers, etc.
// For example:
// const userRouter = require('./api/users.routes');
// app.use('/', userRouter);


module.exports = app;
