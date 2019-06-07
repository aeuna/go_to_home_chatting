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


app.get('/login', function(req, res){
  res.render('login.html');
});

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




var rooms = ['room1', 'room2'];

io.on('connection', function(socket){

	socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('joinRoom', function(num){
    socket.join(rooms[num], function(){
      console.log('user join '+rooms[num]);
      io.to(rooms[num]).emit('joinRoom', num);
    });
  });

  socket.on('leaveRoom', function(num){
    socket.leave(rooms[num], function(){
      console.log('user leave '+rooms[num]);
      io.to(rooms[num]).emit('leaveRoom', num);
    })
  })

  socket.on('chat message', function(num, msg){
  	console.log('message: ' + msg+'from room '+num);
  	io.to(rooms[num]).emit('chat message', msg);
  });

});



app.get('/reloadroom', function(req, res) {
  console.log('reloadroom');
  res.json({ rooms: ['room1', 'room2'] })
});

app.get('/createroom', function(req, res) {
  console.log('createroom');
  res.json({ rooms: rooms })
})

app.get('/joinroom', function(req, res) {
  console.log('joinroom')
  res.json({ roomnumber: 1})
})




server.listen(3000, function(){
	console.log('Connected 3000');
});








