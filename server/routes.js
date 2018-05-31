const express = require('express');
const router = express.Router();
const path = require('path');
const Sequelize = require('sequelize');
const session = require('express-session');
const sequelize = new Sequelize('mysql://chatuser:chatpassword@localhost/chat_teste');
const Op = Sequelize.Op;

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const Usuario = sequelize.define('users', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false }
},
{
    timestamps: false,
});

const Mensagem = sequelize.define('mensagem', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    conteudo: { type: Sequelize.STRING, allowNull: false },
    idSender: { type: Sequelize.INTEGER, allowNull: false },
    idTo: { type: Sequelize.INTEGER, allowNull: false },
    nome: { type: Sequelize.STRING, allowNull: false },
},
{
    timestamps: false,
});

router.get('/login', (req, res) => {
    sess = req.session;
    if(typeof sess.logado !== 'undefined' && sess.logado === true) {
        res.redirect('/chat');
        return;
    }
    res.render('login');
});

router.get('/chat', (req, res) => {
    sess = req.session;
    var idTo = req.session.idTo
    if(typeof sess.logado !== 'undefined' && sess.logado === true) {
        if(idTo !== undefined) {
            var id = req.session.userId;
            Mensagem.findAll({where: {idSender: {[Op.or]: [id, idTo]}, idTo: {[Op.or]: [id, idTo]}}}
            ).then(mensagens => {
                var htmlFinal = [];
                // mensagens.forEach(mensagem => {
                //     var lado = id === mensagem.idSender ? 'right' : 'left';
                //     var html = `
                //     <div class="div-balao div-balao-${lado}">
                //     <span class="quina-balao quina-${lado}"></span>
                //     <div class="balao-msg balao-${lado}">
                //         <p><b>${mensagem.id}</b></p>
                //         <span>
                //             ${mensagem.conteudo}
                //         </span>
                //         <span class="balao-hora">Data Qualquer</span>
                //     </div>
                //     </div>
                //     </br>`
                //     htmlFinal.push(html);
                // });
                res.render('chat', {id: req.session.userId, nome: req.session.username, email: req.session.userEmail, idTo: idTo, mensagens: htmlFinal});
                console.log('marcelo passeei :::');
            }).catch((error) => {
                console.log('Deu ruim:', error);
            });
        } else {
            res.render('chat', {id: req.session.userId, nome: req.session.username, email: req.session.userEmail, idTo: idTo});
        }
        return;
    }
    res.redirect('/login');
});

router.get('/chat/:id', (req, res) => {
    sess = req.session;
    req.session.idTo = req.params.id;
    if(typeof sess.logado !== 'undefined' && sess.logado === true) {
        res.redirect('/chat');
        return;
    }
    res.redirect('/login');
});

router.post('/cadastrar', (req, res) => {
    var nome = req.body.nome;
    var password = req.body.password;
    var email = req.body.email;

    if(usuarioValido(nome, password, email)) {
        Usuario.create({nome: nome, password: password, email: email}
        ).then(() => {
            res.status(201).json({msg: "Usuario cadastrado com sucesso"});
        }).catch(() => {
            res.status(500).send({ error: 'Email ja cadastrado' });
        });
    } else {
        res.sendStatus(500).json({msg: "Dados inválidos"});
    }
});

router.post('/login', (req, res) => {
    var password = req.body.password;
    var email = req.body.email;
    console.log("Password:", password, "Email", email);
    if(usuarioValido('teste', password, email)) {
        Usuario.findAll({where: {password: password, email: email}}
        ).then(user => {
            if (user[0] === undefined) {
                res.render('login', {msg: "Usuário inválido"});
                return;
            }
            req.session.logado = true;
            req.session.userId = user[0].id;
            req.session.username = user[0].nome;
            req.session.userEmail = email;
            console.log(req.session);
            res.redirect('/chat');
        }).catch((error) => {
            res.render('login', {msg: "Dados inválidos"});
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.logado = false;
    req.session.userId = null;
    req.session.username = null;
    req.session.userEmail = null;
    res.redirect('/login');
});

router.post('/alterarNome', (req, res) => {
    var nomeRecebido = req.body.nome;
    console.log(nomeRecebido);
    console.log("cheguei");
   
    Usuario.update({nome: nomeRecebido},{where: { email: req.session.userEmail }}
    ).then(() => {
        res.status(201).json({msg: "Usuario alterado com sucesso"});
    }).catch(() => {
        res.status(500).send({ error: 'nao alterado' });
    });
});

function usuarioValido(nome, password, email) {
    if(nome === '' || password === '' || email === '') {
        return false;
    }
    return true;
}

function salvaMensagem(mensagem) {
    console.log(mensagem);
    if(mensagem.idTo != "") {
        Mensagem.create({conteudo: mensagem.conteudo, idSender: mensagem.idSender, idTo: mensagem.idTo, nome: mensagem.nome}
        ).then(() => {
            console.log('Sucesso');
        }).catch((err) => {
            console.log('Deu merda:', err);
        });
    }
    console.log('Não entrei');
}

function pegaMensagens(id, idTo) {
    return new Promise((resolve, reject) => {
        console.log('idTo la dentro:', idTo, idTo !== undefined);
        if(idTo !== undefined) {
            Mensagem.findAll({where: {idSender: {[Op.or]: [id, idTo]}, idTo: {[Op.or]: [id, idTo]}}}
            ).then(mensagens => {
                console.log('Vou retornar as mensagens');
                mensagens.forEach(mensagem => console.log(mensagem.dataValues));
                resolve(mensagens);
            });
        }
        console.log('Estou aqui fora');
      });
}

module.exports = {router, salvaMensagem, pegaMensagens};