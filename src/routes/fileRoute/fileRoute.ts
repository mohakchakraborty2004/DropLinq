import express from "express";
import AWS from "aws-sdk";
import multer from "multer"; 
import dotenv from "dotenv";

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

fileRouter.post("/upload", upload.single('file'), async (req : any,res: any ) => {
 if(!req.file) res.status(400).json({ msg : "no file found"});

 const {originalname ,mimetype ,buffer } = req.file
 const s3Key = `uploads/${Date.now()}_${originalname}` ;

 const params = {
    Bucket : bucket_name,
    Key : s3Key ,
    Body : buffer,
    ContentType : mimetype
 }

 try {
    const response = await s3.upload(params).promise(); 

    if (response) {
      console.log("uploaded")
    }

    res.json({
      msg : "uploaded", 
      response,
      s3Key
    })

 } catch (error) {
   console.error("S3 upload error:", error);
   res.status(500).json({ msg: "Upload failed" });
 }

})



fileRouter.get("/download/:fileId", (req: any, res: any) => {

})

