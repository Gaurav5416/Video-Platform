import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(401, "Channel Id is not valid");
  }

  const channel = User.findById(channelId);

  if (!channel) {
    throw new ApiError(401, "Channel Does not exist");
  }

  const isSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (isSubscribed) {
    let unsubscribed = await Subscription.deleteOne({
      channel: channelId,
      subscriber: req.user._id,
    });

    if (!unsubscribed) {
      throw new ApiError(401, "Something went wrong while unsubscribing");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, unsubscribed, "Channel Unsubscribed Successfully")
      );
  }

  if (!isSubscribed) {
    let subscribed = await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });

    subscribed = await Subscription.findOne({
      channel: channelId,
      subscriber: req.user._id,
    });

    if (!subscribed) {
      throw new ApiError(401, "Something went wrong while subscribing");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribed, "Channel subscribed Successfully")
      );
  }
});
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(401, "Channel Id is not valid");
  }

  const channel = User.findById(channelId);

  if (!channel) {
    throw new ApiError(401, "Channel Does not exist");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    {
      $unwind: "$subscribers",
    },
    {
      $project: {
        fullname: "$subscribers.fullname",
        username: "$subscribers.username",
        avatar: "$subscribers.avatar",
      },
    },
  ]);

  if (!subscribers) {
    throw new ApiError(500, "something went wrong while fetching subscribers");
  }

  console.log(subscribers);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(401, "Channel Id is not valid");
  }

  const channel = User.findById(channelId);

  if (!channel) {
    throw new ApiError(401, "Channel Does not exist");
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
      },
    },
    {
      $unwind: "$channels",
    },
    {
      $project: {
        fullname: "$channels.fullname",
        username: "$channels.username",
        avatar: "$channels.avatar",
      },
    },
  ]);

  if (!channels) {
    throw new ApiError(500, "something went wrong while fetching subscribed channels");
  }

  console.log(channels);

  return res
    .status(200)
    .json(new ApiResponse(200, channels, "channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
