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
    image: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    phone: { type: String, default: null },
    shortdescription: { type: String, default: null },
    usertype: { type: String, default: Usertype.PERSONAL },
    onboarded: {
        type: Boolean,
        default: false,
    },
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
}, {
    timestamps: true
})

const Member = mongoose.models.Member || mongoose.model("Member", memberSchema);

export default Member;