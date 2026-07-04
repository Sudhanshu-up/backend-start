import mongoose from "mongoose";

const uri =
  "mongodb+srv://sudhanshu:YOUR_PASSWORD@cluster0.gbf0ihz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

try {
  await mongoose.connect(uri);
  console.log("Connected");
} catch (err) {
  console.error(err);
}