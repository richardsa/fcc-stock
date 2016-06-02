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
    var stockReq = req.params.id;
    Counters.collection.findOne({}, clickProjection, function(err, result) {
      if (err) {
        throw err;
      }

      if (result) {
        counterID = result.counterVal;

      } else {
        Counters.collection.insert({
          'counterVal': 1
        }, function(err) {
          if (err) {
            throw err;
          }
          counterID = result.counterVal;
        });
      }
    });

    Stocks
      .findOneAndUpdate({
        stockSymbol: stockReq
      }, {
        stockId: counterID
      }, {
        'new': true
      })
      .exec(function(err, doc) {
        if (err) {
          throw err;
        } 
        if (doc){
          Counters.collection.findAndModify({}, {
            '_id': 1
          }, {
            $inc: {
              'counterVal': 1
            }
          }, function(err, updatedResult) {
            if (err) {
              throw err;
            }
            res.send(updatedResult);

          });
      //  res.json(doc);
      } else {
        Stocks.collection.insert({
          stockSymbol: stockReq,
          stockId: counterID
        }, function(err) {
          if (err) {
            throw err;
          }
          Counters.collection.findAndModify({}, {
            '_id': 1
          }, {
            $inc: {
              'counterVal': 1
            }
          }, function(err, updatedResult) {
            if (err) {
              throw err;
            }
            res.send(updatedResult);

          });
        });
      }
      });


  };

  this.getStock = function(req, res) {
    console.log("yeah buddy");
    var clickProjection = {
      '_id': false
    };
    Stocks.collection.find({

    }, clickProjection).sort({
      'stockId': -1
    }).limit(5).toArray(function(err, docs) {
      if (err) throw err;

      res.send(docs);
    });
  };



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