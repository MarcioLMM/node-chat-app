var userId = document.getElementById('userId').innerHTML;
var username = document.getElementById('user_name').innerHTML;

var socket = io({query: {
  userId: userId,
  nome: username
}});

socket.on('connect', function () {

});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('userList', function(users) {
  console.log('Chegou userList:', users);
  var ol = jQuery('<ol></ol>');
  
  users.forEach(function (user) {
    ol.append(jQuery('<li></li>').text(user.nome));
  });
  
  jQuery('#users').html(ol);
});

socket.on('newMessage', function (message) {
  console.log('Chegou mensagem:', message);
  var template = jQuery('#message-template').html();
  var html = `<li class="message">
  <div class="message__title">
  <h4>${message.from} - ${message.id}</h4>
  </div>
  <div class="message__body">
  <p>${message.text}</p>
  </div>
  </li>`
  jQuery('#messages').append(html);
});

jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();
  
  var messageTextbox = jQuery('[name=message]');
  console.log('New Message: ', messageTextbox.val());
  
  socket.emit('createMessage', {
    text: messageTextbox.val(),
    id: userId,
    from: username
  }, function () {
    messageTextbox.val('')
  });
});