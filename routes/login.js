import { Router } from "express";
import sqlite3 from "sqlite3";
const db = new sqlite3.Database("databases/bookfest.db");
import bcrypt from "bcrypt";
// Claude Code added this import for CSRF validation
import { validateCsrfToken } from "../middleware/csrf.js";
const router = Router();

router.get("/", (req, res) => {
  res.render("login");
});

// I partly based this login POST route on the one from the CS50 'Finance' app.
// Claude Code added validateCsrfToken middleware and session regeneration.
router.post("/", validateCsrfToken, (req, res) => {
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
        // Claude Code added session regeneration to prevent session fixation attacks.
        // A session fixation attack lets an attacker pre-set a victim's session ID before
        // login; regenerating here ensures the pre-login ID is invalidated on authentication.
        req.session.regenerate((err) => {
          if (err) return res.status(500).send("Error logging in");
          req.session.user = {
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            is_admin: row.is_admin,
          };
          return res.redirect("/");
        });
      },
    );
  }
  loginUser();
});

export default router;
