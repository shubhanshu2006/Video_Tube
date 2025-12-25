import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notification.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // Get all comments for a video with pagination
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate videoId
  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  // Convert page and limit to numbers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Create aggregation pipeline to get comments with owner details
  const aggregateQuery = Comment.aggregate([
    {
      // Match comments for the specific video
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      // Sort comments by creation date (newest first)
      $sort: {
        createdAt: -1,
      },
    },
    {
      // Lookup to get owner details
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            // Only select required fields from user
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
      // Unwind owner details
      $unwind: "$ownerDetails",
    },
    {
      // Lookup to count likes on each comment
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      // Add computed fields
      $addFields: {
        likesCount: { $size: "$likes" },
        owner: "$ownerDetails",
      },
    },
    {
      // Remove unnecessary fields
      $project: {
        likes: 0,
        ownerDetails: 0,
      },
    },
  ]);

  // Apply pagination using mongoose-aggregate-paginate-v2
  const options = {
    page: pageNum,
    limit: limitNum,
  };

  const comments = await Comment.aggregatePaginate(aggregateQuery, options);

  // Return the comments with pagination info
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // Add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  // Validate videoId
  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video ID is required");
  }

  // Validate content
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  // Create the comment
  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to add comment");
  }

  // Get video details to find owner and send notification
  const video = await Video.findById(videoId).select("owner title");
  if (video && video.owner.toString() !== req.user._id.toString()) {
    await createNotification({
      recipient: video.owner,
      sender: req.user._id,
      type: "comment",
      video: videoId,
      comment: comment._id,
      message: `${req.user.fullName} commented on your video "${video.title}"`,
    });
  }

  // Fetch the comment with owner details
  const createdComment = await Comment.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(comment._id),
      },
    },
    {
      // Lookup to get owner details
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
  ]);

  // Return the created comment
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdComment[0], "Comment added successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // Update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  // Validate commentId
  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Valid comment ID is required");
  }

  // Validate content
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  // Find the comment
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if the user is the owner of the comment
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  // Update the comment
  comment.content = content.trim();
  await comment.save();

  // Return the updated comment
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // Delete a comment
  const { commentId } = req.params;

  // Validate commentId
  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Valid comment ID is required");
  }

  // Find the comment
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if the user is the owner of the comment
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  // Delete the comment
  await Comment.findByIdAndDelete(commentId);

  // Also delete all likes on this comment
  await Like.deleteMany({ comment: commentId });

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

const getTweetComments = asyncHandler(async (req, res) => {
  // Get all comments for a tweet with pagination
  const { tweetId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate tweetId
  if (!tweetId || !mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Valid tweet ID is required");
  }

  // Convert page and limit to numbers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Create aggregation pipeline to get comments with owner details
  const aggregateQuery = Comment.aggregate([
    {
      // Match comments for the specific tweet
      $match: {
        tweet: new mongoose.Types.ObjectId(tweetId),
      },
    },
    {
      // Sort comments by creation date (newest first)
      $sort: {
        createdAt: -1,
      },
    },
    {
      // Lookup to get owner details
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            // Only select required fields from user
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
      // Unwind owner details
      $unwind: "$ownerDetails",
    },
    {
      // Lookup to count likes on each comment
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      // Add computed fields
      $addFields: {
        likesCount: { $size: "$likes" },
        owner: "$ownerDetails",
      },
    },
    {
      // Remove unnecessary fields
      $project: {
        likes: 0,
        ownerDetails: 0,
      },
    },
  ]);

  // Apply pagination using mongoose-aggregate-paginate-v2
  const options = {
    page: pageNum,
    limit: limitNum,
  };

  const comments = await Comment.aggregatePaginate(aggregateQuery, options);

  // Return the comments with pagination info
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Tweet comments fetched successfully"));
});

const addTweetComment = asyncHandler(async (req, res) => {
  // Add a comment to a tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  // Validate tweetId
  if (!tweetId || !mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Valid tweet ID is required");
  }

  // Validate content
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  // Create the comment
  const comment = await Comment.create({
    content: content.trim(),
    tweet: tweetId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to add comment");
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
      type: "comment",
      comment: comment._id,
      message: `${req.user.fullName} commented on your community post: "${contentPreview}"`,
    });
  }

  // Fetch the comment with owner details
  const createdComment = await Comment.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(comment._id),
      },
    },
    {
      // Lookup to get owner details
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
        likesCount: 0,
      },
    },
    {
      $project: {
        ownerDetails: 0,
      },
    },
  ]);

  // Return the created comment
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdComment[0], "Comment added successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment, getTweetComments, addTweetComment };
