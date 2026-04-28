A web application specially designed for the shropshire bookfest pupils

IDEAS:
Quotes page - each book has a list of associated quotes.
Filter by genres
A page with 'THIS YEAR'S SHORTLIST'
To be read tracker!

DONE:
Create a basic login and registration process (COMPLETED 24.04.26)
Create domains for profile, books, index (COMPLETED 24.04.26)

-- THE SEARCH FEATURE:

1. Initial load sync (check for '?q=...' and input that value) (COMPLETED 26.04.26)
2. Ensure the innerHTML made in Javascript uses the same CSS classes and struture as the server-side template: so that it doesn't jump/change styles (COMPLETED 27.04.26)
3. No results state: handle a case where the array is empty and show a friendly message 'no books found' (COMPLETED 27.04.26)
4. Use history.replaceState to keep the URL updated but not clutter up the user's history with lots of URLs (COMPLETED 26.04.26)
   Create a search bar for the books database (COMPLETED 27.04.26)

STILL TO IMPLEMENT:
Profile page and books page require login to access
Profile page HTML and CSS dynamically updated etc.
Session stays open for debugging (reduce times the admin has to login)
Login keeps email field filled if it is incorrect (refer to video on express from YouTube)
Email checking upon registration - sending an email and confirming account, for example
Multiple pages for the books page - so that you can click next and browse more of them. Maybe 30 per page (10 rows of 3)?

-- THE SEARCH FEATURE:

3. Debouncing - don't fetch on every keystroke, but use setTimeout to wait 300ms
4. Minimum character limit: trigger a fetch only if the user has typed two characters

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
