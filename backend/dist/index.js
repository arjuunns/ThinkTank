"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const saltRounds = 4;
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// add validations
// auth routes : 
// signup
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        return hashedPassword;
    });
}
function generateToken(email, secret) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield jsonwebtoken_1.default.sign({ email }, secret, {
            algorithm: "HS256",
            expiresIn: "10000"
        });
        return token;
    });
}
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const email = body.email;
    const password = body.password;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        if (email && password) {
            const user = yield prisma.user.findFirst({ where: {
                    email: email
                } });
            if (user) {
                return res.status(403).json({
                    message: "User already exists"
                });
            }
            else {
                const hashedPassword = yield hashPassword(password);
                const user = yield prisma.user.create({
                    data: {
                        email: email,
                        password: hashedPassword
                    }
                });
                res.status(200).json({
                    message: "User signed up successfully",
                    data: {
                        email: email,
                    }
                });
            }
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({
                message: err.message
            });
        }
        return res.status(500).json({ message: "Unknown error" });
    }
}));
// signin
app.get("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return res.status(411).json({
            message: "please specify both email or password"
        });
    }
    const user = yield prisma.user.findFirst({
        where: {
            email: email,
        }
    });
    if (!user) {
        return res.status(201).json({
            message: "user does not exist , please signup"
        });
    }
    else {
        const checkUser = yield bcrypt_1.default.compare(password, user.password);
        if (checkUser) {
            const token = yield generateToken(user.email, user.email);
            return res.status(200).json({
                message: "Signed in succesfully",
                token: token
            });
        }
        else {
            res.status(411).json({
                message: "Incorrect password, try again"
            });
        }
    }
}));
// authenticated middleware
// post card 
// use ai to generate data from the link, you just paste the link gemini iteself return you the the json of card
// get cards // implement, filtetring, pagination, here only
// edit card
// delete card
// shareable brain link
// ai chat
// filtering
// pagination
app.listen(3000, () => {
    console.log("Server Started listening on port 3000 🌏");
});
