import "dotenv/config";
import express from "express";
import sqlite3 from "sqlite3";
import session from "express-session";
import profileRouter from "./routes/profile.js";
import booksRouter from "./routes/books.js";
import authRouter from "./middleware/auth.js";
// Claude Code added this import for CSRF protection
import { generateCsrfToken } from "./middleware/csrf.js";

// Initialise app
const app = express();
app.get("/test", (req, res) => res.send("Server is alive!"));

// App settings
app.set("view engine", "ejs");

// Global middleware
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use(express.static("static"));

// Claude Code added this: generate a CSRF token for every session and expose it
// to EJS templates via res.locals so all forms can include it
app.use(generateCsrfToken);

const db = new sqlite3.Database("databases/bookfest.db");

// Add status column if it doesn't exist yet (safe to run on every startup)
db.run(
  "ALTER TABLE user_books ADD COLUMN status TEXT NOT NULL DEFAULT 'not read'",
  (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("Migration error:", err.message);
    }
  }
);

// Add description and about_author columns to books if they don't exist yet
db.run("ALTER TABLE books ADD COLUMN description TEXT NOT NULL DEFAULT ''", (err) => {
  if (err && !err.message.includes("duplicate column")) {
    console.error("Migration error:", err.message);
  }
});
db.run("ALTER TABLE books ADD COLUMN about_author TEXT NOT NULL DEFAULT ''", (err) => {
  if (err && !err.message.includes("duplicate column")) {
    console.error("Migration error:", err.message);
  }
});

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.use("/books", booksRouter);
app.use("/profile", profileRouter);
app.use("/users", authRouter);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://localhost:3000");
});
