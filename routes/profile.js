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

// Claude implemented this ensureAthenticated check for me
router.route("/:id").get(ensureAuthenticated, (req, res) => {
  if (
    parseInt(req.params.id) !== req.session.user.id &&
    !req.session.user.is_admin
  ) {
    return res.status(403).send("Forbidden");
  }

  // I implemented this profile sqlite sequence
  db.get(
    "SELECT id, firstName, lastName, email, is_admin FROM users WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error retrieving user profile");
      }
      if (!row) return res.status(404).send("User not found");
      res.render("profile", {
        user: row,
      });
    },
  );
});

export default router;
