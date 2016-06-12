var express = require('express');
var app = express();


var http = require('http').Server(app);
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');


var io = require('socket.io')(http);

require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
    secret: 'secretClementine',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);



var port = process.env.PORT || 8080;

// based on following tutorial http://socket.io/get-started/chat/
io.on('connection', function(socket) {

    socket.on('socket reload', function(stockSym) {
        socket.broadcast.emit('socket reload', stockSym);
    });
    
});

http.listen(port, function() {
    console.log('listening on : ' + port);
});