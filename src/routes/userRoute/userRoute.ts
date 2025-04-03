import express , {Request, Response} from "express";

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
                //jwt auth 
                const token = ""
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

            const token = ""
            localStorage.setItem("token", token)

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

// userRouter.post("/login", (req : any, res: any)=> {
    
// })