var setup = require('./server/setup');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var users = {};
var rooms = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('new user', function(username) {
    if (username.length <= 10) { // dumb condition for now
      var newUser = setup.createUser(username, socket.id);
      users[socket.id] = newUser;
      socket.emit('login response', {user: newUser});
    } else {
      socket.emit('login response', {user: null});
    }
  });

  socket.on('new room', function(roomTitle) {
    if (roomTitle.length <= 10) {
      var newRoom = setup.createRoom(roomTitle, users[socket.id]);
      rooms[socket.id] = newRoom;
      socket.emit('room response', {room: newRoom});
    } else {
      socket.emit('room response', {room: null});
    }
  });

  socket.on('quit room', function() {
    // TODO: remove player from the room
  });

  socket.on('disconnect', function() {
    if (socket.id in users) {
      console.log(socket.id + " has left the server.");
      delete users[socket.id];
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
