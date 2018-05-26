var userId = document.getElementById('userId').innerHTML;
var username = document.getElementById('user_name').innerHTML;
var idTo = document.getElementById('idTo').innerHTML;

console.log("Vou logar no io:", userId, username);
var socket = io({
  query: {
    userId: userId,
    nome: username
  }
});

socket.on('connect', function () {

});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('userList', function (users) {
  console.log('Chegou userList:', users);
  $(".lista-usuarios").remove();
  users.forEach(function (user) {
    $("#usuariosLogados").append(`<li class="lista-usuarios">
    <div class="card">
        <div class="row valign-wrapper" style="margin-bottom: -10px;">
            <div class="col s4" style="display: flex;padding-top: 10px;padding-bottom: 10px;">
                <img style="    height: 50px;" src="img/me.jpg" alt="" class="circle responsive-img">
                <!-- notice the "circle" class -->
            </div>
            <div class="col s8">
            <a href="/chat/${user.id}">
              <span class="black-text">${user.nome}</span>
            </a>
            </div>
        </div>
    </div>
  </li>`);
  });
});

socket.on('newMessage', function (message) {
  console.log('Chegou mensagem:', message);
  var mostra = message.id === idTo ? true : false;
  if (mostra || (message.id === userId && message.idTo === idTo)) {
    var lado = userId === message.id ? 'right' : 'left';
    var now = new Date();
    console.log("lado:", lado, "now:", now);

    var html = `
    <div class="div-balao div-balao-${lado}">
      <span class="quina-balao quina-${lado}"></span>
      <div class="balao-msg balao-${lado}">
        <p><b>${message.from}</b></p>
        <span>
            ${message.text}
        </span>
        <span class="balao-hora">${now}</span>
      </div>
    </div>`

    $(".container-msg").append(html);
    $(".container-msg").animate({ scrollTop: $('.container-msg').prop("scrollHeight") }, 500);
    $('#ctMenssagem').val('');
    $('#ctMenssagem').focus();
    $('#ctMenssagem').css('height', '22px');
  } else {
    console.log("Não vou mostrar");
  }

});

$("#btn-enviar").click(function () {
  if ($('#ctMenssagem').val().trim().length > 0) {
    socket.emit('createMessage', {
      text: $('#ctMenssagem').val(),
      id: userId,
      from: username,
      idTo: idTo
    }, function () {
    });
  }
});

function enviaFormAlterarNome() {
  var nome = document.getElementById('ctNome').value;
  console.log(nome);

  axios.post('/alterarNome', { nome: nome}
  ).then(function (response) {
    if (response.status === 201) {
      sucesso(response.data.msg);
    }
  }).catch(function (error) {
    erro(error.response.data.error);
  });
}