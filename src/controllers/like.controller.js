import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    let responseMessage, responseData;

    if (existingLike) {
        await existingLike.deleteOne();
        responseMessage = "Video disliked successfully";
        responseData = {};
    } else {
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user._id
        });

        if (!newLike) {
            throw new ApiError(500, "Error while liking the video");
        }

        responseMessage = "Video liked successfully";
        responseData = newLike;
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, responseData, responseMessage)
        );
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    let responseMessage, responseData;

    if (existingLike) {
        await existingLike.deleteOne();
        responseMessage = "Comment disliked successfully";
        responseData = {};
    } else {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });

        if (!newLike) {
            throw new ApiError(500, "Error while liking the comment");
        }

        responseMessage = "Comment liked successfully";
        responseData = newLike;
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, responseData, responseMessage)
        );

});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    let responseMessage, responseData;

    if (existingLike) {
        await existingLike.deleteOne();
        responseMessage = "Tweet disliked successfully";
        responseData = {};
    } else {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });

        if (!newLike) {
            throw new ApiError(500, "Error while liking the tweet");
        }

        responseMessage = "Tweet liked successfully";
        responseData = newLike;
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, responseData, responseMessage)
        );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true }
    }).populate("video");

    if (!likedVideos) {
        throw new ApiError(404, "Something went wrong while retrieving liked videos");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked videos retrieved successfully")
        );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}