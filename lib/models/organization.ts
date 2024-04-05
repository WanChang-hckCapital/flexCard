import mongoose, { Schema } from "mongoose";
import { Organization } from "../../types";


const organizationSchema = new Schema<Organization>({
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: true,
    },
    // need to define status future
    document: [
        {
            type: String,
            required: true,
        }
    ],
    webUrl: { type: String, default: null },
    employees:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
        },
    ],
}, {
    timestamps: true
})

const Organization = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);

export default Organization;