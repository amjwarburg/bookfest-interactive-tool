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
  try {
    const { title, author, publication_year, reading_age, genres, moods } =
      req.body;
    const coverPath = req.file
      ? `../static/images/book_covers${req.file.originalname}`
      : "../static/images/book_covers/default.png";
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/delete/:id", isAdmin, (req, res) => {
  db.run("DELETE FROM books WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Delete failed");
    res.redirect("/books/manage");
  });
});

export default router;
