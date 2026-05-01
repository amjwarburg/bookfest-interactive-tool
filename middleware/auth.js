import express from "express";
import { Router } from "express";
import loginRouter from "../routes/login.js";
import registerRouter from "../routes/register.js";

const router = Router();

export const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.userID) {
    return next();
  } else {
    res.redirect("/users/login?auth_required=true");
  }
};

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.use("/login", loginRouter);
router.use("/register", registerRouter);

export default router;
