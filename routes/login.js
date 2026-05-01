import express from "express";
import { Router } from "express";
import sqlite3 from "sqlite3";
const db = new sqlite3.Database("databases/bookfest.db");
import bcrypt from "bcrypt";
const router = Router();

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", (req, res) => {
  const { email, password } = req.body;
  async function loginUser() {
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [req.body.email],
      async (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error logging in");
        }
        if (!row) {
          return res.render("login", {
            errorMessage: "Invalid email or password.",
            oldEmail: email,
          });
        }
        const isMatch = await bcrypt.compare(req.body.password, row.hash);
        if (!isMatch) {
          return res.render("login", {
            errorMessage: "Invalid email or password.",
            oldEmail: email,
          });
        }
        // Login successful
        req.session.userID = row.id;
        return res.redirect("/");
      },
    );
  }
  loginUser();
});

export default router;
