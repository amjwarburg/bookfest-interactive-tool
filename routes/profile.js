import express from 'express';
import { Router } from 'express';
const router = Router();

router.get("/", (req, res) => {
    res.render('profile');
})

router.route('/:id').get((req, res) => {
  res.render('profile', { id: req.params.id });
}).put((req, res) => {
  res.send(`update user ${req.params.id}`);
}).delete((req, res) => {  res.send(`delete user ${req.params.id}`);
});

router.param('id', (req, res, next, id) => {
    console.log(id);
    next();
})

export default router;