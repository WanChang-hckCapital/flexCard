import mongoose, { Schema } from "mongoose";
import { Member, Usertype } from "../../types";

const memberSchema = new Schema<Member>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    generatedId: {
      type: String,
    },
    accountname: { type: String, default: null },
    image: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
        default: null,
      },
    ],
    email: { type: String, default: null },
    password: { type: String, default: null },
    phone: { type: String, default: null },
    shortdescription: { type: String, default: null },
    usertype: { type: String, default: Usertype.PERSONAL },
    onboarded: {
      type: Boolean,
      default: false,
    },
    ip_address: { type: String, default: null },
    country: { type: String, default: null },
    countrycode: { type: String, default: null },
    stripeCustomerId: { type: String, default: null },
    subscription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
      },
    ],
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
    followers: [
      {
        followersId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
        },
        followedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    trial: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trial",
      },
    ],
    totalViews: {
      type: Number,
      default: 0,
    },
    viewDetails: [
      {
        viewerId: {
          type: String,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    updateHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
        },
        timestamp: {
          type: Date,
        },
      },
    ],
    lastlogin: {
      type: Date,
    },
    accountType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MemberModel =
  mongoose.models.Member || mongoose.model("Member", memberSchema);

export default MemberModel;
