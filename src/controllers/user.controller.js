
import {asyncHandler} from "../utils/asyncHandlers.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse";

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
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) 
        && req.files.coverImage.length > 0) {
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

    // 6. Create user in database
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


