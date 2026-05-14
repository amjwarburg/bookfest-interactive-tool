# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start the development server (auto-reloads via nodemon, port 3000)
npm run devStart

# Start the database admin UI (phpliteadmin at http://localhost:8080/phpliteadmin.php)
php -S localhost:8080
```

Requires a `.env` file with `SESSION_SECRET` set (see `.env.example`). There are no tests.

## Architecture

**Stack:** Node.js + Express 5, SQLite3, EJS templates, Bootstrap 5 (CDN), Vanilla JS.

**Entry point:** `server.js` — configures sessions, static files, and mounts three routers:
- `/books` → `routes/books.js`
- `/profile` → `routes/profile.js`
- `/users` → `middleware/auth.js` (which in turn mounts `routes/login.js` and `routes/register.js`)

**Authentication:** `middleware/auth.js` exports two middleware functions used directly in route definitions:
- `ensureAuthenticated` — checks `req.session.user` exists
- `isAdmin` — queries the DB for `is_admin = 1` on every request (not cached)

On login, `req.session.user` is set to `{ id, firstName, lastName, email, is_admin }`. This object is also exposed to all EJS templates via `res.locals.user`.

**Database:** Raw SQLite3, no ORM. Each route file opens its own connection to `databases/bookfest.db`. `routes/books.js` promisifies the three core methods for use with async/await:

```js
const collectData = promisify(db.all.bind(db));  // SELECT many rows
const runQuery    = promisify(db.run.bind(db));   // INSERT / UPDATE / DELETE
const getOne      = promisify(db.get.bind(db));   // SELECT one row
```

New DB work in `routes/books.js` should use these helpers and async/await. Other route files still use raw callbacks — converting them to async/await is preferred when touching them.

**Schema summary:**
- `users` — id, firstName, lastName, email, hash (bcrypt), is_admin (0/1)
- `books` — id, title, author, publication_year, reading_age, cover_image (path)
- `genres`, `moods` — lookup tables (`moods` has an `emoji` column)
- `book_genres`, `book_moods` — junction tables (many-to-many)
- `user_books` — tracks which user has added which book

**Views:** EJS templates in `views/`. All pages include `views/layout.ejs` via `<%- include('layout') %>`, which renders the navbar and loads Bootstrap and font CDNs. SweetAlert2 (CDN) is used for all user-facing popup messages.

**File uploads:** Multer (`middleware/multer.js`) stores book cover images in `static/images/book_covers/` using the original filename lowercased. The path stored in the DB is `/images/book_covers/{filename}`.

## Conventions

**Form error handling:** On validation failure, routes re-render the template passing back field values as `oldFieldName` variables (e.g. `oldEmail`, `oldFirstName`) and error text as `errorMessage`, `errorMessage1`, etc. Templates use `typeof x !== 'undefined' ? x : ''` guards.

**Admin error routing:** Instead of rendering error pages, admin-only routes redirect to `/users/login?not_admin=true`. Auth-required routes redirect to `/users/login?auth_required=true`. The login and books templates detect these query params and fire SweetAlert2 popups, then clean the URL with `history.replaceState`.

**Many-to-many edits:** When saving genres/moods for a book, the pattern is delete-all then re-insert. The incoming value may be a single string or an array, so always normalise: `Array.isArray(x) ? x : [x]`.

**Static assets:** `static/js/search.js` handles the debounced live search (300ms, minimum 2 chars, updates URL via `history.replaceState`) and genre/mood filtering. All three filters compose via a single `fetchAndRender()` function that calls `GET /books/api/books?q=&genre=&mood=` with the current state of each. `static/js/toggle.js` handles Add button state. `static/js/preview.js` handles image upload preview on the manage/edit forms.
