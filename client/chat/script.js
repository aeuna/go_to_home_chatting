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
		$('.contacts').empty()
		for (var key in data) {
			var d = $('#roomdummy').clone(true)
			if (state.rooms.includes(key)) {
				d.attr("class", "active")
			}
			d.removeAttr('id style')
			d.children('.roomname').val(key)
			//"<li onclick=joinRoom(\""+key+"\")></li>"
			$('.contacts').append(d.show())
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
		var d
		if (userName == state.user.name) {
			d = $('#senddummy').clone(true)
			$(d).children('.msg_container_send').text(msg)
		}
		else {
			d = $('#chatdummy').clone(true)
			$(d).children('.msg_container').text(msg)
		}
		d.removeAttr('id style')
		$('.msg_card_body').append($(d));
	})



	socket.on('messages response', function(messages) {
		$('#messages').empty()
		console.log(messages)
		for (var i = 0; i < messages.length; i++) {
			var d
			if (userName == state.user.name) {
				d = $('#senddummy').clone(true)
				$(d).children('.msg_container_send').text(msg)
			}
			else {
				d = $('#chatdummy').clone(true)
				$(d).children('.msg_container').text(msg)
			}
			d.removeAttr('id style')
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


