import mongoose, { Schema } from "mongoose";
import { ForumComment } from "../../types";

const forumCommentSchema = new Schema<ForumComment>(
  {
    content: {
      type: String,
      required: true,
    },
    forum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
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
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ForumCommentModel =
  mongoose.models.ForumComment ||
  mongoose.model<ForumComment>("ForumComment", forumCommentSchema);

export default ForumCommentModel;
