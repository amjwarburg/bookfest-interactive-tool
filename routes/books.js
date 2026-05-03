import express from "express";
import { Router } from "express";
import sqlite3 from "sqlite3";
import { isAdmin } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
const db = new sqlite3.Database("databases/bookfest.db");
const router = Router();

router.get("/", (req, res) => {
  db.all("SELECT * FROM books", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving books");
    }
    res.render("books", { books: rows });
  });
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

router.get("/manage", isAdmin, (req, res) => {
  db.all("SELECT * FROM books", (err, books) => {
    if (err) return res.status(500).send("Database error (books");
    db.all("SELECT * FROM moods", (err, moods) => {
      if (err) return res.status(500).send("Database error (moods");
      db.all("SELECT * FROM genres", (err, genres) => {
        if (err) return res.status(500).send("Database error (genres)");
        res.render("manage", { books: books, moods: moods, genres: genres });
      });
    });
  });
});

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
        // FIXED: Added the missing db.run() call
        db.run("INSERT OR IGNORE INTO book_moods (book_id, mood_id) VALUES (?, ?)", [bookID, moodID]);
      });
    }
      res.redirect("/books/manage");
    },
  );
});

router.post("/edit/:id", isAdmin, upload.single("cover"), (req, res) => {
  res.render("/manage");
});

router.post("/delete/:id", isAdmin, (req, res) => {
  db.run("DELETE FROM books WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Delete failed");
    res.redirect("/books/manage");
  });
});

export default router;
