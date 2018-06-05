var userId = document.getElementById('userId').innerHTML;
var username = document.getElementById('user_name').innerHTML;
var idTo = document.getElementById('idTo').innerHTML;

var socket = io({
  query: {
    userId: userId,
    nome: username,
    idTo: idTo
  }
});

socket.on('connect', function () {

});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('userList', function (users) {
  $(".lista-usuarios").remove();
  users.forEach(function (user) {
    if(user.id != userId) {
      $("#usuariosLogados").append(""+
        "<li class='lista-usuarios'>"+
          "<div class='card'>"+
              "<div class='row valign-wrapper' style='margin-bottom: -10px;'>"+
                  "<div class='col s4' style='display: flex;padding-top: 10px;padding-bottom: 10px;'>"+
                      "<div class='nameLista'> "+ user.nome+"</div>"+
                  "</div>"+
                  "<div class='col s8'>"+
                    "<a onclick='selectUser(this);' href='/chat/"+user.id+"'>"+
                      "<span class='black-text'> "+ user.nome+"</span>"+
                    "</a>"+
                  "</div>"+
              "</div>"+
          "</div>"+
        "</li>");
    }
    $('.nameLista').nameBadge(
      {
          border: { width: 0 },
          text: '#fff',
          margin: 0,
          size: 50,
          uppercase: true
      });
  });
});

socket.on('newMessage', function (message) {
  var mostra = message.idSender == idTo ? true : false;
  if (mostra || (message.idSender == userId && message.idTo == idTo)) {
    var lado = userId == message.idSender ? 'right' : 'left';
    var now = new Date();
    var now = now.getDate()+"/"+(now.getMonth() + 1)+"/"+now.getFullYear()+" "+now.get;

    var html = `
    <div class="div-balao div-balao-${lado}">
      <span class="quina-balao quina-${lado}"></span>
      <div class="balao-msg balao-${lado}">
        <p><b>${message.nome}</b></p>
        <span>
            ${message.conteudo}
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
  }

});

$("#btn-enviar").click(function () {
  if ($('#ctMenssagem').val().trim().length > 0) {
    socket.emit('createMessage', {
      conteudo: $('#ctMenssagem').val(),
      idSender: userId,
      nome: username,
      idTo: idTo
    }, function () {
    });
  }
});

function enviaFormAlterarNome() {
  var nome = document.getElementById('ctNome').value;

  if(nome !== ''){

    axios.post('/alterarNome', { nome: nome}
    ).then(function (response) {
      if (response.status === 201) {
        $(".nomeUsuarioLogado").text(nome);
        $(".namePrincipal").text(nome);
        $('#modalAlterarNome').modal("close");
        removerErroAlterarNome();
        $('#ctNome').val('');
        $('.namePrincipal').nameBadge(
          {
              border: { width: 0 },
              colors: ['#1abc9c'],
              text: '#fff',
              margin: 0,
              size: 64,
              uppercase: true
          });

      }
    }).catch(function (error) {
    
    });
  }
  else
  {
    if($("#erroAlterarNome").is(':visible') == false)
    {
          $('#ctNome').focus();
          $("#corpoModalAlterarNome").append(` <div id='erroAlterarNome' class='alert alert-dismissible'>  <span style='width: 100%;'>Preencha o campo corretamente!</span> <a href='#' onclick='removerErroAlterarNome();' class='close' data-dismiss='alert' aria-label='close' style='font-size: 1.6em;color: #fff;'>&times;</a> </div>  `);
    }
  }
}
function removerErroAlterarNome()
{
    $("#erroAlterarNome").remove();
}

(function ($) {
	$.fn.nameBadge = function (options) {
		var settings = $.extend({
			border: {
				color: '#ddd',
				width: 3
			},
			colors: ['#a3a948', '#edb92e', '#f85931', '#ce1836', '#009989'],
			text: '#fff',
			size: 72,
			margin: 5,
			middlename: true,
			uppercase: false
		}, options);
		return this.each(function () {
			var elementText = $(this).text();
			var initialLetters = elementText.match(settings.middlename ? /\b(\w)/g : /^\w|\b\w(?=\S+$)/g);
			var initials = initialLetters.join('');
			$(this).text(initials);
			$(this).css({
				'color': settings.text,
				'background-color': settings.colors[Math.floor(Math.random() * settings.colors.length)],
				'border': settings.border.width + 'px solid ' + settings.border.color,
				'display': 'inline-block',
				'font-family': 'Arial, \'Helvetica Neue\', Helvetica, sans-serif',
				'font-size': settings.size * 0.4,
				'border-radius': settings.size + 'px',
				'width': settings.size + 'px',
				'height': settings.size + 'px',
				'line-height': settings.size + 'px',
				'margin': settings.margin + 'px',
				'text-align': 'center',
				'text-transform' : settings.uppercase ? 'uppercase' : ''
			});
		});
	};
}(jQuery));