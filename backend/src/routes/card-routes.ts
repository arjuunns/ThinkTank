import express from "express";
import { postCard,deleteCard,getCards,getAiGeneratedCard,updateCard } from "../controllers/card-controller";
import authenticated from "../middlewares/auth-middleware";
import { userOwnsCard } from "../middlewares/user-owns-card";

const Router = express.Router();
Router.use(authenticated)
Router.post("/addCard", postCard);
// Router.get('/:cardId',postCard)
Router.delete("/:cardId",userOwnsCard,deleteCard)
// post card

Router.get("/allCards",getCards)

// use ai to generate data from the link, you just paste the link gemini iteself return you the the json of card
Router.get("card/generate",getAiGeneratedCard)

Router.patch("/:cardId",userOwnsCard,updateCard)


// get cards // implement, filtetring, pagination, here only



export default Router;
