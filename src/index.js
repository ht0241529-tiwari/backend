// require("dotenv").config({path:"./env"});
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:"./env"
});

connectDB()//its a aysc call it returns a promise so we can use then and catch or we can use async await
.then(()=>{
    app.listen(process.env.PORT || 3000,()=>{
        console.log(`App is listening at port ${process.env.PORT || 3000}`);
    })
})
.catch((error)=>{
    console.log("error conection failed:", error);
})






/*
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");
        app.on("error",(error)=>{
            console.error("Error starting the server:", error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
})()
    */