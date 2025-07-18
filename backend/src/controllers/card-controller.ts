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
      include : {tags : true}
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
  // filtering , sorting , pagination
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
  const data : any = {} // build the partial data object
  if('link' in body) data.link = body.link;
  if('title' in body) data.title = body.title;
  if('type' in body) data.type = body.type;
  if('tags' in body) data.tags = body.tags;
  const tagNames : string[] = body.tags || [];

  try {
    const existingTags = await prisma.tag.findMany({
      where: {
        title: {
          in: tagNames,
        },
      },
    });
    // if(tagNames.length > 0){
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

    if ('tags' in body) data.tags = { set: allTagIds.map(id => ({ id })) };
    
    const card = await prisma.content.update({
      where: { id: cardId },
      data,
      include : {tags : true}
    });

    res.status(201).json({
      message: "Card updated successfully",
      card,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create card",
      error: (err as Error).message,
    });
  }
};

export { deleteCard, postCard, getCards, getAiGeneratedCard, updateCard };
