import mongoose, { Schema } from "mongoose";
import { BlogCommentReply } from "../../types";

const blogCommentReplySchema = new Schema<BlogCommentReply>(
  {
    content: {
      type: String,
      required: true,
    },
    blog: {
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

const BlogCommentReplyModel =
  mongoose.models.BlogCommentReply ||
  mongoose.model<BlogCommentReply>("BlogCommentReply", blogCommentReplySchema);

export default BlogCommentReplyModel;
