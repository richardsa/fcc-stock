'use strict';

var path = process.cwd();
var StockHandler = require(path + '/app/controllers/stockHandler.server.js');

module.exports = function (app, passport) {

	var stockHandler = new StockHandler();
	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/api/:id')
		.post(stockHandler.addStock)
		.delete(stockHandler.deleteStock);
		
	app.route('/api/')
		.get(stockHandler.getStock);


	//delete tables
	app.route('/testing')
        .get(stockHandler.getDrop);

};
