import { Router } from "express";
import  { 
     registerUser, 
     loginUser, 
     logOutUser, 
     refreshAccessToken,
     changeCurrentUserPassword,
     getCurrentUser, 
     updateAccountDetails, 
     updateUserAvatar, 
     updateCoverImage,
     getUserChannelProfile, 
     getwatchHistory
    } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verfiyJWt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verfiyJWt, logOutUser)

router.route("RA_token").post(refreshAccessToken)

router.route("/change_password").post(verfiyJWt, changeCurrentUserPassword)

router.route("/current_user").get(verfiyJWt,getCurrentUser)

router.route("/update_account-detail").patch(verfiyJWt,updateAccountDetails)

router.route("/update_avatar").patch(verfiyJWt, upload.single("avatar"), updateUserAvatar)

router.route("/update_coverimage").patch(verfiyJWt, upload.single("coverimage"), updateCoverImage)

router.route("/channel/:username").get(verfiyJWt,getUserChannelProfile)

router.route("/watchHistory").get(verfiyJWt,getwatchHistory)



export default router;