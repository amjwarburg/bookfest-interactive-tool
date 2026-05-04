import express from "express";
import { Router } from "express";
import sqlite3 from "sqlite3";
const db = new sqlite3.Database("databases/bookfest.db");
import bcrypt from "bcrypt";
const router = Router();

// I looked back at the registration implementation from 'Finance' to help with this part of the project.
// Register user
router
  .route("/")
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
      const firstName = req.body.firstName,
        lastName = req.body.lastName,
        email = req.body.email;
      return res.status(400).render("register", {
        errorMessage1: "Password must be at least 8 characters long",
        oldFirstName: firstName,
        oldLastName: lastName,
        oldEmail: email,
      });
    }
    if (req.body.password !== req.body.confirmation) {
      const firstName = req.body.firstName,
        lastName = req.body.lastName,
        email = req.body.email;
      return res.status(400).render("register", {
        errorMessage2: "Passwords do not match!",
        oldFirstName: firstName,
        oldLastName: lastName,
        oldEmail: email,
      });
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
