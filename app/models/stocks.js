'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stock = new Schema({

      stockSymbol: String
});

module.exports = mongoose.model('Stock', Stock);
