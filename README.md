A web application specially designed for the shropshire bookfest pupils

Done:
Create a basic login and registration process
Create domains for profile, books, index

Still to implement:
Profile page and books page require login to access
Profile page HTML and CSS etc.
Session stays open for debugging (reduce times the admin has to login)
Login keeps email field filled if it is incorrect (refer to video on express from YouTube)
Create a search bar for the books database

Commands:
-- Run phpliteadmin server on (http://localhost:8080/phpliteadmin.php/)
php -S localhost:8080

-- Run main server
npm run devStart

-- Insert new book into database
INSERT INTO books (id, title, author, publication_year, reading_age) VALUES (1, 'The Boy With Big Decisions', 'Helen Rutter', 2025, '8-12');

Database entries:
-- Create book table in database file
CREATE TABLE books(
id INTEGER PRIMARY KEY,
title TEXT NOT NULL,
author TEXT NOT NULL,
publication_year INTEGER NOT NULL,
reading_age TEXT NOT NULL
);

-- Create user_books table
CREATE TABLE user_books(
user_id INTEGER,
book_id INTEGER,
review_text TEXT,
has_read BOOLEAN,
PRIMARY KEY(user_id, book_id),
FOREIGN KEY(user_id) REFERENCES users(id)
ON DELETE CASCADE
ON UPDATE NO ACTION,
FOREIGN KEY(book_id) REFERENCES books(id)
ON DELETE CASCADE
ON UPDATE NO ACTION
);

-- Create book_award_years table
CREATE TABLE book_award_years(
id INTEGER PRIMARY KEY,
year TEXT
);

-- Create book_award_entries table
CREATE TABLE book_award_entries(
book_id INTEGER,
year_id INTEGER,
status TEXT,
PRIMARY KEY(book_id, year_id)
FOREIGN KEY(book_id) REFERENCES books(id)
ON DELETE CASCADE
ON UPDATE NO ACTION,
FOREIGN KEY(year_id) REFERENCES book_award_years(id)
ON DELETE CASCADE
ON UPDATE NO ACTION
);
