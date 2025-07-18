import express from "express";
import authenticated from "../middlewares/auth-middleware";
import { userSignup, userSignIn } from "../controllers/user-controller";

const Router = express.Router();

Router.post("/signup", userSignup);
Router.get("/signin", userSignIn);
// Router.get("/protected", )

export default Router;
