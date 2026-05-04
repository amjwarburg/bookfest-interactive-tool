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

// Gemini suggested I change this to use async/await, so that will be on my TODO.
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

router.get("/edit/:id", isAdmin, (req, res) => {
  db.get("SELECT * FROM books WHERE id = ?", [req.params.id], (err, book) => {
    if (err) return res.status(500).send("Edit failed");
    db.all(
      "SELECT genre_id FROM book_genres WHERE book_id = ?",
      [req.params.id],
      (err, bookGenres) => {
        if (err)
          return res.status(500).send("Edit failed, couldn't get genres");
        db.all(
          "SELECT mood_id FROM book_moods WHERE book_id = ?",
          [req.params.id],
          (err, bookMoods) => {
            if (err)
              return res.status(500).send("Edit failed, couldn't get moods");
            db.all("SELECT * FROM moods", (err, allMoods) => {
              if (err) return res.status(500).send("Database error (moods");
              db.all("SELECT * FROM genres", (err, allGenres) => {
                if (err) return res.status(500).send("Database error (genres)");
                res.render("edit", {
                  book: book,
                  // CurrentMoods and CurrentGenres mapping suggested by Gemini
                  currentMoods: bookMoods.map((m) => m.mood_id),
                  currentGenres: bookGenres.map((g) => g.genre_id),
                  allGenres: allGenres,
                  allMoods: allMoods,
                });
              });
            });
          },
        );
      },
    );
  });
});

router.post("/edit/:id", isAdmin, upload.single("cover"), (req, res) => {
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

  db.run(sql, params, (err) => {
    if (err) return res.status(500).send("Error updating book");

    // prettier-ignore
    db.run("DELETE FROM book_genres WHERE book_id = ?", [req.params.id], () => {
      if (genres) {
        const genreList = Array.isArray(genres) ? genres : [genres];
        genreList.forEach((genreId) => {
          db.run("INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)", [req.params.id, genreId]);
        });
      }
    });

    // prettier-ignore
    db.run("DELETE FROM book_moods WHERE book_id = ?", [req.params.id], () => {
      if (moods) {
        const moodList = Array.isArray(moods) ? moods : [moods];
        moodList.forEach((moodId) => {
          db.run("INSERT INTO book_moods (book_id, mood_id) VALUES (?, ?)", [req.params.id, moodId]);
        });
      }
    });
    res.redirect("/books/manage");
  });
});

router.post("/delete/:id", isAdmin, (req, res) => {
  db.run("DELETE FROM books WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Delete failed");
    res.redirect("/books/manage");
  });
});

export default router;
