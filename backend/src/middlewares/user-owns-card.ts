import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const userOwnsCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  const userId = user.id;
  const cardId = Number(req.params.cardId);

  try {
    const card = await prisma.content.findUnique({
      where: { id: cardId },
      select: { id: true, userId: true },
    });

    if (!card || card.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this card." });
    }
    next();
  } catch (err) {
    res.status(500).json({
      message: "User not authenticated",
      error: (err as Error).message,
    });
  }
};
