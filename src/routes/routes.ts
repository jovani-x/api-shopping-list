import express from "express";
const router = express.Router();

router.get(`/`, (_req, res) => {
  res.send("API works!");
});

export default router;