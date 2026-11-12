
import {asyncHandler} from "../utils/asyncHandlers.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    console.log("Email:", email);
     
   if (
    [fullName,email,username,password].some((field) =>
      field?.trim () === "")
    ) {
    throw new ApiError(400, "All fields are required");
  } 

 const existedUser = await User.findOne({
    $or:[{ username },{ email }]
    
 })

if (existedUser) {
    throw new ApiError(409, "user with email or username already exists")
}

 const avatarLocalPath =  req.files?.avatar[0]?.path;
 const coverImageLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar) {
    throw new ApiError(400, "Avatar file is required")
}

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "" ,
    email,
    username: username.toLowerCase(),
    password
})

 const create = await  User.findById(user._id).select("-password -refreshToken"

 )  

 if(!createdUser) {
    throw new ApiError(500, "somewhting went wrong while registering the user")
 }

 return res.status(201).json(

new ApiResponse(200, createdUser, "user registered successfully")

 )

})



export { registerUser };




// steps to follow for this particular project
// 1. get user details from frontend/postman
// 2. validation(needed in frontend n backend both but if it missed in frontend by anychance but shouldnt missed in backend) - not empty
// 3. check if user already exists:username, email
// 4. check img, check for avatar
//5. upload them to cloudinary, check for avatr
// 6. create user obj-crate entry in DB
// 7. remove password and refresh token field from response
// 8. check for user creation
// 9. return respond


