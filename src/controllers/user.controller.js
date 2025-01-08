import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
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

    const {fullName, email, username, password } = req.body
    console.log("email: " , email);
    
    if(fullName === ""){
        throw new ApiError(400, "full name is required")
    }
    if(
        [fullName , email, username,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // user model mein check kar lenge ki user exist karta hai ya nahi 
 const existedUser =    User.findOne({
        $or: [{ username } , { email }]
    })
    console.log(existedUser);
    
    if(existedUser){
        throw new ApiError(409, "User with username or email already exist ")
    }

    // images and avatar (files ka access hame middleware deta hai (basically request mein kuch fields add kar deta hai ))
  const avatarLocalPath = req.files?.avatar[0]?.path;
        console.log(avatar);
        
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // creating user object 
  const user =   await User.create({
        fullName,
       avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })
    
    
 // check if user exist or not 

    const createdUser =   await User.findById(user._id).select(
        "-password -refreshToken" //-matlab exclude 
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user" )
    }

    return res.status(201).json(new ApiResponse(200, createdUser , "User registered successfully"))


})

export {registerUser,}




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