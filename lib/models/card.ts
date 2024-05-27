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
        ref: 'Member',
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
            ref: "Member",
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
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
    dailyViews: [
        {
            date: Date,
            count: {
                type: Number,
                default: 0
            }
        }
    ],
}, {
    timestamps: true
})

const CardMongodb = mongoose.models.Card || mongoose.model("Card", cardSchema);

export default CardMongodb;