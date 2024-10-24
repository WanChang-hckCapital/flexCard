import { LineUser } from "@/types";
import mongoose, { Schema } from "mongoose";

const lineUserSchema = new Schema<LineUser>(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LineUserModel =
  mongoose.models.LineUser || mongoose.model("LineUser", lineUserSchema);

export default LineUserModel;
