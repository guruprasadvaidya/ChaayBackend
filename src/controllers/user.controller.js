import asyncHandler from "../utils/asyncHandlers.js";
// this type of import known as default import/export without curlyBraces, with curlyBraces like {asyncHandler} known as Named import/export
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    });
});

export { registerUser };