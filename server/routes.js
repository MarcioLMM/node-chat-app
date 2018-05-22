const express = require('express');
const router = express.Router();
const path = require('path');
const Sequelize = require('sequelize');
const session = require('express-session');
const sequelize = new Sequelize('mysql://chatuser:chatpassword@localhost/chat_teste');

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
})

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
    if(typeof sess.logado !== 'undefined' && sess.logado === true) {
        console.log('reqID:', req.session.userId);
        res.render('chat', {id: req.session.userId, nome: req.session.username});
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
            res.redirect('/chat');
        }).catch((error) => {
            res.render('login', {msg: "Dados inválidos"});
        });
    }
});

function usuarioValido(nome, password, email) {
    if(nome === '' || password === '' || email === '') {
        return false;
    }
    return true;
}

function abreConexaoMysql() {
    return connection = mysql.createConnection({
        host: 'localhost',
        user: 'chatuser',
        password: 'chatpassword',
        database: 'chat_teste'
    });
}

module.exports = router;