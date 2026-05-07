import { Router } from "express";
import sqlite3 from "sqlite3";
import { isAdmin } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { promisify } from "node:util";
import { stat } from "node:fs";
const db = new sqlite3.Database("databases/bookfest.db");
const router = Router();
const collectData = promisify(db.all.bind(db));
const runQuery = promisify(db.run.bind(db));
const getOne = promisify(db.get.bind(db));

router.get("/", (req, res) => {
  db.all("SELECT * FROM books", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving books");
    }
    res.render("books", { books: rows });
  });
});

// TO DO - implement user 'has read'functionality
router.post("/:id", (req, res) => {
  db.run(
    "INSERT INTO user_books (user_id, book_id) VALUES (?, ?)",
    [req.session.user.id, req.params.id],
    (err) => {
      if (err) console.error(err);
      res.redirect("/books");
    },
  );
});

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

// Gemini suggested I change this to use async/await, so I had to learn about promisify
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
router.post("/manage", isAdmin, upload.single("cover"), (req, res) => {
  const { title, author, publication_year, reading_age, genres, moods } =
    req.body;
  const coverPath = req.file
    ? `/images/book_covers/${req.file.originalname}`
    : "/images/book_covers/default.png";

  const bookSql = `INSERT INTO books (title, author, publication_year, reading_age, cover_image) VALUES (?, ?, ?, ?, ?)`;

  db.run(
    bookSql,
    [title, author, publication_year, reading_age, coverPath],
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
});

router.get("/edit/:id", isAdmin, async (req, res) => {
  try {
    const book = await getOne("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!book) return res.status(404).send("Book not found");

    const [bookGenres, bookMoods, allMoods, allGenres] = await Promise.all([
      collectData("SELECT genre_id FROM book_genres WHERE book_id = ?", [req.params.id]),
      collectData("SELECT mood_id FROM book_moods WHERE book_id = ?", [req.params.id]),
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

router.post("/edit/:id", isAdmin, upload.single("cover"), async (req, res) => {
  const { title, author, publication_year, reading_age, genres, moods } =
    req.body;

  let sql =
    "UPDATE books SET title = ?, author = ?, publication_year = ?, reading_age = ? WHERE id = ?";
  let params = [title, author, publication_year, reading_age, req.params.id];

  if (req.file) {
    sql =
      "UPDATE books SET title = ?, author = ?, publication_year = ?, reading_age = ?, cover_image = ? WHERE id = ?";
    params = [
      title,
      author,
      publication_year,
      reading_age,
      `/images/book_covers/${req.file.originalname}`,
      req.params.id,
    ];
  }

  try {
    await runQuery(sql, params);

    await runQuery("DELETE FROM book_genres WHERE book_id = ?", [req.params.id]);
    if (genres) {
      const genreList = Array.isArray(genres) ? genres : [genres];
      await Promise.all(
        genreList.map((genreId) =>
          runQuery("INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)", [req.params.id, genreId])
        )
      );
    }

    await runQuery("DELETE FROM book_moods WHERE book_id = ?", [req.params.id]);
    if (moods) {
      const moodList = Array.isArray(moods) ? moods : [moods];
      await Promise.all(
        moodList.map((moodId) =>
          runQuery("INSERT INTO book_moods (book_id, mood_id) VALUES (?, ?)", [req.params.id, moodId])
        )
      );
    }

    res.redirect("/books/manage");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating book");
  }
});

router.post("/delete/:id", isAdmin, (req, res) => {
  db.run("DELETE FROM books WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Delete failed");
    res.redirect("/books/manage");
  });
});

export default router;
