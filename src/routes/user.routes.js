import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {  loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    //  this is middleware
    upload.fields([
        {
           name: "avatar",
           maxCoubt:1
        },
        {
            name: "coverImage",
            maxCoubt:1
        }
    ]),

    registerUser

);


router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;


