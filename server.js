import express from "express";
import sqlite3 from "sqlite3";
import session from "express-session";
import profileRouter from "./routes/profile.js";
import booksRouter from "./routes/books.js";
import authRouter from "./middleware/auth.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/static/images/book_covers"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.toLowerCase());
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Initialise app
const app = express();
app.get("/test", (req, res) => res.send("Server is alive!"));

// App settings
app.set("view engine", "ejs");

// Global middleware
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "bookfest_secret_key",
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

const db = new sqlite3.Database("databases/bookfest.db");

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
