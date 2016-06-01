'use strict';
var path = process.cwd();

var Stocks = require('../models/stocks.js');
var Counters = require('../models/counters.js');
var counterID;
var clickProjection = {
    '_id': false
};

function stockHandler() {

    this.addStock = function(req, res) {
      console.log("consoling bro " + req.params.id);
		res.send(req.params.id);

    }

  
  
    // quick and dirty function to clear tables
    this.getDrop = function(req, res) {


        Stocks.remove(function(err, p) {
            if (err) {
                throw err;
            } else {
                res.send("Both tables Cleared");
            }
        });

        Counters.collection.update({}, {
            'counterVal': 0
        }, function(err, result) {
            if (err) {
                throw err;
            }
            
        });

    };

}


module.exports = stockHandler;