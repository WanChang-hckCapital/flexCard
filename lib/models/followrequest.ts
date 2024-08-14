import mongoose, { Schema } from "mongoose";
import { FollowRequest } from "../../types";

const followRequestSchema = new Schema<FollowRequest>(
  {
    // _id: {
    //   type: String,
    // },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    status: {
      type: Number,
    },
  },
  { timestamps: true }
);

const FollowRequestModel =
  mongoose.models.FollowRequest ||
  mongoose.model("FollowRequest", followRequestSchema);

export default FollowRequestModel;
