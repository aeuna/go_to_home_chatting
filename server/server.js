var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'aeuna',
    database: 'my_db'
});

connection.connect(function(err){
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


app.get('/login', function(req, res){
  res.render('login.html', { alert: false }); //처음에 alert 값 false 비밀번호 틀릴시 alert는 true 되고 경고 반환
});

app.post('/login',function(req,res){
  var name = req.body.name;
  var pwd = req.body.pwd;

  var sql = `SELECT * FROM user_info WHERE username = ?`;
  connection.query(sql,[name],function(error,results,fields){
      if (results.length==0){
          res.render('login.html',{ alert:true });
      }
      else {
          
          var db_pwd = results[0].password;
          if(pwd == db_pwd){
              res.render('index.html', { username: name });
          }
          else{
              res.render('login.html', { alert:true });
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




io.on('connection', function(socket){ //소켓과의 connection establish
  console.log('A user connected');
  socket.on('login', function(data){ //소켓으로부터 login에 대한 listening
    console.log('client logged-in:' + data.username); //로그인 잘되는지 확인
    socket.username = data.username;
    io.emit('login', data.username);
  });

  socket.on('disconnect', function(){ //event에 대해 listening
    socket.broadcast.emit('logout',socket.username);
    console.log('user disconnected');
  });

  socket.on('chat message', function(data){
    console.log('name: %s message: %s', socket.username, data.msg);
    var msg = {
      username: socket.username,
      msg: data.msg
    };
     io.emit('chat message', msg); //basic namespace와 연결된 모든 소켓에게 event에 대해 전송
  });
});

server.listen(3000, function(){
   console.log('Connected 3000');
});









