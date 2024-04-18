import mongoose, { Schema } from "mongoose";
import { Component } from "../../types";


const componentSchema = new Schema<Component>({
    ComponentID: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

const ComponentModel = mongoose.models.Component || mongoose.model("Component", componentSchema);

export default ComponentModel;