A web application specially designed for the shropshire bookfest pupils

IDEAS:

- Quotes page - each book has a list of associated quotes.
- Filter by genres
- A page with 'THIS YEAR'S SHORTLIST'
- To be read tracker!
- 'Librarian Mode' - is_admin boolean in users table - 'Manage' button on the navbar which opens a Bootstrap Modal
- Pending status on reviews and only admins can moderate
- Keyword filtering - reject a list of banned words on reviews before they reach the database
- Email checking upon registration - sending an email and confirming account, for example. Mailtrap as a fake inbox for testing. Use an Express mail module called Nodemailer
- Some kind of 'reading flame' feature that glows if you've logged a review this week and get gradually stronger
- Badges! Bookworm badge (5 books), Book Award Hero (all six shortlisted books read and reviewed), First Critic (first review posted)
- Mood search - moods including funny, spooky, magical, heroic... Filter by these by clicking an emoji.
- Book-O-Meter review style - visual slider (how fast did you read this? - Snail speed to rocket speed, how much did you laugh - no smiles - belly ache)
- Home page is dynamic (use AOS animate on scroll library or LottieFiles)
- Mark as read - drag it to a bookshelf?
- Progress bars that fill as they read a booK?
- Dynamic toasts (when a user submits a review, use a library like SweetAlert2 to say 'Great Job + 10 Reading Points' with confetti)
- Session stays open for debugging (reduce times I (the admin) have to login when I'm programming)
- Multiple pages for the books page - so that you can click next and browse more of them. Maybe 30 per page (10 rows of 3)?
- Take me on an adventure - random page for a book you haven't read before
- Book battles - vote on your favourite of two books

DONE:

- Create a basic login and registration process (COMPLETED 24.04.26)
- Create domains for profile, books, index (COMPLETED 24.04.26)
- Profile page requires login to access (a login required feature) (COMPLETED 30.04.26)
- Login keeps email first name and last name fields filled if they are incorrect as page reloads (COMPLETED 30.04.26)

-- THE SEARCH FEATURE:

1. Initial load sync (check for '?q=...' and input that value) (COMPLETED 26.04.26)
2. Ensure the innerHTML made in Javascript uses the same CSS classes and struture as the server-side template: so that it doesn't jump/change styles (COMPLETED 27.04.26)
3. No results state: handle a case where the array is empty and show a friendly message 'no books found' (COMPLETED 27.04.26)
4. Use history.replaceState to keep the URL updated but not clutter up the user's history with lots of URLs (COMPLETED 26.04.26)
5. Debouncing - don't fetch on every keystroke, but use setTimeout to wait 300ms (COMPLETED 28.04.26)
6. Minimum character limit: trigger a fetch only if the user has typed two characters (COMPLETED 28.04.26)

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
