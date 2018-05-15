var express = require('express');
var router = express.Router();
const path = require('path');

router.get('/login', (req, res) => {
    sess = req.session;
    sess.logado = true;
    res.sendFile('login.html', {root: path.join(__dirname, './../public')});
});
  
router.get('/chat', (req, res) => {
    sess = req.session;
    if(typeof sess.logado !== 'undefined' && sess.logado === true) {
        res.sendFile('chat.html', {root: path.join(__dirname, './../public')});
        return
    }
    res.sendFile('login.html', {root: path.join(__dirname, './../public')});
});

router.use( function(req, res, next) {
    sess = req.session;
    if(typeof sess.logado !== 'undefined' && sess.logado === true) {
        res.sendFile('chat.html', {root: path.join(__dirname, './../public')});
        return
    }
    res.sendFile('login.html', {root: path.join(__dirname, './../public')});
});

module.exports = router;