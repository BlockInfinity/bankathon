'use strict';
const path = require("path");
const express = require('express');
const app = express();
const api = require('./server/api.js');
module.exports = app; // for testing
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json

app.use('/', express.static('public'))

// Parameters: request.body.data
app.post('/sendeBewegungsdaten', (req, res) => {
    api.sendeBewegungsdaten(req, res);
})

app.get('/state', (req, res) => {
    api.getState(req, res);
})

app.post('/zahleInKryptoAus', (req, res) => {
    api.zahleInKryptoAus(req, res);
})

app.post('/zahleInEuroAus', (req, res) => {
    api.zahleInEuroAus(req, res);
})

app.listen(8000, function() {
    console.log('App listening on port 8000!');
});
