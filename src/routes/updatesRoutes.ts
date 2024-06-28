import express from "express";
import updatesController from "@/controllers/updatesController.js";

const router = express.Router();

// updates
router.get("/", updatesController.updates);

export default router;
