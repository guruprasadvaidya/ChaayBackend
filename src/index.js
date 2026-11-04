
import dns from "node:dns";

dns.setServers(["8.8.8.8"]);

import dotenv from 'dotenv'
import connectDB from "./db/index.js"

dotenv.config({
    path: './.env'
})

connectDB()







/*
this is first approach to connect to database

import express from "express"
const app = express()
 
(async () => {

    try {
       await  mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME }  `)
       app.on("error", (error) => {
        console.log("error", error );
       throw error
       } )

       app.listen(process.env.PORT, () => {
        console.log(`app is listening on port $ {process.env.PORT}`)
       } )

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }

})()

*/