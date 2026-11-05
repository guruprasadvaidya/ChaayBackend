import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// Cookie-parser is an Express.js middleware that reads cookies sent by the browser and makes them accessible in your backend.

const app = express();

// use methods used for all the middlewares and configurations
app.use(cors ({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

//  	Parses incoming JSON request bodies
app.use(express.json({limit:"16kb"}))

// Parses URL-encoded request bodies
app.use( express.urlencoded({extended: true,limit: "16kb"}) )

//  for static files
app.use(express.static("public"))

// server read n perform the CRUD on cookie(Parses incoming cookies)
app.use(cookieParser())

export default app