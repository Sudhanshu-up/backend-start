import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';

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
        cloud_name:process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET
    });

const uploadOnCloudinary = async (localFilePath) =>{
    try {
       if(!localFilePath) return null
       const response = await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
       console.log(response)
       return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export default uploadOnCloudinary;