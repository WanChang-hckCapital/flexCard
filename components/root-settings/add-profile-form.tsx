"use client"

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
    dict: any;
}

const AddProfileForm: React.FC<AddProfileFormProps> = ({ userId, profile, dict }) => {
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
                {profile ? dict.newProfile.title.edit : dict.newProfile.title.add}
            </h3>
            <NewMemberProfile
                profile={initialProfileData}
                btnTitle={profile ? dict.newProfile.title.update : dict.newProfile.title.add}
                dict={dict}
            />
        </div>
    );
};

export default AddProfileForm;
