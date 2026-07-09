import ApiError from "../utils/ApiError.js";
import asynHandler from "../utils/asynHandler.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
console.log("abced")
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}
console.log("abced2")

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
console.log("Step 00");
const exsitedUser = await User.findOne({
    $or: [{ username },{ email }]
})
console.log("Step 0");
if(exsitedUser){
    throw new ApiError(409, "User with eamil or username is already exsits")
}

//4 
console.log("Step 1");
const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverimage?.[0]?.path;
console.log("Step 2");

if(!avatarLocalPath) {
   throw new ApiError(400, "Avatar file is required") 
}
console.log("Step 3");
//5

 const avatar = await uploadOnCloudinary(avatarLocalPath)
console.log("Step 4");
 const coverimage = await uploadOnCloudinary(coverImageLocalPath)
console.log("Step 5");
 if(!avatar){
   throw new ApiError(400, "Avatarrrrr file is required") 
}
console.log("Step 6");
//6
const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowerCase()
})
console.log("Step 7");
//7
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)
console.log("Step 8");
//8

if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
}
 console.log("Step 9");
return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)
})
console.log("abced3")


const loginUser = asynHandler(async (req, res)=>{
    //0 req body se data laoo
    //1 email or username, find in database
    //2 check password in correct 
    //3 access and refresh token den hai
    //4 send cookie


    const {email, username, password} = req.body

    if (!(username || email) ) {
       throw new ApiError(400,"username or email is resquired") 
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    
    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

   //samj nahi aya hai 

   const loggedInUser = await User.findById(user._id).
   select("-password -refreshToken")

   ////

   const options = {
   httpOnly: true,
   secure: true, 
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User Logged in Successfully"
      )
   )
})
console.log("abced4")

const logOutUser = asynHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
     req.user._id,
     {
        $set:{
            refreshToken: undefined
        }
     },
     {
        new: true
     }

    )

    const options = {
        httpOnly: true,
        secure: true, 
    }
     
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})
console.log("abced5")

const refreshAccessToken = asynHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
    console.log("abced5")

})


const changeCurrentUserPassword = asynHandler(async(req, res)=>{
    const {oldPassword, newPassword}= req.body

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
    throw new ApiError(400, "invaild old password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "password changed !"))

   console.log("abced6")
})
console.log("abced7")

const getCurrentUser = asynHandler(async(req, res)=>{
    return res.status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully !"))
})
console.log("abced8")

const updateAccountDetails = asynHandler(async(req, res)=>{
    const {fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400,"All fields are required")
    }

   const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set: {
            fullname,
            email
        }
    },
    {new: true} // return valuse after the updation
).select("-password")

return res
.status(200)
.json(new ApiResponse(200, user, "Account details updated successfully"))

})
console.log("abced9")

const updateUserAvatar = asynHandler(async(req, res)=>{
    const avaterLocalPath = req.file?.path

    if(!avaterLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avaterLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
           $set: {
            avatar: avatar.url
           }
        },
        {new: true}
    ).select("-password")

    return res 
    .status(200)
    .json(new ApiResponse(200, user, "Avatar update successfully !"))
})
console.log("abced10")

const updateCoverImage = asynHandler(async (req, res) => {
  const coverimageLocalPath = req.file?.path;

  if (!coverimageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const coverimage = await uploadOnCloudinary(coverimageLocalPath);

  if (!coverimage.url) {
    throw new ApiError(400, "Error while uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverimage: coverimage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage update successfully !"));
});
console.log("abced11");

const getUserChannelProfile = asynHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubcribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        avatar: 1,
        coverimage: 1,
        email: 1,
      },
    },
  ])

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
  
});

const getwatchHistory = asynHandler(async(req, res)=>{
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline:[
                {
                  $project:{
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(new ApiResponse(200,user[0].watchHistory, "watchHistory fetch successfully"))
})


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentUserPassword ,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getwatchHistory

} ;