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
  console.log(succeeded); 
});


const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
app.use(express.static(publicPath));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 6000 }}));
app.use(bodyParser.json());
var server = http.createServer(app);
var io = socketIO(server);

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './../public/'));

app.use(routes);

io.on('connection', (socket) => {
  console.log('New user connected');
  socket.emit();

  socket.on('join', () => {
    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User joined the chat'));
  });

  socket.on('createMessage', (message, callback) => {
    io.emit('newMessage', message);
    callback();
  });

  socket.on('disconnect', () => {
      io.emit('newMessage', generateMessage('Admin', 'Usuario has left'));
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});


//// REDIS CONFIG ///
client.on("error", function (err) {
  console.log("Error " + err);
});

client.set("string key", "string val", redis.print);
client.get("string key", function(err, reply) {
  console.log(reply);
});
client.del('string key', function(err, response) {
  if (response == 1) {
     console.log("Deleted Successfully!")
  } else{
   console.log("Cannot delete")
  }
})