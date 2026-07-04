import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

const connectDB = async()=>{
    try {
       console.log(process.env.DATABASE_URI);
       const connectionInstance = await mongoose.
       connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
       console.log(`\n mongoDB connected !! db host 
        ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("mondoDB connection error : ",error);
        process.exit(1)
    }
}

export default connectDB