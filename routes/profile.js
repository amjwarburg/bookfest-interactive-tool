import express from "express";
import { Router } from "express";
import sqlite3 from "sqlite3";
import { ensureAuthenticated } from "../middleware/auth.js";
const db = new sqlite3.Database("databases/bookfest.db");
const router = Router();

router.get("/", (req, res) => {
  if (req.session.user && req.session.user.id) {
    res.redirect("/profile/" + req.session.user.id);
  } else {
    res.redirect("/users/login");
  }
});

router.route("/:id").get(ensureAuthenticated, (req, res) => {
  db.get(
    "SELECT id, firstName, lastName, email, is_admin FROM users WHERE id = ?",
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
