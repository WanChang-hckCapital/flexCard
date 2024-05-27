import mongoose, { Schema } from "mongoose";
import { Member, Usertype } from "../../types";


const memberSchema = new Schema<Member>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
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
    subscription: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcription",
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
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
        default: null
    },
    lastlogin: {
        type: Date,
    }
}, {
    timestamps: true
})

const MemberModel = mongoose.models.Member || mongoose.model("Member", memberSchema);

export default MemberModel;