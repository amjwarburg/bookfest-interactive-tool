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

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
