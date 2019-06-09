var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cors = require('cors');

var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'wjsn13blossoms',
  database: 'ttoktalk'
});

db.connect(function(err){
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



app.post('/login', function(req,res){
  console.log('login request')
  var name = req.body.name;
  var pwd = req.body.pwd;

  var sql = `SELECT * FROM USER_INFO WHERE name = ?`;
  db.query(sql,[name], function(error,results,fields){
    if (error) {
      console.log(error)
    }
    var db_pwd = results[0].password
    if (pwd == db_pwd) {
      res.json({
        authorized: true,
      })
    }
    else {
      res.json({
        authorized: false,
      })
    }
  });
});

app.post('/register', function(req,res){
  console.log('register request')
  var name = req.body.name;
  var pwd = req.body.pwd;

  var sql = `INSERT INTO USER_INFO (name, password) VALUES (?,?)`;
  db.query(sql,[name,pwd], function(error,results,fields){
    if (error) {
      console.log(error)
    }
    if (results) {
      res.json({
        authorized: true,
      })
    }
    else {
      res.json({
        authorized: false,
      })
    }
  });
});



//this would be in database
var rooms = {
  "lobby": {
    users: [],
    activeUsers: [],
  },
}

io.on('connection', function(socket){
  console.log('user connected')
	socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  
  socket.on('chat message', function(userName, msg, roomFrom){
    // rooms[roomFrom].messages.push(msg)
    //testchat part must be changed with roomFrom
    db.query(`INSERT INTO testchat (name, message) VALUES (?, ?)`, [userName, msg], function(error, results, fields) {
      if (error) {
        console.log(userName+': ' + msg+'from room '+roomFrom, error);
      }
    })
    io.to(roomFrom).emit('chat message', userName, msg)
  });

  socket.on('messages request', function(roomName) {
    console.log('messages request')
    //testchat part must be changed with roomFrom
    db.query(`SELECT * FROM testchat`, function(error, results, fields) {
      if (results) {
        socket.emit('messages response', results)
      }
    })
  })


  socket.on('roomsReloadReq', function() {
    socket.emit('roomsReloadRes', rooms)
  })

  socket.on('createRoomReq', function(roomName) {
    console.log(createRoomReq)
    rooms[roomName] = {
      users: [],
      activeUsers: [],
    }
    //testchat part must be changed with roomFrom
    db.query(`CREATE TABLE roomName (
      id int not null auto_increment,
      name varchar(100) not null,
      message varchar(100) not null,
      ts timestamp default current_timestamp,
      primary key(id)
      );`, function(error, results, fields) {
        if (error) {
          console.log(error)
        }
      })
    io.emit('roomsReloadRes', rooms)
    console.log(rooms)
  })

  socket.on('joinRoomReq', function(roomName) {
    socket.join(roomName, function() {
      //database rooms.users add
      // rooms[roomName].messages.push('a user joined this room')
      db.query(`INSERT INTO testchat (name, message) VALUES (?, ?)`, ['server', 'a user joined'], function(error, results, fields) {
        if (error) {
          console.log('server: a user joined from room '+roomFrom, error);
        }
      })
      io.to(roomName).emit('chat message', 'a user joined this room');

      console.log(socket.rooms)
    })
  })

  socket.on('leaveRoomReq', function(roomName) {
    socket.leave(roomName, function() {
      //database rooms.users remove
      // rooms[roomName].messages.push('a user left this room')
      db.query(`INSERT INTO testchat (name, message) VALUES (?, ?)`, ['server', 'a user left'], function(error, results, fields) {
        if (error) {
          console.log('server: a user left from room '+roomFrom, error);
        }
      })
      io.to(roomName).emit('chat message', 'a user left this room')

      if (rooms[roomName].users.length == 0) {
        console.log('there are no users in '+roomName)
        delete rooms[roomName]
      }
    })
  })

});

server.listen(3000, function(){
	console.log('Connected 3000');
});

//legacy renderers
// app.get('/index', function(req, res){ 
//   res.render('index.html');
// });

// app.get('/register', function(req, res){
//   res.render('register.html');
// });






