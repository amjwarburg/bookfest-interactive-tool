const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { text: 'world' })
})

const profileRouter = require('./routes/profile');
const booksRouter = require('./routes/books');

app.use('/books', booksRouter); 

app.use('/profile', profileRouter);

app.use(express.static('static'));

app.listen(3000);