import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// configuration when data is json format
app.use(
    express.json({
        limit: "16kb",
    })
);
// configuration for data from url
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
// configuration for storing files and folders in public folder for public access 
app.use(express.static("public"))
// for configuration of cookies 
app.use(cookieParser())



// routes imports 
import userRouter from "./routes/user.routes.js"

// routes declaration 
app.use("/api/v1/users", userRouter)

export { app };
