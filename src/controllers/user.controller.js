import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken";

// Generate Access and Refresh Tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save only refresh token in database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};


// Register User
const registerUser = asyncHandler(async (req, res) => {

    // 1. Get user details
    const { fullName, email, username, password } = req.body;

    console.log("Email:", email);

    // 2. Validate required fields
    if (
        [fullName, email, username, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Normalize user input
    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // 3. Check if user already exists
    const existedUser = await User.findOne({
        $or: [
            { username: normalizedUsername },
            { email: normalizedEmail }
        ]
    });

    if (existedUser) {
        throw new ApiError(
            409,
            "User with this email or username already exists"
        );
    }

    // 4. Check avatar file
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    let coverImageLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // 5. Upload files to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar?.url) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // 6. Create user object in database
    const user = await User.create({
        fullname: normalizedFullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: normalizedEmail,
        username: normalizedUsername,
        password
    });

    // 7. Fetch created user without sensitive fields
    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    // 8. Check user creation
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    // 9. Send response
    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});


// Login User
const loginUser = asyncHandler(async (req, res) => {

    // 1. Fetch data from req.body
    const { email, username, password } = req.body;

    // 2. Check username or email
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    // 3. Find the user
    const user = await User.findOne(
        email
            ? { email: email.trim().toLowerCase() }
            : { username: username.trim().toLowerCase() }
    );

    // If user does not exist
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // 4. Check password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // 5. Generate access and refresh tokens
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);

    // 6. Fetch logged-in user without sensitive fields
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    // Send cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    // 7. Send response
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
        );
});


// Logout User
const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User successfully logged out"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req,res) => {

const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized request")
}

try {
    


const decodedToken = jwt.verify(
   incomingRefreshToken,
   process.env.REFRESH_TOKEN_SECRET 
)

const user = await User.findById(decodedToken?._id)

if(!user){
    throw new ApiError(401, " Invalid Refresh Token")
}

if (incomingRefreshToken !==user?.refreshToken){
    throw new ApiError(401, "refresh token is expired or used" )}

    const options = {
        httpOnly: true,
        secure: true
    }

   const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
     .json(
        new ApiResponse(
            200,
            {
                accessToken,
               refreshToken: newRefreshToken
            }
        )
     )
     } catch (error) {
     throw new ApiError(401, error?.message || "invalid refresh token"  )
}
}
)

const changeCurrentPassword = asyncHandler(async (req,res) => 
    {
    const {oldPassword, newPassword} = req.body

  const user = await User.findById(res.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect){
    throw new ApiError(401, "invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

return res
.status(200)
.json( new ApiResponse(200, {}, "password changed successfully" ))

})

const getCurrentUser = asyncHandler(async(req,res) => {

    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully!"))

})

const updateAccountDetails = asyncHandler(async(req,res) =>{

    const {fullName, email} = req.body

    if (!fullName || email) {
        
        throw new ApiError(400,"all fields are required")

    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password ")
   
    return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully!"))

})

const updateUserAvatar = asyncHandler(async(req,res) => 
    {
   
        const avatarLocalPath = req.files?.path

        if(!avatarLocalPath) {
            throw new ApiError(400, "avatar file is missing")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
         
         if(!avatar.url) {
            throw new ApiError(400, "error while uploading on avatar")
        }

      const user =   await User.findByIdAndUpdate(
            req.user?._id,
            {

                $set:{
                    avatar: avatar.url
                }

            },
            {new: true}
        ).select("-password")
return res
 .status(200)
 .json(
    new ApiResponse(200,user,"avatar Image updated successfully!")
 )
} )

const updateUserCoverImage = asyncHandler(async(req,res) => 
    {
   
        const coverImageLocalPath = req.files?.path

        if(!coverImageLocalPath) {
            throw new ApiError(400, "coverImage file is missing")
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
         
         if(!coverImage.url) {
            throw new ApiError(400, "error while uploading on avatar")
        }

      const user =  await User.findByIdAndUpdate(
            req.user?._id,
            {

                $set:{
                    coverImage: coverImage.url
                }

            },
            {new: true}
        ).select("-password")

 return res
 .status(200)
 .json(
    new ApiResponse(200,user,"cover Image updated successfully!")
 )

} )

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage };



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


