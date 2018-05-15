const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const mysql = require('mysql');
const session = require('express-session');
var routes = require('./routes.js');


const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
app.use(express.static(publicPath));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(routes);

app.get('/mensagens', (req, res) => {

  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'chatuser',
    password: 'chatpassword',
    database: 'chat_teste'
  });

  var queryString = 'SELECT * FROM mensagem';
  connection.query(queryString, (err, rows, fields) => {
    res.json(rows);
  });
});

app.get('/user/:id', (req, res) => {

  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'chatuser',
    password: 'chatpassword',
    database: 'chat_teste'
  });
  var id = req.params.id;

  var queryString = 'SELECT * FROM users WHERE id = ?'
  connection.query(queryString, [id], (err, rows, fields) => {
    if(err) {
      console.log('Err:', err);
      res.sendStatus(500);
      res.end();
      return;
    }
    res.json(rows);
  });
});

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name)) {
      return callback('Name and room name are required.');
    }

    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'chatuser',
      password: 'chatpassword',
      database: 'chat_teste'
    });

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));

    var queryString = 'SELECT * FROM mensagem';
    connection.query(queryString, (err, rows, fields) => {
      res.json(rows);
    });
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if(user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
