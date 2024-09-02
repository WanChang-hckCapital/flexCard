import mongoose, { Schema } from "mongoose";
import { Chatroom } from "../../types";

const chatroomSchema = new Schema<Chatroom>(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ChatroomModel =
  mongoose.models.Chatroom || mongoose.model("Chatroom", chatroomSchema);

export default ChatroomModel;
