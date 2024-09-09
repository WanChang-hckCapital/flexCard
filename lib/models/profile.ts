import mongoose, { Schema } from "mongoose";
import { Profile, Role, Usertype } from "../../types";

const profileSchema = new Schema<Profile>(
    {
        accountname: { type: String, default: null },
        image: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Image",
                default: null,
            },
        ],
        shortdescription: { type: String, default: null },
        usertype: { type: String, default: Usertype.PERSONAL },
        accountType: { type: String, default: "PUBLIC" },
        role: { type: String, default: Role.PERSONAL },
        onboarded: { type: Boolean, default: false },
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
        closeFriends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Member",
            },
        ],
        blockedAccounts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Member",
            },
        ],
        mutedAccounts: [
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
        offers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Offer",
            },
        ],
        stripeCustomerId: { type: String, default: null },
        subscription: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subscription",
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
                profileId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Profile",
                },
                timestamp: {
                    type: Date,
                },
            },
        ],
    }
);

const ProfileModel = mongoose.models.Profile || mongoose.model("Profile", profileSchema);

export default ProfileModel;
