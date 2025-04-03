import express , {Request, Response} from "express";
import prisma from "../../db/db";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

export const userRouter = express.Router();

userRouter.post("/signup",async (req : Request , res: Response)=> {
    const {username , email, password} = req.body;

    try {
        const response = await prisma.user.findUnique({
            where : {
               email
            }
        })

        if (response) {
            const id = response.id 
            const dbPw = response.password
            if (password === dbPw) {
                const token = jwt.sign({ id }, JWT_SECRET)
                localStorage.setItem("token", token);
                res.status(200).json({
                    msg : "loggedin"
                })
            }
        } else {
            const response = await prisma.user.create({
                data : {
                    username, 
                    email, 
                    password
                }
            })

            const id = response.id;

            const token = jwt.sign({ id }, JWT_SECRET)
            localStorage.setItem("token", token);

            res.status(200).json({
                msg :  "account created"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg : "some error occured"
        })
    }
})
