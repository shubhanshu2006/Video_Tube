import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notification.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // Toggle like on video - if already liked, remove the like; if not liked, add a like

  // Validate videoId
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  // Check if the user has already liked the video
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  // If like exists, remove it (unlike)
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
      );
  }

  // If like doesn't exist, create it (like)
  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!like) {
    throw new ApiError(500, "Failed to like video");
  }

  // Get video details to find owner and send notification
  const video = await Video.findById(videoId).select("owner title");
  if (video && video.owner.toString() !== req.user._id.toString()) {
    await createNotification({
      recipient: video.owner,
      sender: req.user._id,
      type: "like",
      video: videoId,
      message: `${req.user.fullName} liked your video "${video.title}"`,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // Toggle like on comment - if already liked, remove the like; if not liked, add a like

  // Validate commentId
  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Valid comment ID is required");
  }

  // Check if the user has already liked the comment
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  // If like exists, remove it (unlike)
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Comment unliked successfully")
      );
  }

  // If like doesn't exist, create it (like)
  const like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!like) {
    throw new ApiError(500, "Failed to like comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isLiked: true }, "Comment liked successfully")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  // Toggle like on tweet - if already liked, remove the like; if not liked, add a like

  // Validate tweetId
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Valid tweet ID is required");
  }

  // Check if the user has already liked the tweet
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  // If like exists, remove it (unlike)
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully")
      );
  }

  // If like doesn't exist, create it (like)
  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (!like) {
    throw new ApiError(500, "Failed to like tweet");
  }

  // Get tweet details to find owner and send notification
  const Tweet = mongoose.model("Tweet");
  const tweet = await Tweet.findById(tweetId).select("owner content");
  if (tweet && tweet.owner.toString() !== req.user._id.toString()) {
    const contentPreview = tweet.content.length > 50 
      ? tweet.content.substring(0, 50) + "..." 
      : tweet.content;
    await createNotification({
      recipient: tweet.owner,
      sender: req.user._id,
      type: "like",
      message: `${req.user.fullName} liked your community post: "${contentPreview}"`,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // Get all liked videos by the authenticated user

  // Aggregate pipeline to get all liked videos with details
  const likedVideos = await Like.aggregate([
    {
      // Match all likes by the user where video field exists
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true },
      },
    },
    {
      // Sort by most recently liked
      $sort: {
        createdAt: -1,
      },
    },
    {
      // Lookup to get video details
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            // Lookup to get owner details of the video
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$ownerDetails",
          },
          {
            $addFields: {
              owner: "$ownerDetails",
            },
          },
          {
            $project: {
              ownerDetails: 0,
            },
          },
        ],
      },
    },
    {
      // Unwind video details
      $unwind: "$videoDetails",
    },
    {
      // Replace root with video details and add liked date
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$videoDetails", { likedAt: "$createdAt" }],
        },
      },
    },
  ]);

  // Return the liked videos
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  const likes = await Like.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: { $first: "$user" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, likes, "Video likes fetched successfully"));
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getVideoLikes,
};
