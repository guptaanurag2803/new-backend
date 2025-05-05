import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page, limit, query, sortBy, sortType, userId } = req.query;

    const matchStage = {};
    const andConditions = [];

    if (userId) {
        andConditions.push({ owner: new mongoose.Types.ObjectId(userId) });
    }

    if (query) {
        andConditions.push({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]
        });
    }

    if (andConditions.length > 0) {
        matchStage.$and = andConditions;
    }

    const pipeline = [
        {
            $match: matchStage
        }
    ];

    if (sortBy && sortType) {
        const sortOptions = {};
        sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
        pipeline.push({ $sort: sortOptions });
    }

    pipeline.push(
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    );

    const videos = await Video.aggregate(pipeline);

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found matching the criteria");
    }

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;


    if (!videoLocalPath) {
        throw new ApiError(400, "Video file path is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file path is required");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video?.url) {
        throw new ApiError(400, "Error uploading video to Cloudinary");
    }

    if (!thumbnail?.url) {
        throw new ApiError(400, "Error thumbnail to Cloudinary");
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        duration: video.duration,
        views: video.views,
        isPublished: true,
        owner: req.user._id
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, newVideo, "Video published successfully")
        )
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(401, "Video not found");
    }

    const video = await Video.findById(videoId)
        .select("videoFile thumbnail title description duration views owner");

    if (!video) {
        throw new ApiError(401, "Video does not exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully")
        )
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    if (!videoId) {
        throw new ApiError(404, "Video not found");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }


    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file path is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    video.title = title;
    video.description = description;
    video.thumbnail = thumbnail.url;
    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video updated successfully")
        )
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(404, "Video not found");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }

    await video.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video deleted successfully")
        );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "Video not found");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to toggle the publish status of this video.");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video updated successfully")
        )
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
