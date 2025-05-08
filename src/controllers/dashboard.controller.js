import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid or missing channel ID");
    }

    const [videos, subscriberCount, likeCount] = await Promise.all([
        Video.find({ owner: channelId }, "_id views"),
        Subscription.countDocuments({ channel: channelId }),
        Like.countDocuments({ likedBy: channelId })
    ]);

    const totalVideos = videos.length;
    const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);

    const stats = {
        totalVideos,
        totalViews,
        totalSubscribers: subscriberCount,
        totalLikes: likeCount
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, stats, "Channel stats fetched successfully")
        );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid or missing channel ID");
    }

    const videos = await Video.find({ owner: channelId });

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "Channel videos fetched successfully")
        );
});

export {
    getChannelStats,
    getChannelVideos
}
