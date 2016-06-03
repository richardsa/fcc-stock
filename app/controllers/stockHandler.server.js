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
          Stocks.collection.insert({
            stockSymbol: stockReq,
            stockId: counterID
          }, function(err) {
            if (err) {
              throw err;
            }
          
          });
          res.send(updatedResult);

        });
      
      }
      });


  };

  this.getStock = function(req, res) {
    
    var clickProjection = {
      '_id': false
    };
    Stocks.find({}).sort({
      'stockId': 1
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
		Stocks.findOne({
						stockSymbol: stockReq
				},
				function(err, poll) {
						if (!err) {

								poll.remove(function(err) {
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