import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const ToggleLinkVisibility = async (req: Request, res: Response) => {
  const user = (req as any).user;
  let toggleVal: boolean = false;
  if (req.query.val === "1" || req.query.val === "true") toggleVal = true;
  console.log(toggleVal);
  try {
    const shareableLink = await prisma.link.update({
      where: {
        userId: user.id,
      },
      data: {
        share: toggleVal,
      },
    });
    res.json({
      message: "Link visibilty changed succesfully",
      shareableLink: `http://localhost:3000/api/share/${shareableLink.hash}`,
      share: toggleVal,
      user: shareableLink.userId,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to change link visibilty",
      error: (err as Error).message,
    });
  }
};

export const showSharedBrain = async (req: Request, res: Response) => {
  const hash: string = req.params.shareLink;
  try {
    const link = await prisma.link.findFirst({
      where: { hash },
    });
    if (link && link.share) {
      const sharedBrainContent = await prisma.link.findFirst({
        where: { hash },
        select: {
          user: {
            select: {
              content: {
                select: {
                  id: true,
                  title: true,
                  link: true,
                  type: true,
                  tags: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      res.status(200).json({
        message: "Shared brain fetched succesfully",
        data: sharedBrainContent,
      });
    } else {
      res.status(401).json({
        message: "You are not authorized to view this brain",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to share brain",
      error: (err as Error).message,
    });
  }
};

