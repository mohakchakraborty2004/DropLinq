//rate limitters 
import { rateLimit } from 'express-rate-limit'

export const UserLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 40, // 40 requests per 15 mins
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	message : () => {
        console.log("Signup limit reached, please try again after 15 mins")
        alert("Signup limit reached, please try again after 15 mins")
    }
})


export const FileLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 15, //15 requests per 15 mins
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
    message : () => {
        console.log("file upload limit reached, please try again after 15 mins")
        alert("file upload limit reached, please try again after 15 mins")
    }
})