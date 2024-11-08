"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CircleUser, Pencil } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import AddProfileForm from "./add-profile-form";
import {
  deleteProfileById,
  setCurrentActiveProfileById,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";
import AddEntrepreneurForm from "./add-entrepreneur-form";
import SignupOrganizationForm from "../forms/signup-organization-form";
import MemberProfile from "../forms/member-profile";

interface ProfileListProps {
  profile: any;
  profiles: any[];
  authActiveProfileId: string;
  authUserId: string;
  dict: any;
}

const USER_TYPES = ["PERSONAL", "ORGANIZATION", "ENTREPRENEUR"];

const ProfileList: React.FC<ProfileListProps> = ({
  profile,
  profiles,
  authActiveProfileId,
  authUserId,
  dict,
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
      toast.success(dict.userSettings.account.toast.activeSuccess);
    } catch (error: any) {
      toast.error(`${dict.userSettings.account.toast.activeFailed} ${error.message}`);
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
        toast.success(dict.userSettings.account.toast.deleteSuccess);
        window.location.reload();
      } else {
        toast.error(`${dict.userSettings.account.toast.deleteFailed} ${response.message}`);
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
      <h3 className="text-lg font-semibold mb-4">
        <div className="flex justify-between">
          <div>{dict.userSettings.account.subTitle}</div>
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="purple" className="ml-2">
                  {dict.userSettings.profile.title}
                  <Pencil className="w-4 h-4 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[70%] max-h-[80%] overflow-y-scroll">
                <DialogHeader>
                  <DialogTitle>{dict.userSettings.profile.title}</DialogTitle>
                </DialogHeader>
                <Card className="pt-8">
                  <CardContent>
                    <MemberProfile
                      profile={profile}
                      btnTitle={dict.userSettings.profile.btnContinue}
                      dict={dict}
                    />
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </h3>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {USER_TYPES.map((userType) => {
          const profile = profileMap[userType];

          const isActiveProfile = profile?._id === authActiveProfileId;

          return (
            <li key={userType}>
              <Card
                className={`p-4 shadow-md ${
                  isActiveProfile
                    ? "border border-primary"
                    : "border dark:border-neutral-500 border-neutral-300"
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
                        className="rounded-full object-cover h-24 w-24"
                      />
                    ) : (
                      <CircleUser className="w-24 h-24" />
                    )
                  ) : (
                    <CircleUser className="w-24 h-24 text-neutral-500" />
                  )}
                  <CardTitle className="!mt-5 text-center">
                    {profile
                      ? profile.accountname || dict.userSettings.account.unnamedProfile
                      : dict.userSettings.account.waitingDesc}
                    <p className="text-[12px] text-neutral-500 mt-2">
                      {userType}
                    </p>
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
                        {isActiveProfile
                          ? dict.userSettings.account.btnActive
                          : isLoading
                          ? dict.userSettings.account.activating
                          : dict.userSettings.account.activated}
                      </Button>

                      <Button
                        variant="sky"
                        onClick={() => handleEditProfileClick(profile)}
                      >
                        {dict.userSettings.account.btnEdit}
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteProfileClick(profile)}
                      >
                        {dict.userSettings.account.btnDelete}
                      </Button>
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="purple"
                          onClick={() => setSelectedUserType(userType)}
                        >
                          <p className="text-[14px]">
                            {dict.userSettings.account.usertype[userType]}
                          </p>
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className={`${
                          userType === "PERSONAL"
                            ? "max-w-[70%]"
                            : "max-w-[80%]"
                        } max-h-[80%] overflow-y-scroll`}
                      >
                        <DialogHeader>
                          <DialogTitle>
                            {dict.userSettings.account.dialogTitle[userType]}
                          </DialogTitle>
                        </DialogHeader>
                        <CardContent>
                          {userType === "PERSONAL" && (
                            <AddProfileForm
                              userId={authActiveProfileId}
                              dict={dict}
                            />
                          )}
                          {userType === "ORGANIZATION" && (
                            <AddEntrepreneurForm
                              authActiveProfileId={authActiveProfileId}
                              dict={dict}
                            />
                          )}
                          {userType === "ENTREPRENEUR" && (
                            <AddEntrepreneurForm
                              authActiveProfileId={authActiveProfileId}
                              dict={dict}
                            />
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

      {selectedProfile &&
        (selectedProfile.usertype === "ORGANIZATION" ||
          selectedProfile.usertype === "ENTREPRENEUR") && (
          <Dialog
            open={!!selectedProfile}
            onOpenChange={() => setSelectedProfile(null)}
          >
            <DialogContent className="max-w-[70%] max-h-[80%] overflow-y-scroll">
              <DialogHeader>
                <DialogTitle>
                  {
                    dict.userSettings.account.editDialogTitle[
                      selectedProfile.usertype
                    ]
                  }
                </DialogTitle>
              </DialogHeader>
              <CardContent>
                <SignupOrganizationForm
                  authActiveProfileId={selectedProfile._id}
                  organization={selectedProfile.organization}
                  isEditMode={true}
                  dict={dict}
                />
              </CardContent>
            </DialogContent>
          </Dialog>
        )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[30%]">
          <DialogHeader>
            <DialogTitle>
              {dict.userSettings.account.dialog.confirmDeleteTitle}
            </DialogTitle>
          </DialogHeader>
          <CardContent className="pt-6 pb-0">
            <p className="text-center">
              {dict.userSettings.account.dialog.confirmDeleteDesc}
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {dict.userSettings.account.dialog.btnCancel}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteProfile}
                disabled={isLoading}
              >
                {isLoading ? dict.userSettings.account.toast.deleting : dict.userSettings.account.toast.delete}
              </Button>
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileList;
