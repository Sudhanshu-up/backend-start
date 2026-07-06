
import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";

// (async function() {

//     cloudinary.config({
//         cloud_name:process.env.CLOUD_NAME,
//         api_key: process.env.API_KEY,
//         api_secret: process.env.API_SECRET
//     });

//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });

//     console.log(uploadResult);

//     console.log(autoCropUrl);
// })();


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
 
  try {
    if (!localFilePath) return null;
    console.log("Uploading:", localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Cloudinary Response:", response);
    
    fs.unlinkSync(localFilePath) //remove the  locally saved temporay file as the upload opertion got failed
    
    return response;
  } catch (error) {
    console.log("Cloudinary Error =>", error);

    return null;
}
};

export default uploadOnCloudinary;
