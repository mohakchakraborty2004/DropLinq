// entry point file 
import  express  from "express";
import cors from "cors";
//import AuthM from "./middleware/AuthMiddleware";
import { fileRouter } from "./routes/fileRoute/fileRoute";
import { userRouter } from "./routes/userRoute/userRoute";


const app = express();
const PORT = 8000;

app.use(cors())

app.use(express.json());

// file transfer system Route
app.use("/api/v1/file", fileRouter);
app.use("/api/v1/user", userRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
