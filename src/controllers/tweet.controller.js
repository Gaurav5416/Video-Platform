import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content?.trim() === "") {
    throw new ApiError(400, "content is required");
  }

  console.log("Ore wa subarashi");

  const tweet = await Tweet.create({
    owner: req.user._id,
    content: content,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet posted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "_id",
        foreignField: "owner",
        as: "tweets",
        pipeline: [
          {
            $project: {
              content: 1,
              createdAt: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        tweets: "$tweets",
      },
    },
    {
      $project: {
        username: 1,
        tweets: 1,
        createdAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  const tweetId = req.params.tweetId;

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(406, "Could not find the tweet");
  }

  if (tweet.owner.toString() !== req.user.id) {
    throw new ApiError(403, "Tweet not found");
  }

  tweet.content = newContent;
  await tweet.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;

  if (!tweetId) {
    throw new ApiError(405, "tweet is required");
  }

  let tweetData = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!tweetData) {
    throw new ApiError(404, "tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet delete successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
