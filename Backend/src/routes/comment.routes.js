import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
    getTweetComments,
    addTweetComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Public route - anyone can view comments
router.route("/:videoId").get(getVideoComments);
router.route("/t/:tweetId").get(getTweetComments);

// Protected routes - require authentication
router.route("/:videoId").post(verifyJWT, addComment);
router.route("/t/:tweetId").post(verifyJWT, addTweetComment);
router.route("/c/:commentId").delete(verifyJWT, deleteComment).patch(verifyJWT, updateComment);

export default router