A web application specially designed for the Shropshire Bookfest pupils.

# FEATURES:

## PAGES:

- [ ] Quotes page - each book has a list of associated quotes.
- [ ] A page with 'THIS YEAR'S SHORTLIST'
- [ ] Home page integration with dynamic movement (use AOS animate on scroll library or LottieFiles)
- [ ] Profile page which looks great and has books, badges and so forth
- [ ] Multiple pages for the books page - so that you can click next and browse more of them. Maybe 30 per page (10 rows of 3)?
- [x] (24.04.26) Create domains for profile, books, index

## BOOK FILTERING:

- [ ] Filter by genres
- [ ] Mood search - moods including funny, spooky, magical, heroic... Filter by these by clicking an emoji.

## USER DATA

- [ ] To be read tracker!
- [x] (24.04.26) Create a basic login and registration process
- [x] (30.04.26) Profile page requires login to access (a login required feature)
- [ ] Mark as read - drag it to a bookshelf?

## BOOK REVIEWS

- [ ] Book-O-Meter review style - visual slider (how fast did you read this? - Snail speed to rocket speed, how much did you laugh - no smiles - belly ache)

## EMAIL AND USER SAFETY

- [ ] Email checking upon registration - sending an email and confirming account, for example. Mailtrap as a fake inbox for testing. Use an Express mail module called Nodemailer

## LIBRARIAN MODE (ADMIN):

- [x] (04.05.26) Edit book feature on the manage page (including Book Award Years)
- [x] (03.05.26) Add book
- [x] (01.05.26) 'Librarian Mode' - is_admin boolean in users table - 'Manage' button on the navbar which opens a manage page
- [ ] Pending status on reviews and only admins can moderate
- [ ] Keyword filtering - reject a list of banned words on reviews before they reach the database

## FUN AND GAMES

- [ ] Some kind of 'reading flame' feature that glows if you've logged a review this week and get gradually stronger
- [ ] Badges! Bookworm badge (5 books), Book Award Hero (all six shortlisted books read and reviewed), First Critic (first review posted)
- [ ] Progress bars that fill as they read a booK?
- [ ] Dynamic toasts (when a user submits a review, use a library like SweetAlert2 to say 'Great Job + 10 Reading Points' with confetti)
- [ ] Take me on an adventure - random page for a book you haven't read before
- [ ] Book battles - vote on your favourite of two books

## THE SEARCH FEATURE:

- [x] (26.04.26) Initial load sync (check for '?q=...' and input that value)
- [x] (27.04.26) Ensure the innerHTML made in Javascript uses the same CSS classes and struture as the server-side template: so that it doesn't jump/change styles
- [x] (27.04.26) No results state: handle a case where the array is empty and show a friendly message 'no books found'
- [x] (26.04.26) Use history.replaceState to keep the URL updated but not clutter up the user's history with lots of URLs
- [x] (28.04.26) Debouncing - don't fetch on every keystroke, but use setTimeout to wait 300ms
- [x] (28.04.26) Minimum character limit: trigger a fetch only if the user has typed two characters

## ADMIN, UX AND EDITING

- [x] Session stays open for debugging (reduce times I (the admin) have to login when I'm programming)
- [x] (30.04.26) Login keeps email first name and last name fields filled if they are incorrect as page reloads

# COMMANDS:

-- Run phpliteadmin server on (http://localhost:8080/phpliteadmin.php/)
php -S localhost:8080

-- Run main server on (http://localhost:3000)
npm run devStart
