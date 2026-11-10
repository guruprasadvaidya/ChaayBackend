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


//  Routes Import

import userRouter from './routes/user.routes.js'


// routes declaration, we are taking middleware here bcoz files are seperates so we are using app.use method instead of app.get(for the same file)

app.use("/api/v1/users" , userRouter)
//  app.use(path, middleware);  First argument: Base URL.
// Second argument: Middleware or Express Router

//  http: // localhost:8000/api/v1/users/register
export default app