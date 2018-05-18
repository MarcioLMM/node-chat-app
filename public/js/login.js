$(document).ready(function () {
    $('#modal1').modal();
});

function enviaForm() {
    var nome = document.getElementById('ctNome').value;
    var email = document.getElementById('ctEmail2').value;
    var password = document.getElementById('ctPassword').value;

    axios.post('/cadastrar', {nome: nome, password: password, email: email}
    ).then(function(response) {
        if(response.status === 201) {
            sucesso(response.data.msg);
        }
    }).catch(function (error) {
        erro(error.response.data.error);
    });
}

function sucesso(mensagem) {
   $('#modal1').modal("close");
}

function erro(mensagem) {
   if(  $("#erroCadastro").is(':visible') == false)
   {
        $("#modal-cadastro").append(` <div id='erroCadastro' class='alert alert-dismissible'>  <span style='width: 100%;'>${mensagem}</span> <a href='#' onclick='removerErroCadastro();' class='close' data-dismiss='alert' aria-label='close' style='font-size: 1.6em;color: #fff;'>&times;</a> </div>  `);
   }
}
function removerErroCadastro()
{
    $("#erroCadastro").remove();
}
