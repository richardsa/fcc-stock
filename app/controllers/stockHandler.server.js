'use strict';
var path = process.cwd();
var Stocks = require('../models/stocks.js');

function stockHandler() {

  this.addStock = function(req, res) {
    var stockReq = req.params.id;
    console.log(stockReq);
    Stocks
      .findOne({
        stockSymbol: stockReq
      })
      .exec(function(err, doc) {
        if (err) {
          throw err;
        }
        if (doc) {
          console.log("if " + JSON.stringify(doc));
          res.end();
        } else {
          Stocks.collection.insert({
            stockSymbol: stockReq

          }, function(err, updatedResult) {
            if (err) {
              throw err;
            }
            console.log("else " + JSON.stringify(updatedResult));
            res.end();

          });


        }
      });


  };

  this.getStock = function(req, res) {
  Stocks.count({}, function( err, count){
    console.log( "Number of users:", count );
});
    var clickProjection = {
      '_id': false
    };
    Stocks.find({}).sort({
      '_id': -1
    }).limit(4).exec(function(err, doc) {
      if (err) {
        throw err;
      }


      res.send(doc);
    });

  };

  // delete stock symbol 
  this.deleteStock = function(req, res) {

    var stockReq = req.params.id;
    console.log("stock req " + stockReq);
    Stocks.findOne({
        stockSymbol: stockReq
      },
      function(err, stock) {
        if (err) {
          throw err;
        }

        if (stock) {
          stock.remove(function(err) {
            if (err) {
              throw err;
            }
            res.send("stock deleted");
          });
        }

      });


  }


  // quick and dirty function to clear tables
  this.getDrop = function(req, res) {

    Stocks.remove(function(err, p) {
      if (err) {
        throw err;
      } else {
        res.send("Stock Table Cleared");
      }
    });
  };

}


module.exports = stockHandler;