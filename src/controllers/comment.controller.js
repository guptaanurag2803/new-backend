import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "VideoId is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    if (!comments) {
        throw new ApiError(400, "Something went wrong");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, comments, "Comments retrieved successfully")
        )
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.create({ video: videoId, owner: req.user._id, content });

    if (!comment) {
        throw new ApiError(404, "Something went wrong while creating comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment created successfully")
        )
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
        throw new ApiError(404, "Comment not found");
    }

    if (!content) {
        throw new ApiError(400, "No content");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    comment.content = content;
    await comment.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Comment updated successfully")
        )
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(404, "Comment not found");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    await comment.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Comment deleted successfully")
        )
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}