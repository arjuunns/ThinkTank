import { GoogleGenAI } from "@google/genai";
import { NextFunction, Request, Response } from "express";
import { ResponseType } from "../types/meta-data-response-type";

declare global {
  namespace Express {
    interface Request {
      metadata?: ResponseType;
    }
  }
}

export default async function fetchLinkMetadata(req: Request,res: Response,next: NextFunction): Promise<any> {
  const url = req.query.url as string;
  const api = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
  const response = await fetch(api);
  const data = await response.json();
  if (data.status === "success") {
    req.metadata = data
    next()
  } else {
    res.status(400).json({
      message : "Could not fetch link metadata!"
    });
  }
}