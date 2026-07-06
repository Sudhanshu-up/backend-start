import ApiError from "../utils/ApiError.js";
import asynHandler from "../utils/asynHandler.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"



const registerUser = asynHandler(async (req, res)=>{
     console.log("REGISTER CONTROLLER CALLED");
    // 1 get usere details from frontend
    // 2 vaildation -not empty
    // 3 check if user already exists: username,email
    // 4 check for images check for avtar
    // 5 upload them to cloudinary, avatar
    // 6 create user object - create entry in db
    // 7 remove password and refres token field from response
    // 8 check for user creation 
    // 9 return response

//1
 const {fullname, email, username, password} = req.body
console.log(req.body);
//2
 if(
    [fullname, email, username, password].some((field)=>
    field.trim() === "")
 ){
    throw new ApiError(400,"fullname is required")

 };

//3

const exsitedUser = await User.findOne({
    $or: [{ username },{ email }]
})

if(exsitedUser){
    throw new ApiError(409, "User with eamil or username is already exsits")
}

//4 

const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverimage?.[0]?.path;


if(!avatarLocalPath) {
   throw new ApiError(400, "Avatar file is required") 
}

//5

 const avatar = await uploadOnCloudinary(avatarLocalPath)

 const coverimage = await uploadOnCloudinary(coverImageLocalPath)

 if(!avatar){
   throw new ApiError(400, "Avatarrrrr file is required") 
}

//6
const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowerCase()
})

//7
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

//8

if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
}
//9 
return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)
})



export default registerUser;