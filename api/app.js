const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const router = require('./src/router');

const app = express();

const pathToIndex = path.join(__dirname, '../client/index.html');

app.use(bodyParser.urlencoded({extended: true}));

app.use('/', router);

app.use('/*', (req, res) => {
  res.sendFile(pathToIndex);
});

module.exports = app;
