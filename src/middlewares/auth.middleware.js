import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

//where ever we not use any responece or request we can use _ as a placeholder to avoid unused variable error
export const verifyJWT=asyncHandler(async(req,_,next)=>{
   try {
    const token=req.cookies?.accessToken || req.header
    ("Authorization")?.replace("Bearer ","");
 
    if(!token){
     throw new ApiError(401,"Unauthorized, token not found");
    }
 
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id).
    select("-password -refreshToken")
 
    if(!user){
     //NEXT_VIDEO:TODO discuss about the frontned
     throw new ApiError(401,"Unauthorized, user not found");
    }
 
    req.user=user;
    next();
   } catch (error) {
    throw new ApiError(401,"Invalid access token");
   }
})