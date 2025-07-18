import { Request, Response } from "express";
import { PrismaClient, contentTypes } from "@prisma/client";
const prisma = new PrismaClient();

export const updateCard = async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const userId = user.id;
  const cardId = Number(req.params.cardId);

  if (!req.params.cardId || isNaN(cardId)) {
    return res.status(400).json({ message: "Invalid card ID in URL." });
  }

  try {
    // Ownership check (unless already in middleware)
    const cardToUpdate = await prisma.content.findUnique({
      where: { id: cardId },
      select: { userId: true },
    });
    if (!cardToUpdate || cardToUpdate.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this card." });
    }

    // Build partial update object
    const data: any = {};
    // Only update if provided
    if ('link' in req.body)   data.link   = req.body.link;
    if ('title' in req.body)  data.title  = req.body.title;
    if ('type' in req.body) {
      // Validate enum if present
      if (!Object.values(contentTypes).includes(req.body.type)) {
        return res.status(400).json({ message: "Invalid content type" });
      }
      data.type = req.body.type;
    }

    // Handle tags only if present
    if ('tags' in req.body) {
      if (!Array.isArray(req.body.tags)) {
        return res.status(400).json({ message: "Tags must be an array of strings." });
      }
      const tagNames: string[] = req.body.tags;
      // Find existing & identify new tags
      const existingTags = await prisma.tag.findMany({
        where: { title: { in: tagNames } }
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
            prisma.tag.create({ data: { title: tagName } })
          )
        );
        createdTagIds = createdTags.map((tag) => tag.id);
      }
      const allTagIds = [...existingTagIds, ...createdTagIds];
      // If client sends empty array, tags will be cleared
      data.tags = { set: allTagIds.map(id => ({ id })) };
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    const card = await prisma.content.update({
      where: { id: cardId },
      data,
      include: { tags: true }
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
