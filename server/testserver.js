var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cors = require('cors');

var dbconnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'wjsn13blossoms',
  database: 'testdb'
});

dbconnection.connect(function(err){
  if(err){
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('Success DB connection');
});

app.locals.pretty = true;
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended:false }));
app.use(cors());




app.post('/login',function(req,res){
  var name = req.body.name;
  var pwd = req.body.pwd;

  var sql = `SELECT * FROM user_info WHERE username = ?`;
  dbconnection.query(sql,[name],function(error,results,fields){
      if (results.length==0){
          res.render('login.html',{ alert:true});
      }
      else {
          
          var db_pwd = results[0].password;
          if(pwd == db_pwd){
              res.render('index.html');
          }
          else{
              res.render('login.html', { alert:true});
          }
      }
  });
});

app.get('/index', function(req, res){ 
  res.render('index.html');
});

app.get('/register', function(req, res){
  res.render('register.html');
});

app.post('/register', function(req,res){
  var name = req.body.name;
  var pwd = req.body.pwd;
  var pwdconf = req.body.pwdconf; 

  var sql = `INSERT INTO user_info (username, password) VALUES (?,?)`;
  connection.query(sql,[name,pwd],function(error,results,fields){
    console.log(results);
  });
  res.redirect('/login');
});



//this would be in database
var rooms = {
  "lobby": {
    users: [],
    activeUsers: [],
    messages: [],
  },
  "room0": {
    users: [],
    activeUsers: [],
    messages: ['123', '4444'],
  },
}

io.on('connection', function(socket){
  console.log('user connected')
	socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  
  socket.on('chat message', function(userName, msg, roomFrom){
  	console.log(userName+': ' + msg+'from room '+roomFrom);
    rooms[roomFrom].messages.push(msg)
    io.to(roomFrom).emit('chat message', userName, msg)
  });

  socket.on('messages request', function(roomName) {
    socket.emit('messages response', rooms[roomName].messages)
  })


  socket.on('roomsReloadReq', function() {
    socket.emit('roomsReloadRes', rooms)//don't go to all users!!!
  })

  socket.on('createRoomReq', function(roomName) {
    //ToDo database
    rooms[roomName] = {
      users: [],
      activeUsers: [],
      messages: []
    }
    io.emit('roomsReloadRes', rooms)
    console.log(rooms)
  })

  socket.on('joinRoomReq', function(roomName) {
    socket.join(roomName, function() {
      //database rooms.users add
      rooms[roomName].messages.push('a user joined this room')
      io.to(roomName).emit('chat message', 'a user joined this room');
    })
  })

  socket.on('leaveRoomReq', function(roomName) {
    socket.leave(roomName, function() {
      //database rooms.users remove
      rooms[roomName].messages.push('a user left this room')
      io.to(roomName).emit('chat message', 'a user left this room')

      if (rooms[roomName].users.length == 0) {
        delete rooms[roomName]
      }
    })
  })

});

server.listen(3000, function(){
	console.log('Connected 3000');
});








