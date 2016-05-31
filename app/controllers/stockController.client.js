//https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20%28%22YHOO%22%29%20and%20startDate%20%3D%20%222009-09-11%22%20and%20endDate%20%3D%20%222010-03-10%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=

//https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22)%20and%20startDate%20%3D%20%222009-09-11%22%20and%20endDate%20%3D%20%222010-03-10%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=

// if symbol exists checker
//https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.stocks%20where%20symbol%3D%22YHOOooooooo%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=

'use strict';

(function() {

  var stockInfo = document.querySelector('#stockMarketChart');
  var testing = document.querySelector('#testing');
  var symbolResponse = document.querySelector('#searchResults');
  var symbol;
  var counterB = 0;

  // date 6 months past from: http://stackoverflow.com/a/1648448
  function addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
  }

  // format date function from: http://stackoverflow.com/a/23593099
  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  var begDateFull = addMonths(new Date(), -6);
  var today = new Date();

  var begDate = formatDate(begDateFull);
  today = formatDate(today);

  // var apiUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20%28%22YHOO%22%29%20and%20startDate%20%3D%20%222015-05-24%22%20and%20endDate%20%3D%20%222016-05-23%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";

  //var apiUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22)%20and%20startDate%20%3D%20%222015-05-24%22%20and%20endDate%20%3D%20%222015-09-20%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
  var apiUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22)%20and%20startDate%20%3D%20%22" + begDate + "%22%20and%20endDate%20%3D%20%22" + today + "%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";


  function checkSymbol(data) {
    var symbolObject = JSON.parse(data);
    var response = symbolObject.query.results.quote;
    //if (response.hasOwnProperty('CompanyName')) {
    if (response.Name) {
      response = "symbol does exist";
    } else {
      response = "symbol does not exist";
    }
    symbolResponse.innerHTML = JSON.stringify(response);
  }

  function displayStocks(data) {
    var stocksObject = JSON.parse(data);
    //testing.innerHTML = JSON.stringify(stocksObject);
    var roughResults = stocksObject.query.results.quote;
    var results = [];
    symbol = roughResults[1].Symbol;

    for (var i = 0; i < roughResults.length; i++) {
      var date = new Date(roughResults[i].Date);
      var counter = roughResults.length / 4;

      if (counterB === counter || i > counter) {
        for (var j = 0; j < results.length; j++) {
          var price = parseFloat($.trim(roughResults[i].Close));
          price = Math.round(price * 100) / 100;
          results[j].push(price);
          i++;
        }
        i--;
        counterB = 0;

      } else {
        var price = parseFloat($.trim(roughResults[i].Close));
        price = Math.round(price * 100) / 100;
        var datePrice = [date, price];
        results.push(datePrice);
        counterB++;
      }


    }

    // Load the Visualization API and the corechart package.
    google.charts.load('current', {
      'packages': ['corechart']
    });

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    function drawChart() {

      // Create the data table.
      var data = new google.visualization.DataTable();
      data.addColumn('date', 'Date');
      data.addColumn('number', symbol);
      data.addColumn('number', 'AAPL');
      data.addColumn('number', 'GOOG');
      data.addColumn('number', 'MFST');
      // testing.innerHTML = results;
      data.addRows(results);

      // Set chart options
      var options = {
        'title': "chart",
        'width': 1200,
        'height': 600
      };

      // Instantiate and draw our chart, passing in some options.
      var chart = new google.visualization.LineChart(document.getElementById('stockMarketChart'));
      chart.draw(data, options);
    }

  }

// display stocks call on load
  ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, displayStocks));

  $("#searchSubmit").click(function() {
    var symbol = $("#searchInput").val();
   // var symbolUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.stocks%20where%20symbol%3D%22" + symbol + "%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
     var symbolUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20%28%22" + symbol +  "%22%29&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json"
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', symbolUrl, checkSymbol));
  });

})();