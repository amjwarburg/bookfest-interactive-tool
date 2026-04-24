import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('databases/bookfest.db');

import express from 'express';
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'bookfest_secret_key', 
    resave: false,
    saveUninitialized: false,
}))

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


import bcrypt from 'bcrypt';

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index')
})

import profileRouter from './routes/profile.js';
import booksRouter from './routes/books.js';
import usersRouter from './routes/users.js';
import session from 'express-session';

app.use('/books', booksRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter); 
app.use(express.static('static'));

app.listen(3000);