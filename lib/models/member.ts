import mongoose, { Schema } from "mongoose";
import { Member, Role, Usertype } from "../../types";


const memberSchema = new Schema<Member>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    generatedId: {
      type: String,
    },
    email: { type: String, default: null },
    password: { type: String, default: null },
    phone: { type: String, default: null },
    ip_address: { type: String, default: null },
    country: { type: String, default: null },
    countrycode: { type: String, default: null },
    profiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      }
    ],
    activeProfile: { type: Number, default: 0 },
    lastlogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

const MemberModel = mongoose.models.Member || mongoose.model("Member", memberSchema);

export default MemberModel;
