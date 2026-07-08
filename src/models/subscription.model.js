import { ObjectId } from "mongodb";
import mongoose,{Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Type.ObjectId,
        ref:"User"  
    },
    channel:{
        type:Schema.Type.ObjectId,
        ref:"User"  
    }
},{timestamps: true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema);