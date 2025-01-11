// verifies if user exists or not (used in user logout functionality )
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// jahan par response ki requirement nahi hai vahan par hamlog 'res' field ki jagah '_'  pass kartw hain
 const verifyJWT = asyncHandler(async (req, _, next)=>{
    // here we are performing optional chaining (because cookies are not present on mobile applications(apps) )
  try {
    console.log(req.cookie);
  //   console.log(req.header()["set-cookie"]);
    
    
  //   const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  // console.log("token" ,token);
  
  //    if(!token){
  //     throw new ApiError(404, "Unauthorized request")
  //    }
  
  //   const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  //    console.log("decodeToken " , decodedToken);
     
  //    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
  //    if(!user){
  //     // Todo : discuss about frontend
  //     throw new ApiError(401, "Invalid Access Token user doesnot exist ")
  //    }
  // // adding new user object in req
  //    req.user = user;
  //    next() 
  //    // next hamlog isliye pass karte hain taki jab route define karain aur 
  //    // usme middleware ke saath saath main fucntion 
  //    // call karain to route perform karne ke baad uske baad ke functions bhi run hoon 
    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    // console.log(token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if (!user) {

      throw new ApiError(401, "Invalid Access Token")
    }

    req.user = user;
    next()
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")

  }
})

export default verifyJWT;