const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index')
})

const profileRouter = require('./routes/profile');
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');

app.use('/books', booksRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);
app.use(express.static('static'));

app.listen(3000);