
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {

    // 1. Get token from cookies or Authorization header
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "").trim();

    // 2. Check whether token exists
    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    // 3. Verify JWT
    const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    // 4. Find user from decoded token
    const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    // 5. Attach user to request
    req.user = user;

    // 6. Move to next middleware/controller
    next();
});
