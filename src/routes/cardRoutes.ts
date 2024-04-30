import cardController from "../controllers/cardController.js";
import express from "express";

const router = express.Router();
const apiCardUrl = "";

// get all cards
router.get(`${apiCardUrl}/`, cardController.getAllCards);
// get card
router.get(`${apiCardUrl}/:id`, cardController.getCard);
// create card
router.post(`${apiCardUrl}/new`, cardController.createCard);
// update card
router.put(`${apiCardUrl}/:id`, cardController.updateCard);
// delete
router.delete(`${apiCardUrl}/:id`, cardController.deleteCard);

export default router;
