import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import  jwt from "jsonwebtoken";

dotenv.config()


declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

export const AuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try { 
         const authHeader = req.headers.authorization;
         if(!authHeader || !authHeader.startsWith("Bearer ")) {
             throw new Error("Please login")
        }
        const token = authHeader.split(" ")[1]
        if(!token) {
             res.status(401).json({
                message: "Please signin ,Unauthorized"
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!)
            
            if (typeof decoded === "object" && "id" in decoded) {
                req.id = (decoded as jwt.JwtPayload).id as string;
                next();
            } else {
                res.status(401).json({
                    message: "Invalid token format"
                });
            }

        } catch (error: any) {
           console.log(error)
         if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ msg: "Token expired" });
         }
               res.status(401).json({ msg: "Invalid token" });
      }
    } catch (error) {
        console.log(error);
        res.json({
            msg : "error occured"
        })
    }
} 