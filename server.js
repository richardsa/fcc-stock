var express = require('express');
var app = express();

//var server = require('http').Server(app);
var http = require('http').Server(app);
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

//var app = express();

//var io = require('socket.io')(server);
var io = require('socket.io')(http);
var nsp = io.of('/my-namespace');


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



//server.listen(port);

var port = process.env.PORT || 8080;
// based on following tutorial http://socket.io/get-started/chat/
io.on('connection', function(socket) {

  socket.on('delete stock', function(delSym) {
    socket.broadcast.emit('delete stock', delSym);
    
  });
   socket.on('search stock', function(stockSym) {
     socket.broadcast.emit('search stock', stockSym);
  });
  


});


http.listen(port, function() {
  console.log('listening on : ' + port);
});