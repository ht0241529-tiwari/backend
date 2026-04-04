
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens=async(userId)=>
{
  try {
    const user=await User.findById(userId);
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"token generation failed");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validate user details-not empty, valid email, password strength
  //check if user already exists in database:by email,username
  //check for images,check for avatar
  //upload them to cloudinary,avatar
  //create user object-create entry in db
  //remove password and refreshTokens from response
  //check for user creation
  //return response to frontend with success message and user details else return error message

  const { username, email, password, fullName } = req.body;
  console.log("POSTMAN SE YE DATA AAYA HAI: ", req.body);
  
  // FIXED: Bulletproof validation checks if the field is missing OR empty
  if (
    [fullName, email, password, username].some((field) =>
      !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // FIXED: DB mein field 'username' hai, par variable 'username' hai
  const existedUser = await User.findOne({
    $or: [{ email }, { username: username }] 
  });

  if (existedUser) {
    throw new ApiError(409, "user already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  console.log("avatarLocalPath", avatarLocalPath);

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  console.log("coverImageLocalPath", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "avatar upload failed");
  }
  
  // FIXED: Cover Image optional hai, toh if-condition lagana zaroori hai
  let coverImage;
  if (coverImageLocalPath) {
     coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(), // FIXED: Mongoose schema ke according 'username' likhna hai
    password
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "user creation failed");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "user created successfully")
  );
});

const loginUser=asyncHandler(async(req,res)=>{
  //req body ->data
  //username and password
  //validate username and password
  //check if user exists in db by username
  //if user exists,compare password with hashed password in db
  //if password matches,generate access token and refresh token
  //save refresh token in db
  //return response to frontend with success message,access token and user details else return error message

  const {username,email,password}=req.body;
  
  if((!username && !email) || !password){
    throw new ApiError(400,"username, email and password are required");
  }
 
  const user=await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"user not found");
  }
  
 const isPasswordCorrect=await user.isPasswordCorrect(password)
  
  if(!isPasswordCorrect){
    throw new ApiError(401,"invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
  const options={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .cookie("refreshToken",refreshToken,options)
  .cookie("accessToken",accessToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,accessToken,
        refreshToken
      },
      "user logged in successfully"
    )
  )
});

const logoutUser=asyncHandler(async(req,res)=>{
  //get userId from req.user
  //find user in db by userId and remove refresh token
  //clear cookies in frontend
  //return response to frontend with success message else return error message 
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
  }

  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,null,"user logged out successfully")
  )
})

const refreshAccessToken=asyncHandler(async(req,res)=>{

  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(400,"refresh token is required");
  }

  try {
    const decodedToken=jwt.verify(
      incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
    )
  
    const user=await User.findById(decodedToken?.userId);
    
    if(!user){
      throw new ApiError(404,"user not found");
    }
  
    if(user?.refreshToken !== incomingRefreshToken){
      throw new ApiError(401,"invalid refresh token");
    }
  
    const options={
      httpOnly:true,
      secure:true
    }
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    return res
    .status(200)
    .cookie("refreshToken",newRefreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,refreshToken:newRefreshToken
        },
        "access token refreshed successfully"
      )
  
    )
  } catch (error) {
    throw new ApiError(401,"invalid refresh token");
  }


})
export { registerUser, loginUser,logoutUser,refreshAccessToken };
