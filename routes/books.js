import { Router } from "express";
import sqlite3 from "sqlite3";
import { isAdmin, ensureAuthenticated } from "../middleware/auth.js";
// Claude Code added this import for CSRF validation
import { validateCsrfToken } from "../middleware/csrf.js";
import upload from "../middleware/multer.js";
import { promisify } from "node:util";
import { stat } from "node:fs";
const db = new sqlite3.Database("databases/bookfest.db");
const router = Router();
const collectData = promisify(db.all.bind(db));
const runQuery = promisify(db.run.bind(db));
const getOne = promisify(db.get.bind(db));

router.get("/", async (req, res) => {
  try {
    const books = await collectData("SELECT * FROM books");
    // Claude added this: fetch the IDs of books this user has already added so the template can
    // render each "Add!" button in the correct initial state without a second fetch
    // userBookStatuses maps book_id → status ('read' | 'not read') for the current user
    let userBookStatuses = {};
    if (req.session.user) {
      const userBooks = await collectData(
        "SELECT book_id, status FROM user_books WHERE user_id = ?",
        [req.session.user.id],
      );
      userBooks.forEach((r) => {
        userBookStatuses[r.book_id] = r.status;
      });
    }
    res.render("books", { books, userBookStatuses });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving books");
  }
});

// Claude Code updated this route to toggle status between 'read' and 'not read'.
// On first click the book is inserted with status 'not read'; subsequent clicks flip the status.
// Returns { success, status } so the client can update the button label without a page reload.
router.post(
  "/:id",
  ensureAuthenticated,
  validateCsrfToken,
  async (req, res) => {
    try {
      const existing = await getOne(
        "SELECT status FROM user_books WHERE user_id = ? AND book_id = ?",
        [req.session.user.id, req.params.id],
      );
      let newStatus;
      if (!existing) {
        // First add: insert row with default status
        newStatus = "not read";
        await runQuery(
          "INSERT INTO user_books (user_id, book_id, status) VALUES (?, ?, ?)",
          [req.session.user.id, req.params.id, newStatus],
        );
      } else {
        // Book already added: toggle the status
        newStatus = existing.status === "read" ? "not read" : "read";
        await runQuery(
          "UPDATE user_books SET status = ? WHERE user_id = ? AND book_id = ?",
          [newStatus, req.session.user.id, req.params.id],
        );
      }
      res.json({ success: true, status: newStatus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  },
);

router.get("/api/all", (req, res) => {
  db.all("SELECT * FROM books", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving books");
    }
    res.json(rows);
  });
});

// prettier-ignore
router.get("/api/search", (req, res) => {
  db.all("SELECT * FROM books WHERE title LIKE ? OR author LIKE ?", [
    `%${req.query.q}%`,
    `%${req.query.q}%`,
  ],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error retrieving books");
      }
      res.json(rows);
    });
});

// Claude Code added this route to render the book detail page
router.get("/info/:id", async (req, res) => {
  try {
    const book = await getOne("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!book) return res.status(404).send("Book not found");
    res.render("info", { book });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving book");
  }
});

// Gemini suggested I change this to use async/await, so I had to learn about promisify to implement this
router.get("/manage", isAdmin, (req, res) => {
  async function getData() {
    try {
      const bookData = await collectData("SELECT * FROM books");
      const moodData = await collectData("SELECT * FROM moods");
      const genreData = await collectData("SELECT * FROM genres");
      res.render("manage", {
        books: bookData,
        moods: moodData,
        genres: genreData,
      });
    } catch (err) {
      return res.status(500).send("Database error when retrieving book data");
    }
  }
  getData();
});

// I had to study the documentation for Multer to work out how to handle file uploads, and I asked Gemini for some help with its implementation.
// Claude Code added validateCsrfToken here AFTER upload.single so multer has already
// populated req.body with the hidden _csrf field before the token is checked.
router.post(
  "/manage",
  isAdmin,
  upload.single("cover"),
  validateCsrfToken,
  (req, res) => {
    // Claude Code added description and about_author to the destructure and INSERT
    const { title, author, publication_year, reading_age, genres, moods, description, about_author } =
      req.body;
    const coverPath = req.file
      ? `/images/book_covers/${req.file.originalname}`
      : "/images/book_covers/default.png";

    const bookSql = `INSERT INTO books (title, author, publication_year, reading_age, cover_image, description, about_author) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(
      bookSql,
      [title, author, publication_year, reading_age, coverPath, description || "", about_author || ""],
      function (err) {
        if (err) return res.status(500).send("Error adding book");

        const bookID = this.lastID;

        // prettier-ignore
        if (genres) {
      const genreList = Array.isArray(genres) ? genres : [genres];
      genreList.forEach((genreID) => {
        db.run("INSERT OR IGNORE INTO book_genres (book_id, genre_id) VALUES (?, ?)", [bookID, genreID]);
      });
    }

        // prettier-ignore
        if (moods) {
      const moodList = Array.isArray(moods) ? moods : [moods];
      moodList.forEach((moodID) => {
        db.run("INSERT OR IGNORE INTO book_moods (book_id, mood_id) VALUES (?, ?)", [bookID, moodID]);
      });
    }
        res.redirect("/books/manage");
      },
    );
  },
);

router.get("/edit/:id", isAdmin, async (req, res) => {
  try {
    const book = await getOne("SELECT * FROM books WHERE id = ?", [
      req.params.id,
    ]);
    if (!book) return res.status(404).send("Book not found");

    const [bookGenres, bookMoods, allMoods, allGenres] = await Promise.all([
      collectData("SELECT genre_id FROM book_genres WHERE book_id = ?", [
        req.params.id,
      ]),
      collectData("SELECT mood_id FROM book_moods WHERE book_id = ?", [
        req.params.id,
      ]),
      collectData("SELECT * FROM moods"),
      collectData("SELECT * FROM genres"),
    ]);

    res.render("edit", {
      book,
      // CurrentMoods and CurrentGenres mapping suggested by Gemini
      currentMoods: bookMoods.map((m) => m.mood_id),
      currentGenres: bookGenres.map((g) => g.genre_id),
      allGenres,
      allMoods,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Edit failed");
  }
});

// Claude Code added validateCsrfToken after upload.single for the same reason as /manage above
router.post(
  "/edit/:id",
  isAdmin,
  upload.single("cover"),
  validateCsrfToken,
  async (req, res) => {
    // Claude Code added description and about_author to the destructure and UPDATE
    const { title, author, publication_year, reading_age, genres, moods, description, about_author } =
      req.body;

    let sql =
      "UPDATE books SET title = ?, author = ?, publication_year = ?, reading_age = ?, description = ?, about_author = ? WHERE id = ?";
    let params = [title, author, publication_year, reading_age, description || "", about_author || "", req.params.id];

    if (req.file) {
      sql =
        "UPDATE books SET title = ?, author = ?, publication_year = ?, reading_age = ?, cover_image = ?, description = ?, about_author = ? WHERE id = ?";
      params = [
        title,
        author,
        publication_year,
        reading_age,
        `/images/book_covers/${req.file.originalname}`,
        description || "",
        about_author || "",
        req.params.id,
      ];
    }

    try {
      await runQuery(sql, params);

      await runQuery("DELETE FROM book_genres WHERE book_id = ?", [
        req.params.id,
      ]);
      if (genres) {
        const genreList = Array.isArray(genres) ? genres : [genres];
        await Promise.all(
          genreList.map((genreId) =>
            runQuery(
              "INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)",
              [req.params.id, genreId],
            ),
          ),
        );
      }

      await runQuery("DELETE FROM book_moods WHERE book_id = ?", [
        req.params.id,
      ]);
      if (moods) {
        const moodList = Array.isArray(moods) ? moods : [moods];
        await Promise.all(
          moodList.map((moodId) =>
            runQuery(
              "INSERT INTO book_moods (book_id, mood_id) VALUES (?, ?)",
              [req.params.id, moodId],
            ),
          ),
        );
      }

      res.redirect("/books/manage");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating book");
    }
  },
);

// Claude Code added validateCsrfToken to the delete route
router.post("/delete/:id", isAdmin, validateCsrfToken, (req, res) => {
  db.run("DELETE FROM books WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Delete failed");
    res.redirect("/books/manage");
  });
});

export default router;
