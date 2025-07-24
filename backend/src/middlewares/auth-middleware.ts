import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const secret = process.env.JWT_SECRET

async function authenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }
  
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        select: {
          id: true,
          email: true,
        },
      });
      if (!user) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
      (req as any).user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  export default authenticated