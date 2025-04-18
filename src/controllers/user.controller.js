import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (re1, res) => {
    return res.status(200).json({
        message: "ok"
    })
});

export {registerUser};