// I asked Gemini how to work with file uploads in Express, and it suggested using the Multer middleware. Here's how I set it up to handle book cover image uploads:

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../static/images/book_covers"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.toLowerCase());
  },
});

// Claude Code added this fileFilter at the user's request to prevent non-image uploads.
// Without it, an attacker could upload an .html file that Express serves with the correct
// MIME type, enabling stored XSS via the static file server.
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const validMime = allowed.test(file.mimetype);
  if (validExt && validMime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export default upload;
