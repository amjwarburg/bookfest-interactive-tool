const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render('users');
})

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', (req, res) => {
    res.send('logging in')
})

router.get('/logout', (req, res) => {
    res.send('logging out')
})

router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register', (req, res) => {
    res.send('registering user')
})

module.exports = router;