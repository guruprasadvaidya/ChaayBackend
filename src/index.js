
import dns from "node:dns";
import app from "./app.js";
import connectDB from "./db/index.js";

dns.setServers(["8.8.8.8"]);

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });




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