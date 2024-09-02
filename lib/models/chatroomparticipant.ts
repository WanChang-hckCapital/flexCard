import mongoose, { Schema } from "mongoose";
import { ChatroomParticipants } from "../../types";

const participantSchema = new Schema<ChatroomParticipants>(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    chatroomID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatroom",
    },
    role: {
      type: String,
      default: "member",
    },
  },
  {
    timestamps: true,
  }
);

const ChatroomParticipantsModel =
  mongoose.models.ChatroomParticipants ||
  mongoose.model("ChatroomParticipants", participantSchema);

export default ChatroomParticipantsModel;
