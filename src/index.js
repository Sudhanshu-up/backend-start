import mongoose from "mongoose";
import dotenv from "dotenv";



const uri = process.env.DATABASE_URI;

console.log(uri);

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => {
    console.log(err);
  });

  dotenv.config();