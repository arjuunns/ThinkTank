import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const postCard = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const body = req.body;
  const link = body.link;
  const title = body.title;
  const type = body.type;
  const tagNames: string[] = body.tags;
  const userId = user.id;

  try {
    const existingTags = await prisma.tag.findMany({
      where: {
        title: {
          in: tagNames,
        },
      },
    });

    const existingTagIds = existingTags.map((tag) => tag.id);
    const existingTagNames = existingTags.map((tag) => tag.title);

    const newTagNames = tagNames.filter(
      (tagName) => !existingTagNames.includes(tagName)
    );

    let createdTagIds: number[] = [];

    if (newTagNames.length > 0) {
      const createdTags = await prisma.$transaction(
        newTagNames.map((tagName) =>
          prisma.tag.create({
            data: {
              title: tagName,
            },
          })
        )
      );
      createdTagIds = createdTags.map((tag) => tag.id);
    }
    const allTagIds = [...existingTagIds, ...createdTagIds];

    const card = await prisma.content.create({
      data: {
        link,
        title,
        type,
        user: {
          connect: {
            id: userId,
          },
        },
        tags: {
          connect: allTagIds.map((id) => ({ id })),
        },
      },
      include: { tags: true },
    });

    res.status(201).json({
      message: "Card created successfully",
      card,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create card",
      error: (err as Error).message,
    });
  }
};

const deleteCard = async (req: Request, res: Response): Promise<any> => {
  const cardId: number = Number(req.params.cardId);
  const user = (req as any).user;
  const userId = user.id;

  try {
    await prisma.content.delete({
      where: { id: cardId },
    });
    res.json({ message: `Your card with id ${cardId} is succesfully deleted` });
  } catch (err) {
    res.status(400).json({
      message: "Failed to delete the card",
      error: (err as Error).message,
    });
  }
};

const getCards = async (req: Request, res: Response): Promise<any> => {
  try {
    const search = req.query.search as string | undefined;
    const type = req.query.type as string | undefined;
    const sort = (req.query.sort as string) || "createdAt";
    const order = ((req.query.order as string) || "desc") as "asc" | "desc";
    const page = parseInt((req.query.page as string) || "1", 10);
    const perPage = parseInt((req.query.perPage as string) || "10", 10);

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { link: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) where.type = type;

    const skip = (page - 1) * perPage;
    const take = perPage;
    where.userId = (req as any).user.id
    const [cards, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take,
        include: {
          tags: true,
          user: {
            select: { id: true },
          },
        },
      }),
      prisma.content.count({ where }),
    ]);

    const cardsWithFormattedDate = cards.map((card) => ({
      ...card,
      createdAt: card.createdAt.toLocaleString("en-IN"),
    }));

    res.json({
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      cards: cardsWithFormattedDate,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch cards",
      error: (err as Error).message,
    });
  }
};

const getAiGeneratedCard = async (
  req: Request,
  res: Response
): Promise<any> => {};

const updateCard = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const userId = user.id;
  const cardId = Number(req.params.cardId);
  const body = req.body;
  const link = body.link;
  const title = body.title;
  const type = body.type;
  const tagNames: string[] = body.tags;

  try {
    // 1. Find existing tags
    const existingTags = await prisma.tag.findMany({
      where: { title: { in: tagNames } },
    });
    const existingTagNames = existingTags.map((tag) => tag.title);

    // 2. Find new tags
    const newTagNames = tagNames.filter(
      (tagName) => !existingTagNames.includes(tagName)
    );

    // 3. Create new tags in bulk
    if (newTagNames.length > 0) {
      await prisma.tag.createMany({
        data: newTagNames.map((title) => ({ title })),
        skipDuplicates: true,
      });
    }

    // 4. Fetch all tag IDs again (now all should exist)
    const allTags = await prisma.tag.findMany({
      where: { title: { in: tagNames } },
    });
    const allTagIds = allTags.map((tag) => tag.id);

    // 5. Build update data object (only include fields that are present)
    const updateData: any = {};
    if (link !== undefined) updateData.link = link;
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    updateData.user = { connect: { id: userId } };
    updateData.tags = { set: allTagIds.map((id) => ({ id })) };

    // 6. Update the card
    const card = await prisma.content.update({
      where: { id: cardId },
      data: updateData,
    });

    res.status(200).json({
      message: "Card updated successfully",
      card,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update card",
      error: (err as Error).message,
    });
  }
};

export { deleteCard, postCard, getCards, getAiGeneratedCard, updateCard };
