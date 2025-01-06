// for file upload on cloudinary 

import {v2 as cloudinary} from "cloudinary"
import fs from "fs" //file system of nodejs 

import { v2 as cloudinary } from 'cloudinary';


    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ,
        api_secret: process.env.CLOUDINARY_API_SECRET, 
    });

   const uploadOnCloudinary = async (localFilePath)=> {
    try {
        if(!localFilePath)return null;
        // upload the file on cloudinary 
     const response =  await cloudinary.uploader.upload(localFilePath , {
            resource_type: "auto"
        })
        // file has been uploaded successfully 
        console.log("file is uploaded on cloudinary" , response.url);
        return response;
    } catch (error) {
        // file is in server but not uploaded on cloudinary so we should remove it from the server for maintaining a clean code in a synchronouns way 
       
        fs.unlinkSync(localFilePath) // remove the locally saved temporary files as the operation got failed 
        return null;
    }
   } 

   export {uploadOnCloudinary}