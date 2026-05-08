import crypto from "node:crypto";

// Claude Code implemented CSRF protection at the user's request using the
// synchronizer token pattern. A random token is stored in the session and must
// be present on every POST — submitted either as a hidden _csrf form field or
// as an X-CSRF-Token header (used by AJAX requests in toggle.js).

export const generateCsrfToken = (req, res, next) => {
  // Generate once per session; expose via res.locals so every EJS template can read it
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Used as route-level middleware, not global, so it can be placed AFTER multer on
// multipart routes — multer must run first to populate req.body with the _csrf field.
export const validateCsrfToken = (req, res, next) => {
  // req.body may be undefined when no Content-Type is set (e.g. the AJAX fetch in toggle.js
  // sends no body), so use optional chaining before falling back to the header
  const token = req.body?._csrf || req.headers["x-csrf-token"];
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).send("Forbidden: invalid or missing CSRF token");
  }
  next();
};
