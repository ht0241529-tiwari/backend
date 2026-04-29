
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

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword,conformPassword}=req.body;

  const user=await User.findById(req.user?._id);

  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect){
    throw new ApiError(401,"old password is incorrect");
  }
  if(newPassword !== conformPassword){
    throw new ApiError(400,"new password and confirm password do not match");
  }
  user.password=newPassword;
  await user.save({validateBeforeSave:false});

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "password changed successfully"
    )
  )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res.status(200)
  .json(
    new ApiResponse(
      200,
      req.user,
      "current user fetched successfully"
    )
  )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{

  const {fullName,email}=req.body;

  if(!fullName || !email){
    throw new ApiError(400,"full name and email are required");
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email:email
      }
    },
    {
      new:true
    }
  ).select("-password");

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "account details updated successfully"
    )
  )
})

const updateUserAvatar=asyncHandler(async(req,res)=>{

  const avatarLocalPath=req.file?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"avatar is required");
  }
  //TODO delete old image from cloudinary using cloudinary public id before uploading new image and updating user document in db
  const avatar=await uploadOnCloudinary(avatarLocalPath);

console.log("avatar upload response: ", avatar.url);

  if(!avatar.url){
    throw new ApiError(500,"error while uploading on avatar");
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {
      new:true
    }
  )
  console.log("updated user with new avatar: ", user);
  return res
.status(200)
.json(
  new ApiResponse(
    200,
    user,
    "avatar updated successfully"
  )
)



})

const updateUserCoverImage=asyncHandler(async(req,res)=>{

  const coverImageLocalPath=req.file?.path;

  if(!coverImageLocalPath){
    throw new ApiError(400,"cover image is required");
  }
  const coverImage=await uploadOnCloudinary(coverImageLocalPath);

  if(!coverImage.url){
    throw new ApiError(500,"error while uploading on cover image");
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {
      new:true
    }
  )
return res
.status(200)
.json(
  new ApiResponse(
    200,
    user,
    "cover image updated successfully"
  )
)
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{

  const {username}=req.params;

  if(!username?.trim()){
    throw new ApiError(400,"username is required");
  }

  const channel=await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
        $lookup:{
          from:"subscriptions",
          localField:"_id",
          foreignField:"channel",
          as:"subscribers"
        }
      
    },
    {
        $lookup:{
          from:"subscriptions",
          localField:"_id",
          foreignField:"subscriber",
          as:"subscribedTo"
        }
    },
    {
        $addFields:{
          subscribersCount:{
            $size:"$subscribers"
          },
          channelsSubscribedToCount:{
            $size:"$subscribedTo"
          },
          isSubscribed: {
            $cond:{
              if:{$in:[req.user?._id,"$subscribers.subscriber"]},
              then:true,
              else:false
    }
          }
        }
    },
    {
         $project:{
          fullName:1,
          username:1,
          email:1,
          avatar:1,
          coverImage:1,
          subscribersCount:1,
          channelsSubscribedToCount:1,
          isSubscribed:1
      }
    }
    
  ])
   console.log("channel profile data: ", channel);

   if(!channel?.length){
    throw new ApiError(404,"channel not found");
   }
//explanation in this link https://chatgpt.com/share/69eda83f-d998-8320-bedd-89ed163a373d
   return 
   res.status(200)
   .json(
    new ApiResponse(
      200,
      channel[0],
      "channel profile fetched successfully"
    )
   )
})

const getWatchHistory=asyncHandler(async(req,res)=>{
  // req.user._id from this we get string and then you give to mongoose and it will convert to object id
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"WatchHistory",
        foreignField:"_id",
        as:"watchHistory",
        //you can see populated method aslo
        pipeline:[
          {
            $lookup:{
              from:"users",
              localfield:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[//if ya pipeline bahar hota to ownerDetails me owner ka id aata but pipeline ke andar hone se owner details me owner ka pura document aa jayega
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{//two way to take out data from array if you know there is only one element in ownerDetails array then you can use $arrayElemAt operator to take out that element from array and make it as object and then you can access the properties of that object directly but if you are not sure about number of elements in ownerDetails array then you can use $unwind stage to deconstruct the ownerDetails array and then you can access the properties of ownerDetails directly without using $arrayElemAt operator
              owner:{
                  $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])

   return res.status(200)
   .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "watch history fetched successfully"
    )
   )
})
export { registerUser,
         loginUser,
         logoutUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
          updateUserAvatar,
          updateUserCoverImage,
          getUserChannelProfile,
          getWatchHistory
   };
