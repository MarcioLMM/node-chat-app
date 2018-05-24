const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const session = require('express-session');
var routes = require('./routes.js');
var bodyParser = require('body-parser');
var redis = require("redis");
client = redis.createClient();
var exphbs  = require('express-handlebars');

client.flushall( function (err, succeeded) {
});

const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
app.use(express.static(publicPath));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 600000 }}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
var server = http.createServer(app);
var io = socketIO(server);

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './../public/'));

app.use(routes);

var users = [];
client.set("users", JSON.stringify(users));

io.on('connection', (socket) => {
  console.log('New user connected');
  var user = {id: socket.handshake.query.userId, socketId: socket.id, nome: socket.handshake.query.nome};
  updateUserList(user).then((users) => {
    console.log('server users:', users);
    io.emit('userList', users);
  })
  
  socket.on('join', () => {
    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User joined the chat'));
  });

  socket.on('createMessage', (message, callback) => {
    io.emit('newMessage', message);
    callback();
  });

  socket.on('disconnect', () => {
    // console.log('socket:', socket);
      removeUser(socket.id).then((users) => {
        io.emit('newMessage', generateMessage('Admin', 'Usuario deslogou'));
        io.emit('userList', users);
      });
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});

function updateUserList(usuario) {
  return new Promise((resolve, reject) => {
    client.get('users', (err, reply) => {
      let users = JSON.parse(reply);
      users = users.filter(user => {return user.id != usuario.id}); 
      users.push(usuario);
      client.set('users', JSON.stringify(users));
      console.log('update users:', users);
      resolve(users);
    });
  });
}

function removeUser(id) {
  return new Promise((resolve, reject) => {
    client.get('users', (err, reply) => {
      let users = JSON.parse(reply);
      console.log('vou remover o:', id);
      users = users.filter(user => {return user.socketId != id}); 
      client.set('users', JSON.stringify(users));
      console.log('remove users:', users);
      resolve(users);
    });
  });
}
  
  
  // client.del(socket.handshake.query.userId, function(err, response) {
    //   if (response == 1) {
  //      console.log("Deleted Successfully!");
  //   } else{
  //    console.log("Cannot delete");
  //   }
  // });
//// REDIS CONFIG ///
client.on("error", function (err) {
  console.log("Error " + err);
});