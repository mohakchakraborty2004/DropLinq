import express, {Request , Response} from "express";
import AWS from "aws-sdk";
import multer from "multer"; 
import dotenv from "dotenv";
import prisma from "../../db/db";
import { FileLimiter } from "../../utils/rateLimiter";
import { AuthMiddleware } from "../../middleware/AuthMiddleware";

dotenv.config();

const bucket_name = process.env.AWS_S3_BUCKET_NAME as string
const accessKey = process.env.AWS_ACCESS_KEY_ID as string
const s3 = new AWS.S3({
    accessKeyId : accessKey ,
    secretAccessKey :process.env.AWS_SECRET_ACCESS_KEY ,
    region : process.env.AWS_REGION
})

const upload = multer({storage : multer.memoryStorage()})

export const fileRouter = express.Router();

//rate-limit
 fileRouter.use(FileLimiter);

fileRouter.post("/upload", AuthMiddleware,  upload.single('file'), async (req : Request,res: Response ) => {
 if(!req.file) res.status(400).json({ msg : "no file found"});

 const {originalname ,mimetype ,buffer } = req.file as Express.Multer.File
 const { size } = req.file as Express.Multer.File
  const s3Key = `uploads/${Date.now()}_${originalname}` ;

  if(size > 5000000) {
    res.json({
      msg : "file size exceeded, sorry!"
    })
  }

 const params = {
    Bucket : bucket_name,
    Key : s3Key ,
    Body : buffer,
    ContentType : mimetype
 }

 try {
    const response = await s3.upload(params).promise(); 
    

    const dbRes = await prisma.file.create({
      data : {
        fileName : originalname,
        fileType : mimetype,
        s3Key : s3Key,
        size : size
      }
    })    

    const DownloadLink = `${req.protocol}://${process.env.HOST || `localhost:8000` }/download/${dbRes.id}`

    if (response) {
      res.status(200).json({
        msg : "uploaded", 
        DownloadLink
      })
  
      console.log("uploaded")
    }

  
 } catch (error) {
   console.error("S3 upload error:", error);
   res.status(500).json({ msg: "Upload failed" });
 }

})



fileRouter.get("/download/:fileId", async (req: Request, res: Response) => {
  const { fileId } = req.params

  if(!fileId) {
    res.status(404).json({
      msg : "file not found"
    })
  }

  try {
    const file = await prisma.file.findUnique({
      where : {
        id : fileId
      }
    })

    if(!file) {
      res.status(404).json({
        msg : "file not found in db"
      })
    }

    const s3key = file?.s3Key as string
    const filename = file?.fileType as string

    const params = {
      Bucket : bucket_name,
      Key : s3key
    }

    const s3Stream = s3.getObject(params).createReadStream()

    res.setHeader('Content-Disposition', `attchment; filename=${file?.fileName}`)
    res.setHeader('Content-Type', filename )

    s3Stream.pipe(res);

    s3Stream.on('error', (err) => {
      console.log("error occured in download , s3stream error");
      res.status(500).json({
        msg : "streaming error, please try again"
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg : "internal server error"
    })
  }
})

fileRouter.get("/:fileId", AuthMiddleware, async(req : Request, res: Response) => {
    const { fileId } = req.params
    console.log(fileId);
    //322d4620-5300-4401-9c28-9a700a7cb6bd
    try {
      const response = await prisma.file.findUnique({
        where :{
          id : fileId
        }, 
        select : {
          fileName : true,
          fileType : true,
          size : true
        }
      })

      if(response) {
        res.status(200).json({
          fileName : response.fileName,
          fileType : response.fileType,
          size : response.size
        })
      }
      res.status(404).json({
        msg : "no file found"
      })
    } catch (error) {
      
    }
})


fileRouter.get("/health/check", async(req: Request, res: Response)=> {
  res.json("working")
})

// 148 - 60 