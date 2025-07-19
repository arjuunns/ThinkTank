import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import authenticated from "../middlewares/auth-middleware";
import { ToggleLinkVisibility, showSharedBrain} from "../controllers/share-controller";
const Router = express.Router();

const prisma = new PrismaClient();

Router.patch("/toggle", authenticated,ToggleLinkVisibility);

Router.get("/:shareLink",showSharedBrain)

export default Router;
