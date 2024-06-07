import { ICard, UserRole } from "@/data/types.js";
import { Card } from "@/models/Card.js";
import { User } from "@/models/User.js";

export const getAllCards = async (cardIds: string[]) =>
  await Card.find({ _id: { $in: cardIds } });

export const getCardById = async (id: string) =>
  (await Card.findById(id))?.toObject();

export const createCard = async (newCard: ICard, userId?: string) => {
  const resCard = (await Card.create(newCard)).toObject();
  if (userId) {
    await addCardToUser({ userId, cardId: resCard.id });
  }

  return resCard;
};

export const updateCard = async (id: string, newCard: ICard) =>
  (await Card.findByIdAndUpdate(id, newCard, { new: true }))?.toObject();

export const deleteCard = async (id: string) =>
  (await Card.findByIdAndDelete(id))?.toObject();

export const addCardToUser = async ({
  userId,
  cardId,
  role = UserRole.owner,
}: {
  userId: string;
  cardId: string;
  role?: UserRole;
}) =>
  await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        cards: {
          cardId: cardId,
          role: role,
        },
      },
    },
    {
      new: true,
    }
  ).select(["userName"]);
