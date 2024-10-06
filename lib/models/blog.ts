import mongoose, { Schema } from "mongoose";
import { Blog } from "../../types";

const blogSchema = new Schema<Blog>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BlogModel =
  mongoose.models.Blog || mongoose.model<Blog>("Blog", blogSchema);

export default BlogModel;
