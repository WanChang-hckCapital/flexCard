"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CircleUser } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import AddProfileForm from "./add-profile-form";
import { deleteProfileById, setCurrentActiveProfileById } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import AddEntrepreneurForm from "./add-entrepreneur-form";
import SignupOrganizationForm from "../forms/signup-organization-form";

interface ProfileListProps {
    profiles: any[];
    authActiveProfileId: string;
    authUserId: string;
}

const USER_TYPES = ["PERSONAL", "ORGANIZATION", "ENTREPRENEUR"];

const ProfileList: React.FC<ProfileListProps> = ({
    profiles,
    authActiveProfileId,
    authUserId,
}) => {
    const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [profileToDelete, setProfileToDelete] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        console.log("Profiles data:", profiles);
    }, [profiles]);

    const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.usertype] = profile;
        return acc;
    }, {});

    const handleSetActiveProfileClick = async (profileId: string) => {
        try {
            setIsLoading(true);
            await setCurrentActiveProfileById(authUserId, profileId);
            toast.success("Profile activated successfully!");
        } catch (error: any) {
            toast.error(`Failed to activate profile: ${error.message}`);
        } finally {
            setIsLoading(false);
            window.location.reload();
        }
    };

    const handleEditProfileClick = (profile: any) => {
        if (profile.usertype === "PERSONAL") {
            window.location.reload();
        } else {
            setSelectedProfile(profile);
        }
    };

    const handleDeleteProfileClick = (profile: any) => {
        setProfileToDelete(profile);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteProfile = async () => {
        try {
            setIsLoading(true);
            const response = await deleteProfileById(profileToDelete._id, authUserId);
            if (response.success) {
                toast.success("Profile deleted successfully!");
                window.location.reload();
            } else {
                toast.error(`Failed to delete profile: ${response.message}`);
            }
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Profiles</h3>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {USER_TYPES.map((userType) => {
                    const profile = profileMap[userType];

                    const isActiveProfile = profile?._id === authActiveProfileId;

                    return (
                        <li key={userType}>
                            <Card
                                className={`p-4 shadow-md ${isActiveProfile ? "border border-primary" : "border border-neutral-500"
                                    }`}
                            >
                                <CardHeader className="flex flex-col items-center">
                                    {profile ? (
                                        profile.image?.[0]?.binaryCode ? (
                                            <Image
                                                src={profile.image?.[0]?.binaryCode}
                                                alt={profile.accountname || "Profile Image"}
                                                width={96}
                                                height={96}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <CircleUser className="w-24 h-24" />
                                        )
                                    ) : (
                                        <CircleUser className="w-24 h-24 text-neutral-500" />
                                    )}
                                    <CardTitle className="!mt-5">
                                        {profile ? profile.accountname || "Unnamed Profile" : "Waiting to be activated"}
                                        <p className="text-[12px] text-neutral-500 mt-2">{userType}</p>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center p-0">
                                    {profile ? (
                                        <div className="flex justify-center space-x-2">
                                            <Button
                                                variant="green"
                                                onClick={() => handleSetActiveProfileClick(profile._id)}
                                                disabled={isLoading || isActiveProfile}
                                            >
                                                {isActiveProfile ? "Active" : isLoading ? "Activating..." : "Activate"}
                                            </Button>

                                            <Button
                                                variant="sky"
                                                onClick={() => handleEditProfileClick(profile)}
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDeleteProfileClick(profile)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    ) : (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="purple"
                                                    onClick={() => setSelectedUserType(userType)}
                                                >
                                                    <p className="text-[14px]">{userType}</p>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent
                                                className={`${userType === "PERSONAL" ? "max-w-[70%]" : "max-w-[80%]"
                                                    } max-h-[80%] overflow-y-scroll`}
                                            >
                                                <DialogHeader>
                                                    <DialogTitle>Creating {userType} Profile</DialogTitle>
                                                </DialogHeader>
                                                <CardContent>
                                                    {userType === "PERSONAL" && (
                                                        <AddProfileForm userId={authActiveProfileId} />
                                                    )}
                                                    {userType === "ORGANIZATION" && (
                                                        <AddEntrepreneurForm authActiveProfileId={authActiveProfileId} />
                                                    )}
                                                    {userType === "ENTREPRENEUR" && (
                                                        <AddEntrepreneurForm authActiveProfileId={authActiveProfileId} />
                                                    )}
                                                </CardContent>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardContent>
                            </Card>
                        </li>
                    );
                })}
            </ul>

            {selectedProfile && (selectedProfile.usertype === "ORGANIZATION" || selectedProfile.usertype === "ENTREPRENEUR") && (
                <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
                    <DialogContent className="max-w-[70%] max-h-[80%] overflow-y-scroll">
                        <DialogHeader>
                            <DialogTitle>Edit {selectedProfile.usertype} Profile</DialogTitle>
                        </DialogHeader>
                        <CardContent>
                            <SignupOrganizationForm
                                authActiveProfileId={selectedProfile._id}
                                organization={selectedProfile.organization}
                                isEditMode={true}
                            />
                        </CardContent>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-[30%]">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <CardContent className="pt-6 pb-0">
                        <p className="text-center">Are you sure you want to delete this profile? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDeleteProfile}
                                disabled={isLoading}
                            >
                                {isLoading ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </CardContent>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfileList;
