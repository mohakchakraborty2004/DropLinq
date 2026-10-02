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
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../../db/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const rateLimiter_1 = require("../../utils/rateLimiter");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
exports.userRouter = express_1.default.Router();
//rate-limit
exports.userRouter.use(rateLimiter_1.UserLimiter);
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const response = yield db_1.default.user.findUnique({
            where: {
                email
            }
        });
        if (response) {
            const id = response.id;
            const dbPw = response.password;
            if (password === dbPw) {
                const token = jsonwebtoken_1.default.sign({ id }, JWT_SECRET);
                res.status(200).json({
                    msg: "loggedin",
                    token: token
                });
            }
        }
        else {
            const response = yield db_1.default.user.create({
                data: {
                    username,
                    email,
                    password
                }
            });
            const id = response.id;
            const token = jsonwebtoken_1.default.sign({ id }, JWT_SECRET);
            res.status(200).json({
                msg: "account created",
                token: token
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "some error occured"
        });
    }
}));
