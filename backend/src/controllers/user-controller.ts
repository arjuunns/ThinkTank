import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import hashPassword from "../utils/hash-password";
import generateToken from "../utils/generate-token";
import bcrypt from 'bcrypt'
const prisma  = new PrismaClient()

const userSignup = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    try {
      if (email && password) {
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
        });
        if (user) {
          return res.status(403).json({
            message: "User already exists",
          });
        } else {
          const hashedPassword = await hashPassword(password);
          const user = await prisma.user.create({
            data: {
              email: email,
              password: hashedPassword,
            },
          });
          res.status(200).json({
            message: "User signed up successfully",
            data: {
              email: email,
            },
          });
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({
          message: err.message,
        });
      }
      return res.status(500).json({ message: "Unknown error" });
    }
  }

const userSignIn = async(req: Request, res: Response) : Promise<any> => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(411).json({
        message: "please specify both email or password",
      });
    }
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(201).json({
        message: "user does not exist , please signup",
      });
    } else {
      const checkUser = await bcrypt.compare(password, user.password);
      if (checkUser) {
        const token = await generateToken(user.email);
        return res.status(200).json({
          message: "Signed in succesfully",
          token: token,
        });
      } else {
        res.status(411).json({
          message: "Incorrect password, try again",
        });
      }
    }
  }

export {userSignIn,userSignup}