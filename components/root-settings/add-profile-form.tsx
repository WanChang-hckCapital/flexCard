import React from "react";
import NewMemberProfile from "../forms/new-member-profile";

interface AddProfileFormProps {
    userId: string;
    profile?: {
        userId: string;
        accountname: string;
        image: string;
        email: string;
        phone: string;
        shortdescription: string;
    };
}

const AddProfileForm: React.FC<AddProfileFormProps> = ({ userId, profile }) => {
    const initialProfileData = {
        userId: userId,
        accountname: profile?.accountname || "",
        image: profile?.image || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        shortdescription: profile?.shortdescription || "",
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
                {profile ? "Edit Profile" : "Add New Profile"}
            </h3>
            <NewMemberProfile
                profile={initialProfileData}
                btnTitle={profile ? "Update Profile" : "Add Profile"}
            />
        </div>
    );
};

export default AddProfileForm;
