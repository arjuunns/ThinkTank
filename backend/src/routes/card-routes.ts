import express from "express";
import { postCard,deleteCard,getCards,updateCard } from "../controllers/card-controller";
import authenticated from "../middlewares/auth-middleware";
import fetchLinkMetadata from "../middlewares/fetch-meta-data";
import { getAiGeneratedCard } from "../controllers/card-controller";
import { userOwnsCard } from "../middlewares/user-owns-card-middleware";

const Router = express.Router();

Router.use(authenticated)
Router.get("/",authenticated,getCards).post("/", postCard);
Router.delete("/:cardId",userOwnsCard,deleteCard).patch("/:cardId",userOwnsCard,updateCard)
Router.get("/autogenerate", fetchLinkMetadata, getAiGeneratedCard);

export default Router;


