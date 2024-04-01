import mongoose, { Schema } from "mongoose";
import { Member, Usertype } from "../../types";


const memberSchema = new Schema<Member>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    password: { type: String, default: null },
    phone: { type: String, default: null },
    shortdescription: { type: String, default: null },
    usertype: { type: String, default: Usertype.PERSONAL },
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
}, {
    timestamps: true
})

const Member = mongoose.models.Member || mongoose.model("Member", memberSchema);

export default Member;