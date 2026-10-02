"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// entry point file 
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
//import AuthM from "./middleware/AuthMiddleware";
const fileRoute_1 = require("./routes/fileRoute/fileRoute");
const userRoute_1 = require("./routes/userRoute/userRoute");
const app = (0, express_1.default)();
const PORT = 8000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// file transfer system Route
app.use("/api/v1/file", fileRoute_1.fileRouter);
app.use("/api/v1/user", userRoute_1.userRouter);
// Vercel invokes the Express application as a serverless handler. Keep the
// local listener for development and traditional Node.js deployments.
if (!process.env.VERCEL)
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
exports.default = app;
