'use strict';

(function() {
    var testing = document.querySelector('#testing');
    var socket = io();
    var socket2 = io();
    var stockInfo = document.querySelector('#stockMarketChart');
    var errorMessage = document.querySelector('#error');
    var symbolResponse = document.querySelector('#searchResults');
    var symbolCanvas = document.querySelector('#stockSymbols');
    // var symbol = [];
    var counterB = 0;
    var arrLength;


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

    var apiUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22)%20and%20startDate%20%3D%20%22" + begDate + "%22%20and%20endDate%20%3D%20%22" + today + "%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";



    function checkSymbol(data) {
        var symbolObject = JSON.parse(data);

        var response = symbolObject.query.results.quote;
        // testing.innerHTML = JSON.stringify(response);
        //if (response.hasOwnProperty('CompanyName')) {
        if (response.Name && response.symbol) {
            var symbol = response.symbol;
            apiUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22%2C%22" + symbol + "%22)%20and%20startDate%20%3D%20%22" + begDate + "%22%20and%20endDate%20%3D%20%22" + today + "%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
            ajaxFunctions.ajaxRequest('POST', appUrl + "/api/" + symbol, function() {
                ajaxFunctions.ajaxRequest('GET', appUrl + "/api/", getSymbols);
            });
            // ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, displayStocks));
        } else {
            errorMessage.innerHTML = "<div class='alert alert-danger'>Your symbols does not appear valid. Please try again</div>";
        }
        //symbolResponse.innerHTML = JSON.stringify(response);
    }

    function getSymbols(data) {

        var symbolsObject = JSON.parse(data);
        var symbolsStr = "";
        console.log = JSON.stringify(symbolsObject);
        arrLength = symbolsObject.length;
        var symbolOutput = "<div class='row'>";
        for (var i = 0; i < arrLength; i++) {
            if (i === arrLength - 1) {
                symbolsStr += "%22" + symbolsObject[i].stockSymbol + "%22";
            } else {
                symbolsStr += "%22" + symbolsObject[i].stockSymbol + "%22%2C";
            }
            symbolOutput += "<div class='col-sm-3 stockSymbol text-center'>";
            symbolOutput += "<h1>" + symbolsObject[i].stockSymbol + "</h1>";
            symbolOutput += "<button type='button' class='btn btn-danger btnDeleteStock' id='" + symbolsObject[i].stockSymbol + "'>Delete</a>";
            symbolOutput += "</div>";

        }

        symbolOutput += "</div>";

        symbolCanvas.innerHTML = symbolOutput;
        apiUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(" + symbolsStr + ")%20and%20startDate%20%3D%20%22" + begDate + "%22%20and%20endDate%20%3D%20%22" + today + "%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
        ajaxFunctions.ajaxRequest('GET', apiUrl, displayStocks);
    }

    function displayStocks(data) {
        var stocksObject = JSON.parse(data);

        var roughResults = stocksObject.query.results.quote;
        var results = [];
        var symbols = [];
        symbols.push(roughResults[1].Symbol);

        for (var i = 0; i < roughResults.length; i++) {
            var date = new Date(roughResults[i].Date);
            var counter = roughResults.length / arrLength;

            if (counterB === counter || i > counter) {
                symbols.push(roughResults[i].Symbol);
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


        // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(drawChart);

        // Callback that creates and populates a data table,
        // instantiates the pie chart, passes in the data and
        // draws it.
        function drawChart() {

            // Create the data table.
            var data = new google.visualization.DataTable();
            data.addColumn('date', 'Date');
            for (var i = 0; i < symbols.length; i++) {
                data.addColumn('number', symbols[i]);
            }

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
    $(document).ready(function() {
        google.charts.load('current', {
            'packages': ['corechart']
        });
    });

    // function for deleting stock symbol 
    $("#stockSymbols").on("click", ".btnDeleteStock", function() {
        var stockID = $(this).attr('id');
       
        socket2.emit('stock symbol delete', stockID);
        return false;
        
    });
    socket2.on('stock symbol delete', function(msg) {
          var deleteUrl = appUrl + "/api/" + msg;
          ajaxFunctions.ajaxRequest('DELETE', deleteUrl, function() {
              ajaxFunctions.ajaxRequest('GET', appUrl + "/api/", getSymbols);
          });
        
    });
    
    // display stocks call on load
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + "/api/", getSymbols));

    // display stocks after search using socets
    $('form').submit(function() {
        var symbol = $("#searchInput").val();
        socket.emit('chat message', symbol);
        return false;
    });
    socket.on('chat message', function(msg) {
        var symbolUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20%28%22" + msg + "%22%29&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json";
        ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', symbolUrl, checkSymbol));

    });

})();
