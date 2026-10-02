"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLimiter = exports.UserLimiter = void 0;
//rate limitters 
const express_rate_limit_1 = require("express-rate-limit");
exports.UserLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 40, // 40 requests per 15 mins
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: () => {
        console.log("Signup limit reached, please try again after 15 mins");
        alert("Signup limit reached, please try again after 15 mins");
    }
});
exports.FileLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 15, //15 requests per 15 mins
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: () => {
        console.log("file upload limit reached, please try again after 15 mins");
        alert("file upload limit reached, please try again after 15 mins");
    }
});
