import mongoose, { Schema } from "mongoose";
import { Member, Role, Usertype } from "../../types";


const memberSchema = new Schema<Member>({
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
    accountType: {
        type: String,
        default: "PUBLIC",
    },
    role: { type: String, default: Role.PERSONAL },
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
    closeFriends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
        },
    ],
    blockedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
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
                default: Date.now
            },
        }
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
        default: null
    },
    offers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offer",
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
                default: Date.now
            },
        }
    ],
    updateHistory: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Member',
            },
            timestamp: {
                type: Date,
            }
        }
    ],
    lastlogin: {
        type: Date,
    }
}, {
    timestamps: true
})

const MemberModel = mongoose.models.Member || mongoose.model("Member", memberSchema);

export default MemberModel;