"use client";

import { useState, useEffect, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MemberProfile from "@/components/forms/member-profile";
import { getFollowers } from "@/lib/actions/admin.actions";
import { Ban, Bell, BellOff, Lock, Star, User2, UsersRound } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { addNewProfile, deleteProfile, editProfile, setActiveProfile, updateAccountType } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import CloseFriends from "@/components/root-settings/close-friends";
import Blocked from "@/components/root-settings/blocked";
import MutedAccount from "@/components/root-settings/muted-accounts";

interface Props {
    authActiveProfileId: string;
    profileData: any;
}

function RootSetting({ authActiveProfileId, profileData }: Props) {
    const [activeSection, setActiveSection] = useState("edit-profile");
    const [lineOAFollowers, setLineOAFollowers] = useState<string[]>([]);
    const [isPrivate, setIsPrivate] = useState(profileData.accountType === "PRIVATE");
    const [profiles, setProfiles] = useState(profileData.profiles || []);
    const [newProfileData, setNewProfileData] = useState(profiles);

    const handleNavClick = (section: string) => {
        setActiveSection(section);
    };

    const handleTogglePrivacy = async () => {
        const newAccountType = isPrivate ? "PUBLIC" : "PRIVATE";
        setIsPrivate(!isPrivate);

        const response = await updateAccountType(authActiveProfileId, newAccountType);

        if (!response.success) {
            setIsPrivate(isPrivate);
            toast.error(response.message);
        } else {
            toast.success(response.message);
        }
    };

    const handleAddProfile = async () => {
        const response = await addNewProfile(authActiveProfileId, newProfileData);
        if (response.success) {
            setProfiles([...profiles, response.profile]);
            setNewProfileData({});
            toast.success("Profile added successfully!");
        } else {
            toast.error("Failed to add profile");
        }
    };

    const handleDeleteProfile = async (profileId: string) => {
        const response = await deleteProfile(authActiveProfileId, profileId);
        if (response.success) {
            setProfiles(profiles.filter((profile: any) => profile._id !== profileId));
            toast.success("Profile deleted successfully!");
        } else {
            toast.error("Failed to delete profile");
        }
    };

    const handleSetActiveProfile = async (index: number) => {
        const response = await setActiveProfile(authActiveProfileId, index);
        if (response.success) {
            toast.success("Active profile set successfully!");
        } else {
            toast.error("Failed to set active profile");
        }
    };

    const handleEditProfile = async (profileId: string, updatedData: any) => {
        const response = await editProfile(profileId, updatedData);
        if (response.success) {
            setProfiles(profiles.map((profile: any) => (profile._id === profileId ? response.profile : profile)));
            toast.success("Profile updated successfully!");
        } else {
            toast.error("Failed to update profile");
        }
    };

    useEffect(() => {
        const fetchFollowers = async () => {
            const response = await getFollowers();
            if (response.success === true && response.followers !== undefined) {
                setLineOAFollowers(response.followers);
            }
        };

        fetchFollowers();
    }, []);

    return (
        <div className="flex min-h-screen bg-neutral-900 w-full">
            <aside className="w-64 bg-black p-6">
                <div className="text-light-2 mb-10">
                    <h2 className="text-xl font-semibold">Settings</h2>
                </div>
                <nav className="space-y-4">
                    <p className="text-slate-400 text-[12px]">Account</p>
                    <a
                        onClick={() => handleNavClick("edit-profile")}
                        className={`flex p-3 rounded-lg items-center cursor-pointer ${activeSection === "edit-profile" ? "bg-light-3 text-primary" : ""
                            }`}
                    >
                        <User2 className="mr-2 w-5 h-5" />
                        Edit profile
                    </a>
                    <a
                        onClick={() => handleNavClick("manage-account")}
                        className={`flex p-3 rounded-lg items-center cursor-pointer ${activeSection === "manage-account" ? "bg-light-3 text-primary" : ""
                            }`}
                    >
                        <UsersRound className="mr-2 w-5 h-5" />
                        Manage account
                    </a>
                    <a
                        onClick={() => handleNavClick("notifications")}
                        className={`flex p-3 rounded-lg items-center cursor-pointer ${activeSection === "notifications" ? "bg-light-3 text-primary" : ""
                            }`}
                    >
                        <Bell className="mr-2 w-5 h-5" />
                        Notifications
                    </a>
                    <p className="text-slate-400 text-[12px] mt-6">Who can view your bubble</p>
                    <a
                        onClick={() => handleNavClick("accounts-privacy")}
                        className={`flex p-3 rounded-lg items-center cursor-pointer ${activeSection === "accounts-privacy" ? "bg-light-3 text-primary" : ""
                            }`}
                    >
                        <Lock className="mr-2 w-5 h-5" />
                        Accounts privacy
                    </a>
                    <a
                        onClick={() => handleNavClick("close-friends")}
                        className={`flex p-3 rounded-lg items-center cursor-pointer ${activeSection === "close-friends" ? "bg-light-3 text-primary" : ""
                            }`}
                    >
                        <Star className="mr-2 w-5 h-5" />
                        Close friends
                    </a>
                    <a
                        onClick={() => handleNavClick("blocked")}
                        className={`flex p-3 rounded-lg items-center cursor-pointer ${activeSection === "blocked" ? "bg-light-3 text-primary" : ""
                            }`}
                    >
                        <Ban className="mr-2 w-5 h-5" />
                        Blocked
                    </a>
                    <p className="text-slate-400 text-[12px] mt-6">Who&apos;s bubble you wanted to view</p>
                    <a
                        onClick={() => handleNavClick("muted-accounts")}
                        className={`flex p-3 rounded-lg items-center cursor-pointer ${activeSection === "muted-accounts" ? "bg-light-3 text-primary" : ""
                            }`}
                    >
                        <BellOff className="mr-2 w-5 h-5" />
                        Muted Friends
                    </a>
                </nav>
            </aside>

            <main className="py-6 w-[60%] mx-auto">
                <div className="grid gap-6">
                    {activeSection === "edit-profile" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MemberProfile profile={profileData} btnTitle="Continue" />
                            </CardContent>
                        </Card>
                    )}
                    {/* {activeSection === "manage-account" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Account</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Profiles</h3>
                                    <ul className="space-y-4">
                                        {profiles.map((profile: any, index: number) => (
                                            <li key={profile._id} className="flex justify-between items-center">
                                                <span>{profile.accountname || `Profile ${index + 1}`}</span>
                                                <div className="space-x-2">
                                                    <button
                                                        className="text-sm bg-blue-500 text-white py-1 px-2 rounded"
                                                        onClick={() => handleSetActiveProfile(index)}
                                                    >
                                                        Set Active
                                                    </button>
                                                    <button
                                                        className="text-sm bg-green-500 text-white py-1 px-2 rounded"
                                                        onClick={() => handleEditProfile(profile._id, profile)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="text-sm bg-red-500 text-white py-1 px-2 rounded"
                                                        onClick={() => handleDeleteProfile(profile._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-2">Add New Profile</h3>
                                        <MemberProfile
                                            profile={newProfileData}
                                            btnTitle="Add Profile"
                                            onChange={(data: any) => setNewProfileData(data)}
                                            onSubmit={handleAddProfile}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )} */}
                    {activeSection === "notifications" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <h1>Notifications Settings</h1>
                                    <p>Manage your notification preferences.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeSection === "accounts-privacy" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Accounts Privacy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>

                                    <div className="mt-4 mb-6 flex items-center justify-between">
                                        <h1>{isPrivate ? "Private Account" : "Public Account"}</h1>
                                        <div className="items-center">
                                            <Switch checked={isPrivate} onCheckedChange={handleTogglePrivacy} />
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-[12px]">
                                        When your account is public, your profile and bubbles can be seen by anyone, on or off flexCard, even if they don&apos;t have an flexCard account.
                                    </p>
                                    <br />
                                    <p className="text-slate-300 text-[12px]">
                                        When your account is private, only the followers you approve can see what you share, and your followers and following lists.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeSection === "close-friends" && (
                        <CloseFriends authActiveProfileId={authActiveProfileId} />
                    )}
                    {activeSection === "blocked" && (
                        <Blocked authActiveProfileId={authActiveProfileId} />
                    )}
                    {activeSection === "muted-accounts" && (
                        <MutedAccount authActiveProfileId={authActiveProfileId} />
                    )}
                </div>
            </main>
        </div>
    );
}

export default RootSetting;
