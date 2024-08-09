import mongoose, { Schema } from "mongoose";
import { Organization } from "../../types";


const organizationSchema = new Schema<Organization>({
    document: [
        {
            type: String,
            default: null,
        }
    ],
    employees:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
        },
    ],
    businessType: {
        type: String,
        required: true,
    },
    businessLocation: {
        type: String,
        required: true,
    },
    legalBusinessName: {
        type: String,
        required: true,
    },
    businessRegistrationNumber: {
        type: String,
        required: true,
    },
    businessName: {
        type: String,
        required: true,
    },
    businessAddress: {
        type: String,
        required: true,
    },
    businessPhone: {
        type: String,
        required: true,
    },
    industry: {
        type: String,
        required: true,
    },
    businessWebsite: {
        type: String,
    },
    businessProductDescription: {
        type: String,
        required: true,
    },
    bankAccountHolder: {
        type: String,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    bankAccountNumber: {
        type: String,
        required: true,
    },
    verify: {
        verified: {
            type: Boolean,
            default: false,
        },
        verifiedAt: {
            type: Date,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
        },
    },
}, {
    timestamps: true
})

const OrganizationModel = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);

export default OrganizationModel;