window.$ = window.jQuery = require('jquery');
const io = require('socket.io-client')
var socket = io.connect('http://localhost:3000')

var user = {
	name: "testuser",
}

var state = {
	user: user,
	rooms: null,
	activeRoom: ["lobby"],
	chattingRoom: "lobby",
}

//room obj structure
// var rooms = {
//   "lobby": {
//     users: [],
//     activeUsers: [],
//     messages: [],
//   },
//   "room0": {
//     users: [],
//     activeUsers: [],
//     messages: ['123', '4444'],
//   },
// }

$(document).ready(function() {
	
	socket.emit('roomsReloadReq')
	socket.on('roomsReloadRes', function(data) {
		state.rooms = data
		$('#roomList').empty()
		for (var key in data) {
			$('#roomList').append("<li onclick=joinRoom(\""+key+"\")>"+key+"</li>")
		}
	})

	$('#roomsReload').click(function() {
		socket.emit('roomsReloadReq')
	})


	$('[name=createRoom]').submit(function(e) {
		e.preventDefault();
		socket.emit('createRoomReq', $('[name=roomName]').val())
		$('[name=roomName]').val('')
		socket.emit('roomsReloadReq')
		return false;
	})

	$('#leaveRoom').click(function() {
		console.log('leave room '+state.chattingRoom)
		socket.emit('leaveRoomReq', state.chattingRoom)
		state.activeRoom.splice(state.activeRoom.indexOf(state.chattingRoom), 1)
		state.chattingRoom = "lobby"
		$('#messages').empty()
		socket.emit('roomsReloadReq')
	})


	$('[name=messageSend]').submit(function(e) {
		e.preventDefault();
		socket.emit('chat message', user.name, $('#m').val(), state.chattingRoom);
		
		$('#m').val('');
		return false;
	})

	socket.on('chat message', function(userName, msg) {
		$('#messages').append($('<li>').text(userName+":"+msg));
	})



	socket.on('messages response', function(messages) {
		$('#messages').empty()
		console.log(messages)
		for (var i = 0; i < messages.length; i++) {
			$('#messages').append($('<li>').text(messages[i]))
		}
	})
})

//id=messages in li select!

function joinRoom(roomName) {
	if (state.chattingRoom !== roomName) {
		if (!(state.activeRoom.includes(roomName))) {
			console.log('join room '+roomName)
			socket.emit('joinRoomReq', roomName)
			state.activeRoom.push(roomName)
		}
		console.log('checkout '+roomName)
		state.chattingRoom = roomName
		socket.emit('messages request', roomName)
	}
}

console.log(socket.rooms)


