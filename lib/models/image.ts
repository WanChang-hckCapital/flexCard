import mongoose, { Schema } from "mongoose";
import { UserImage } from "../../types";


const imageSchema = new Schema<UserImage>({
    binaryCode: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

const Image = mongoose.models.Image || mongoose.model("Image", imageSchema);

export default Image;