var State = {
    LOGIN : 0,
    MAIN : 1,
    CREATEROOM : 2,
    LOBBY: 3,
    GAME: 4,
}

var socket = io();
var state = State.LOGIN;
// var request = require("request");
var currentUser = null;
var currentRoom = null;
var rooms = [];

function toggleView() {
  switch(state) {
    case State.LOGIN:
      const loginHTML = `
          <div class=\"center_container\" style=\"margin-top: 20%;\">
            <p class=\"h1\">CHINESE CHECKERS</p>
            <input type=\"text\" id=\"username\" placeholder=\"Username\"><br>
            <p class=\"h2\" id=\"reply\"></p>
            <button id=\"submit\" onClick=\"sendUsernameToServer()\">LOGIN</button>
          </div>
      `;
      document.getElementById("content").innerHTML = loginHTML;
      document.getElementById("username").addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("submit").click();
        }
      });
      break;
    case State.MAIN:
      const mainHTML = `
          <div class=\"center_container\">
            <p class=\"h1\">Main Page</p>
            <button style=\"width: 200px;\" onClick=\"switchToState(2)\">Create Room</button>
            <div id="roomsContainer"></div>
          </div>
      `;

      var roomString = "";
      for (var key in rooms) {
        if (rooms.hasOwnProperty(key)) {
          roomString += "<div class=\"room_container\">";
          if (Object.keys(rooms[key].players).length >= 6) { roomString += "<p class=\"room_title\">" + rooms[key].title + "</p>" }
          else { roomString += "<a class=\"room_title\" onclick=enterRoom(\"" + key + "\")>" + rooms[key].title + "</a>" }
          roomString += "<div class=\"room_info_container\">";
          roomString += "<p class=\"room_capacity\">" + "(" + Object.keys(rooms[key].players).length + "/6" + ")" + " players" + "</p>"
                      + "<p class=\"room_owner\">created by " + rooms[key].owner.username + ".</p>";
          roomString += "</div>"
          roomString += "</div>";
        }
      }
      document.getElementById("content").innerHTML = mainHTML;
      document.getElementById("roomsContainer").innerHTML = roomString;
      break;
    case State.CREATEROOM:
      const createRoomHTML = `
          <div class=\"center_container\">
            <p class=\"h1\">Room Creation</p>
            <input type=\"text\" id=\"roomTitle\" placeholder=\"Room Title\"><br>
            <p class=\"h2\" id=\"reply\"></p>
            <button id=\"submit\" style=\"width: 130px;\" onClick=\"createRoom()\">Create Room</button>
          </div>
      `;
      document.getElementById("content").innerHTML = createRoomHTML;
      document.getElementById("roomTitle").addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("submit").click();
        }
      });
      break;
    case State.LOBBY:
      const lobbyHTML = `
          <div class=\"center_container\">
            <p class=\"h1\" id="roomName"></p>
            <p class=\"h2\" id="roomName">Players</p>
            <div id=\"members_container\"></div>
            <button style=\"margin-right: 20px; margin-top: 10px; display: inline-block;\" onClick=\"startGame()\">Start Game</button>
            <button style=\"margin-top: 10px; display: inline-block;\" onClick=\"quitRoom()\">Quit Room</button>
          </div>
      `;
      document.getElementById("content").innerHTML = lobbyHTML;
      document.getElementById("roomName").innerHTML = currentRoom.title;
      var memberString = "";
      for (var socketid in currentRoom.players) {
        memberString += "<div class=\"user_container\">";
        memberString += "<p class=\"username_text\">" + currentRoom.players[socketid].username + "</p>";
        memberString += "</div>";
      }
      document.getElementById("members_container").innerHTML = memberString;
      break;
  }
}

function switchToState(stateKey) {
  switch(stateKey) {
    case State.CREATEROOM:
      state=State.CREATEROOM;
      toggleView();
      break;
    case State.MAIN:
      getRooms();
      currentRoom = null;
      state=State.MAIN;
      toggleView();
      break;
    case State.LOBBY:
      state = State.LOBBY;
      toggleView();
  }
}

function quitRoom() {
  socket.emit('quit room', currentRoom.id);
  switchToState(State.MAIN);
  return;
}

function sendUsernameToServer() {
  socket.emit('new user', $('#username').val());
  return;
};

function createRoom() {
  socket.emit('new room', $('#roomTitle').val());
  return;
}

function enterRoom(roomid) {
  socket.emit('enter room', roomid);
  return;
}

function getRooms() {
  socket.emit('get rooms');
  return;
}

function joinServerRoomOnResponse() {
  socket.emit('open room connection', currentRoom.id);
}

function startGame() {
  return;
}

/*
function sendMessage() {
  var message = { // make this an enum later
    roomId: currentRoom.title,
    message: "hello room"
  }
  socket.emit('room message', message);
}*/

socket.on('room message', function(data){
  // prints message from server onto console
  console.log(data);
});

socket.on('get room response', function(data) {
  rooms = data.rooms;
  state = State.MAIN;
  toggleView();
});

socket.on('login response', function(data) {
  if (data.user != null) {
    currentUser = data.user;
    var roomsSocket = io('/rooms');
    switchToState(State.MAIN);
  } else {
    document.getElementById("reply").innerHTML = data.error;
  }
});

socket.on('room response', function(data) {
  if (data.room) {
    currentRoom = data.room;
    joinServerRoomOnResponse();
    switchToState(State.LOBBY);
  } else {
    document.getElementById("reply").innerHTML = data.error;
  }
});

socket.on('room update', function(data) {
  currentRoom = data.room;
  switchToState(State.LOBBY);
});

toggleView();