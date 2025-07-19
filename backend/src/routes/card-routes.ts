import express from "express";
import { postCard,deleteCard,getCards,getAiGeneratedCard,updateCard } from "../controllers/card-controller";
import authenticated from "../middlewares/auth-middleware";
import { userOwnsCard } from "../middlewares/user-owns-card-middleware";

const Router = express.Router();
Router.use(authenticated)
Router.post("/addCard", postCard);
Router.delete("/:cardId",userOwnsCard,deleteCard).patch("/:cardId",userOwnsCard,updateCard)
Router.get("/",authenticated,getCards)

// use ai to generate data from the link, you just paste the link gemini iteself return you the the json of card
Router.patch("/:cardId/generate",getAiGeneratedCard)

export default Router;
