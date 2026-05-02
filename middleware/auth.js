import express from "express";
import { Router } from "express";
import sqlite3 from "sqlite3";
import loginRouter from "../routes/login.js";
import registerRouter from "../routes/register.js";
const db = new sqlite3.Database("databases/bookfest.db");

const router = Router();

export const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect("/users/login?auth_required=true");
  }
};

export const isAdmin = (req, res, next) => {
  // Check if user is logged in
  if (!req.session.user) return res.redirect("/users/login");

  db.get(
    "SELECT is_admin FROM users WHERE id = ?",
    [req.session.user.id],
    (err, row) => {
      if (err || !row || row.is_admin !== 1) {
        return res.redirect("/users/login?not_admin=true");
      }
      next();
    },
  );
};

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

router.use("/login", loginRouter);
router.use("/register", registerRouter);

export default router;
