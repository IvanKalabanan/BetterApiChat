// Setup basic express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var ioFile = require('socket.io-file');
var port = process.env.PORT || 80;
var fs = require('fs');
var mainUrl = 'http://192.168.1.18:80/'

server.listen(80,'192.168.1.18', function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static('photo'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

var name = "xz";

// Chatroom

var numUsers = 0;

function findSocketByCookie() {
  for(var i in io.sockets.connected) {
    var socket = io.sockets.connected[i];
      return socket;
    }
}

app.post('/uploadPhoto', function(req, res) {
  var foto = new Buffer(req.body.file, 'base64');
  var photoUrl = new Date().getTime().toString() + '.jpg';
  fs.writeFileSync('photo/' + photoUrl , foto);
  console.log(foto);
  //var socket = findSocketByCookie();
  console.log(name);
  io.sockets.emit('new file', {
      username: name,
      file: mainUrl + photoUrl
});
  res.json([{
    code : 501,
    photo : mainUrl + photoUrl
  }]);
});

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('new file', function (data) {
  console.log('SOCKET - NEW FILE');
  });

  function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    name = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function (typing) {
    socket.broadcast.emit('typing', {
      username: socket.username,
      isTyping: typing
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username,
      isTyping: false
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
