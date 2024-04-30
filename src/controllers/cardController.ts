import { ICard } from "../data/types.js";
import { getTranslation } from "../lib/utils.js";

const allCards = new Map<string, ICard>();

export const hasCardType = (card: any): card is ICard => {
  return (
    typeof card === "object" &&
    card.id &&
    typeof card.id === "string" &&
    card.name &&
    typeof card.name === "string"
  );
};

const cardController = {
  getAllCards: (req, res) => {
    const resObj = { cards: Array.from(allCards.values()) };

    res.status(200).json(resObj);
  },
  getCard: (req, res) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }
    const cardId = typeof id !== "string" ? id.toString() : id;
    const card = allCards.get(cardId);
    if (!card) {
      return res.status(404).json({
        message: getTranslation("cardWithIdDoesnotExist", { id: cardId }),
      });
    }

    return res.status(200).json({ card: card });
  },
  createCard: (req, res) => {
    const newCard = req.body.card;
    if (newCard && hasCardType(newCard) && !allCards.get(newCard.id)) {
      allCards.set(newCard.id, newCard);
      return res.status(201).json({ card: newCard });
    } else {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }
  },
  updateCard: (req, res) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }
    const cardId = typeof id !== "string" ? id.toString() : id;
    const card = allCards.get(cardId);
    if (!card) {
      return res.status(404).json({
        message: getTranslation("cardWithIdDoesnotExist", { id: cardId }),
      });
    }

    const newCardAttrs = req.body.card;
    const updatedCard = { ...newCardAttrs, id: cardId };
    allCards.set(cardId, updatedCard);
    res.status(200).json({ card: updatedCard });
  },
  deleteCard: (req, res) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: getTranslation("wrongData") });
    }
    const cardId = typeof id !== "string" ? id.toString() : id;
    const card = allCards.get(cardId);
    if (!card) {
      return res.status(404).json({
        message: getTranslation("cardWithIdDoesnotExist", { id: cardId }),
      });
    }

    allCards.delete(cardId);
    res.status(200).json({ card });
  },
  init: (cards: ICard[]) => {
    allCards.clear();
    cards.map((card) => allCards.set(card.id, card));
  },
};

export default cardController;
