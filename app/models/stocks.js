'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stock = new Schema({

      StockSymbol: String,
      StockId: String,
      StockName: String
      
   
});

module.exports = mongoose.model('Stock', Stock);
