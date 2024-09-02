import mongoose, { Schema } from "mongoose";
import { Card } from "../../types";


const cardSchema = new Schema<Card>({
    cardID: {
        type: String,
        required: true,
        unique: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "PUBLIC",
    },
    description: String,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
        }
    ],
    categories: [
        {
            type: String,
        }
    ],
    components: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
    },
    lineFormatComponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
    },
    flexFormatHtml: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
    },
    totalViews: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
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
            profileId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Profile',
            },
            timestamp: {
                type: Date,
            }
        }
    ],
}, {
    timestamps: true
})

const CardMongodb = mongoose.models.Card || mongoose.model("Card", cardSchema);

export default CardMongodb;