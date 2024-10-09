import mongoose, { Schema } from "mongoose";
import { ForumCommentReply } from "../../types";

const forumCommentReplySchema = new Schema<ForumCommentReply>(
  {
    content: {
      type: String,
      required: true,
    },
    forum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogComment",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ForumCommentReplyModel =
  mongoose.models.ForumCommentReply ||
  mongoose.model<ForumCommentReply>(
    "ForumCommentReply",
    forumCommentReplySchema
  );

export default ForumCommentReplyModel;
