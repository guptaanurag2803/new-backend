import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(404, "Channel not found");
    }

    const alreadySubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    });

    let responseMessage, responseData;
    if (alreadySubscribed) {
        await alreadySubscribed.deleteOne();
        responseData = {};
        responseMessage = "Channel unsubscribed successfully.";
    }
    else {
        const newSubscription = await Subscription.create(
            {
                subscriber: req.user._id,
                channel: channelId
            }
        )
        responseData = newSubscription;
        responseMessage = "Channel subscribed successfully.";
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, responseData, responseMessage)
        )
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.find({ channel: channelId });
    if (subscribers.length === 0) {
        throw new ApiError(404, "No subscribers found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Subscribers fetched successfully.")
        )
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;


    if (!subscriberId) {
        throw new ApiError(404, "Subscriber not found");
    }

    const channels = await Subscription.find({ subscriber: subscriberId });
    if (channels.length === 0) {
        throw new ApiError(404, "No subscribed channels found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channels, "Subscribers fetched successfully.")
        )
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}