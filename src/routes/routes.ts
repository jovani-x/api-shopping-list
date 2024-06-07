import express from "express";
import type { Request, Response } from "express";
const router = express.Router();

router.get(`/`, (_req: Request, res: Response) => {
  res.send("API works!");
});

export default router;
