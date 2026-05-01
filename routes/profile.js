import express from "express";
import { Router } from "express";
import sqlite3 from "sqlite3";
import { ensureAuthenticated } from "../middleware/auth.js";
const db = new sqlite3.Database("databases/bookfest.db");
const router = Router();

router.get("/", (req, res) => {
  res.redirect("/profile/" + req.session.userID);
});

router.route("/:id").get(ensureAuthenticated, (req, res) => {
  db.get(
    "SELECT id, firstName, lastName, email FROM users WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error retrieving user profile");
      }
      res.render("profile", {
        user: row,
      });
    },
  );
});

export default router;
