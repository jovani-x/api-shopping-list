import express from "express";
import cardController from "@/controllers/cardController.js";

const router = express.Router();

// get all cards
router.get("/", cardController.getAllCards);
// get card
router.get("/:id", cardController.getCard);
// create card
router.post("/new", cardController.createCard);
// update card
router.put("/:id", cardController.updateCard);
// delete
router.delete("/:id", cardController.deleteCard);

export default router;
