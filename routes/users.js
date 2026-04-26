import express from "express";
import { Router } from "express";
import sqlite3 from "sqlite3";
const db = new sqlite3.Database("databases/bookfest.db");
import bcrypt from "bcrypt";
const router = Router();

router.get("/", (req, res) => {
  res.render("users");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
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
          return res.status(400).send("Invalid email or password");
        }
        const isMatch = await bcrypt.compare(req.body.password, row.hash);
        if (!isMatch) {
          return res.status(400).send("Invalid email or password");
        }
        // Login successful
        req.session.userID = row.id;
        return res.redirect("/");
      },
    );
  }
  loginUser();
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Register user
router
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    if (!req.body.firstName) {
      return res.status(400).send("First name is required");
    }
    if (!req.body.lastName) {
      return res.status(400).send("Last name is required");
    }
    if (!req.body.email) {
      return res.status(400).send("Email is required");
    }
    if (!req.body.password) {
      return res.status(400).send("Password is required");
    }
    if (!req.body.confirmation) {
      return res.status(400).send("Password confirmation is required");
    }
    if (req.body.password.length < 8) {
      return res
        .status(400)
        .send("Password must be at least 8 characters long");
    }
    if (req.body.password !== req.body.confirmation) {
      return res.status(400).send("Passwords do not match");
    }
    async function registerUser() {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      db.run(
        "INSERT INTO users (firstName, lastName, email, hash) VALUES (?, ?, ?, ?)",
        [req.body.firstName, req.body.lastName, req.body.email, hashedPassword],
        function (err) {
          if (err) {
            console.error(err);
            return res.status(500).send("Error registering user");
          }
          return res.redirect("/users/login");
        },
      );
    }
    registerUser();
  });

export default router;
