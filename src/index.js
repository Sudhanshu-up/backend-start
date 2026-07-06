// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from "./app.js"

console.log("INDEX FILE RUNNING");

dotenv.config({
    path: './.env'
})



connectDB().then(()=>{
  app.listen(process.env.PORT || 8000 ,()=>{
    console.log(`server is listening at port : ${process.env.PORT}`)
  })
})
.catch((err)=>{
   console.log("mongo db connection faild !! ", err );
})