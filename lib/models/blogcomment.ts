import mongoose, { Schema } from "mongoose";
import { BlogComment } from "../../types";

const blogCommentSchema = new Schema<BlogComment>(
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

const BlogCommentModel =
  mongoose.models.BlogComment ||
  mongoose.model<BlogComment>("BlogComment", blogCommentSchema);

export default BlogCommentModel;
