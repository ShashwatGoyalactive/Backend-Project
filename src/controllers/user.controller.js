import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { User } from './../models/user.model';


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateRefreshToken()
        const refreshToken = user.generateAccessToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        user.accessToken = accessToken
        await user.save({ validateBeforeSave: false })
        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Basic setup
    // get user details from frontend (user schema par depend karta hai )
    // validation (details jo aai hai vo sahi hai kya ) - not empty 
    // check if user already exist : username and email 
    // check for images , check for avatar  // via multer 
    // upload them to cloudinary 
    // Techincal Summary (user ne data diya -> image nikale -> cloudinary par upload kiya -> url get kiya )


    // step 2 object banenge 
    // create user object - create entry in db
    // remove password and refresh token field from response 
    // check for user creation 
    // return response 

    const { fullName, email, username, password } = req.body
    // console.log("req.body ===> " , req.body)
    // console.log("email: " , email);

    if (fullName === "") {
        throw new ApiError(400, "full name is required")
    }
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // user model mein check kar lenge ki user exist karta hai ya nahi 
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    console.log(existedUser);

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exist ")
    }

    // images and avatar (files ka access hame middleware deta hai (basically request mein kuch fields add kar deta hai ))
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(avatarLocalPath);
    console.log("req.files ==>", req.files);

    //   const coverImageLocalPath = req.files?.coverImage?.[0].path;
    //     console.log(coverImageLocalPath);

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.length > 0) {
        coverImageLocalPath = req.files.coverImage[0];
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // creating user object 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    // check if user exist or not 

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //-matlab exclude 
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))


})

const loginUser = asyncHandler(async (req, res) => {


    // req body -> data 
    // username or email 
    // find the user 
    // password check 
    // access and refresh token 
    // send cookie (for sending tokens)

    const { email, password, username } = req.body
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    // find user 
    const user = await User.findOne({
        $or: [{ email }, { username }] // mongodb variable or to check for multiple parameter with or condition 
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    // password check 

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials!");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id)

    //send cookies 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //  we have to design options that are required to be sent to the cookies 
    const options = {
        // these two options make the cookie modifyable only by the backend 

        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production only
        sameSite: "strict", // Recommended for CSRF protection

    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logOutUser = asyncHandler(async (req, res) => {
    // clear cookies 
    // reset accessToken , refreshToken 

    // this method is running after the auth.middleware has completed its 
    // execution and has added a new object user in the (req) for access of the access token 

    //     await User.findByIdAndUpdate(req.user._id, 
    //         req.user_id,
    //         {
    //          $unset :  {
    //             refreshToken: 1,
    //         }    
    //         },
    //         {
    //             new: true,
    //         }
    // );
    // const options = {
    //     httpOnly: true,
    //     secure: true
    // }

    // return res
    //     .status(200)
    //     .clearCookie("accessToken", options)
    //     .clearCookie("refreshToken", options)
    //     .json(new ApiResponse(200, {}, "User loggedOut successfully!"))
    const logOutUser = asyncHandler(async (req, res) => {
        // Ensure `req.user` exists (set by `verifyJWT` middleware)
        if (!req.user || !req.user._id) {
            throw new ApiError(401, "Unauthorized: User not authenticated");
        }

        // Unset the refresh token in the database
        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } }, // Proper update object
            { new: true }
        );

        // Define cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Secure in production only
            sameSite: "strict", // Recommended for CSRF protection
        };

        // Clear cookies and send response
        res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully!"));
    });


})


const refreshAccessToken = asyncHandler(async (req, res) => {
    // acquiring the Refresh Token of the user trying to register (from user cookie) 
    const inComingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if (!inComingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    // decoding the token using the process environment refresh Token secret 
    try {
        const decodedToken = jwt.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        //    fetching the user from the decoded token 
        const user = await User.findById(decodedToken?._id)

        // if no user exist 
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
        // comparing the refresh token with the refresh token saved in user's cookie from the Database 
        if (inComingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        // modifying the cookie by regenerating the tokens 
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Secure in production only
            sameSite: "strict", // Recommended for CSRF protection
        };

        // Set the new refresh token in the user's cookie
        res.cookie('refreshToken', newRefreshToken, options);

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefeshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed")
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invaid refresh Token")

    }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    // agar user password change kar paa raha hai to iska matlab login hai 
    // auth middleware se tab usme req.user ki field bhi add hui hogi to usse hamko user ka access mil jaayega

    const user = await User.findById(req.user?._id)

    // check old password

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old password")
    }
    // user password
    user.password = new Password
    // save password
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password updated"))

})

const currentUser = asyncHandler(async (req, res) => {
    // if the user is logged in 

    return res.status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Account details updated successfully1"
            ))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // note this method is just a controller for updating the avatar 
    // before this in the routing we have to define two middleware - 1. check if user is logged in , 2. multer middleware for accessing the avatar file 
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Avatar updated successfully!"
        ))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    // note this method is just a controller for updating the avatar 
    // before this in the routing we have to define two middleware - 1. check if user is logged in , 2. multer middleware for accessing the avatar file 
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Cover image updated successfully!"
        ))
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    currentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}




/** In software development, particularly in MVC (Model-View-Controller) architectural patterns, controllers are responsible for handling the logic that connects the application's data (Model) to its user interface (View). They act as intermediaries or "managers" that process user inputs, interact with the data, and determine how to display the response.

Purpose of Controllers
Process User Input:
Controllers handle requests (e.g., HTTP requests in web apps) and determine what actions to take.
Interact with Models:
Controllers fetch or modify data by interacting with the models.
Render Responses:
Controllers send the appropriate data or views (HTML, JSON, etc.) back to the user.
Controllers in MVC
Here's how controllers fit into the MVC architecture:

Model:
Manages the data and business logic of the application.
View:
Displays data and interacts with the user.
Controller:
Handles user requests, processes them, and interacts with the Model and View. */