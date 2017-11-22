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
    api.sende_Bewegungsdaten(req, res);
})

app.get('/state', (req, res) => {
    api.get_State(req, res);
})

app.post('/zahleAus', (req, res) => {
    api.zahle_Aus(req, res);
})

app.listen(8000, function() {
    console.log('App listening on port 8000!');
});
