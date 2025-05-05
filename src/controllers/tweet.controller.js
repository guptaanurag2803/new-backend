import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if(!content) {
        throw new ApiError(400, "No content ");
    }

    const owner = req.user._id;
    const tweet = await Tweet.create({ content, owner });

    const createdTweet = await Tweet.findById(tweet._id);

    if(!createdTweet) {
        throw new ApiError(404, "Something went wrong while creating tweet");
    }

    return res.
    status(200).
    json(
        new ApiResponse(200, createdTweet, "Tweet Posted Successfully")
    )
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const tweets = await Tweet
    .find({ owner: userId })
    .select("_id content createdAt updatedAt");

    return res
        .status(200)
        .json(
            new ApiResponse(200, tweets, "All tweets fetched successfully")
        );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { newContent } = req.body;

    if (!newContent) {
        throw new ApiError(400, "No updates applied");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet");
    }

    tweet.content = newContent;
    await tweet.save();

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this tweet");
    }

    await tweet.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Tweet deleted successfully")
        );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}