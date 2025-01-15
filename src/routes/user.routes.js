import { Router } from "express";
import {
    registerUser,
    loginUser,
    logOutUser,
    changeCurrentPassword,
    getcurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
} from "../controllers/user.controller.js"
import { upload } from './../middlewares/multer.middleware.js';
import verifyJWT from './../middlewares/auth.middleware.js';
import { refreshAccessToken } from "../controllers/user.controller.js";
import router from './user.routes';
const router = Router();


router.route("/register").post(
    // added  multer-middleware in between 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]
    )

    , registerUser)

router.route("/login").post(loginUser)

// secured route 
router.route("/logout").post(
    verifyJWT, logOutUser)
// endpoint for refreshing token (secured route)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT , changeCurrentPassword)
route.router("/current-user").get(verifyJWT , getcurrentUser)
route.route("/update-account").patch(verifyJWT ,updateAccountDetails) // to update only certain fields

route.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
route.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT , getUserChannelProfile) // way of routing for fields in  params  here 'c' is channel
router.route("/history").get(verifyJWT , getWatchHistory)


export default router;