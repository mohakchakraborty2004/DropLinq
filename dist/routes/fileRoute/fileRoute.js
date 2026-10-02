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
exports.fileRouter = void 0;
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("../../db/db"));
const rateLimiter_1 = require("../../utils/rateLimiter");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
dotenv_1.default.config();
const bucket_name = process.env.AWS_S3_BUCKET_NAME;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: accessKey,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.fileRouter = express_1.default.Router();
//rate-limit
exports.fileRouter.use(rateLimiter_1.FileLimiter);
exports.fileRouter.post("/upload", AuthMiddleware_1.AuthMiddleware, upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        res.status(400).json({ msg: "no file found" });
    const { originalname, mimetype, buffer } = req.file;
    const { size } = req.file;
    const s3Key = `uploads/${Date.now()}_${originalname}`;
    if (size > 5000000) {
        res.json({
            msg: "file size exceeded, sorry!"
        });
    }
    const params = {
        Bucket: bucket_name,
        Key: s3Key,
        Body: buffer,
        ContentType: mimetype
    };
    try {
        const response = yield s3.upload(params).promise();
        const dbRes = yield db_1.default.file.create({
            data: {
                fileName: originalname,
                fileType: mimetype,
                s3Key: s3Key,
                size: size
            }
        });
        const DownloadLink = `${req.protocol}://${process.env.HOST || `localhost:8000`}/download/${dbRes.id}`;
        if (response) {
            res.status(200).json({
                msg: "uploaded",
                DownloadLink
            });
            console.log("uploaded");
        }
    }
    catch (error) {
        console.error("S3 upload error:", error);
        res.status(500).json({ msg: "Upload failed" });
    }
}));
exports.fileRouter.get("/download/:fileId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileId } = req.params;
    if (!fileId) {
        res.status(404).json({
            msg: "file not found"
        });
    }
    try {
        const file = yield db_1.default.file.findUnique({
            where: {
                id: fileId
            }
        });
        if (!file) {
            res.status(404).json({
                msg: "file not found in db"
            });
        }
        const s3key = file === null || file === void 0 ? void 0 : file.s3Key;
        const filename = file === null || file === void 0 ? void 0 : file.fileType;
        const params = {
            Bucket: bucket_name,
            Key: s3key
        };
        const s3Stream = s3.getObject(params).createReadStream();
        res.setHeader('Content-Disposition', `attchment; filename=${file === null || file === void 0 ? void 0 : file.fileName}`);
        res.setHeader('Content-Type', filename);
        s3Stream.pipe(res);
        s3Stream.on('error', (err) => {
            console.log("error occured in download , s3stream error");
            res.status(500).json({
                msg: "streaming error, please try again"
            });
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "internal server error"
        });
    }
}));
exports.fileRouter.get("/:fileId", AuthMiddleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileId } = req.params;
    console.log(fileId);
    //322d4620-5300-4401-9c28-9a700a7cb6bd
    try {
        const response = yield db_1.default.file.findUnique({
            where: {
                id: fileId
            },
            select: {
                fileName: true,
                fileType: true,
                size: true
            }
        });
        if (response) {
            res.status(200).json({
                fileName: response.fileName,
                fileType: response.fileType,
                size: response.size
            });
        }
        res.status(404).json({
            msg: "no file found"
        });
    }
    catch (error) {
    }
}));
exports.fileRouter.get("/health/check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json("working");
}));
// 148 - 60 
