"use client";

import { useState, useEffect, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MemberProfile from "@/components/forms/member-profile";
import { getFollowers } from "@/lib/actions/admin.actions";
import {
  Ban,
  Bell,
  BellOff,
  Lock,
  Palette,
  Star,
  User2,
  UsersRound,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  setActiveProfile,
  updateAccountType,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";
import CloseFriends from "@/components/root-settings/close-friends";
import Blocked from "@/components/root-settings/blocked";
import MutedAccount from "@/components/root-settings/muted-accounts";
import ProfileList from "@/components/root-settings/profile-list";
import AddProfileForm from "@/components/root-settings/add-profile-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ThemeToggle from "@/components/theme-toggle";
// import LanguageSwitcher from "@/components/language-switcher";

interface Props {
  authUserId: string;
  authActiveProfileId: string;
  profileData: any;
  profiles: any[];
  dict: any;
}

function RootSetting({
  authUserId,
  authActiveProfileId,
  profileData,
  profiles,
  dict,
}: Props) {
  const [activeSection, setActiveSection] = useState("edit-profile");
  const [lineOAFollowers, setLineOAFollowers] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(
    profileData.accountType === "PRIVATE"
  );

  const handleNavClick = (section: string) => {
    setActiveSection(section);
  };

  const handleTogglePrivacy = async () => {
    const newAccountType = isPrivate ? "PUBLIC" : "PRIVATE";
    setIsPrivate(!isPrivate);

    const response = await updateAccountType(
      authActiveProfileId,
      newAccountType
    );

    if (!response.success) {
      setIsPrivate(isPrivate);
      toast.error(response.message);
    } else {
      toast.success(response.message);
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
          {/* <p className="dark:text-slate-400 text-[12px]">
            {dict.userSettingsLeftBar.themeSection}
          </p> */}
          <p className="dark:text-slate-400 text-[12px]">Theme</p>
          {/* <a
            onClick={() => handleNavClick("theme")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "theme"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <Palette className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.theme}
          </a> */}
          <a
            onClick={() => handleNavClick("theme")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "theme"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <Palette className="mr-2 w-5 h-5" />
            {/* {dict.userSettingsLeftBar.theme} */}
            Theme
          </a>
          <a
            onClick={() => handleNavClick("edit-profile")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "edit-profile" ? "bg-light-3 text-primary" : ""
            }`}
          >
            <User2 className="mr-2 w-5 h-5" />
            Edit profile
          </a>
          <a
            onClick={() => handleNavClick("manage-account")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "manage-account"
                ? "bg-light-3 text-primary"
                : ""
            }`}
          >
            <UsersRound className="mr-2 w-5 h-5" />
            Manage account
          </a>
          <a
            onClick={() => handleNavClick("notifications")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "notifications" ? "bg-light-3 text-primary" : ""
            }`}
          >
            <Bell className="mr-2 w-5 h-5" />
            Notifications
          </a>
          <p className="text-slate-400 text-[12px] mt-6">
            Who can view your bubble
          </p>
          <a
            onClick={() => handleNavClick("accounts-privacy")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "accounts-privacy"
                ? "bg-light-3 text-primary"
                : ""
            }`}
          >
            <Lock className="mr-2 w-5 h-5" />
            Accounts privacy
          </a>
          <a
            onClick={() => handleNavClick("close-friends")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "close-friends" ? "bg-light-3 text-primary" : ""
            }`}
          >
            <Star className="mr-2 w-5 h-5" />
            Close friends
          </a>
          <a
            onClick={() => handleNavClick("blocked")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "blocked" ? "bg-light-3 text-primary" : ""
            }`}
          >
            <Ban className="mr-2 w-5 h-5" />
            Blocked
          </a>
          <p className="text-slate-400 text-[12px] mt-6">
            Who&apos;s bubble you wanted to view
          </p>
          <a
            onClick={() => handleNavClick("muted-accounts")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "muted-accounts"
                ? "bg-light-3 text-primary"
                : ""
            }`}
          >
            <BellOff className="mr-2 w-5 h-5" />
            Muted Friends
          </a>
        </nav>
      </aside>

      <main className="py-6 w-[60%] mx-auto">
        <div className="grid gap-6">
          {activeSection === "theme" && (
            <Card>
              <CardHeader>
                {/* <CardTitle>{dict.userSettings.theme.title}</CardTitle> */}
                <CardTitle>Title</CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeToggle dict={dict} />
                {/* <LanguageSwitcher /> */}
              </CardContent>
            </Card>
          )}
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
          {activeSection === "manage-account" && (
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Manage Account</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileList
                  profiles={profiles}
                  authActiveProfileId={authActiveProfileId}
                  authUserId={authUserId}
                />
              </CardContent>
            </Card>
          )}
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
                      <Switch
                        checked={isPrivate}
                        onCheckedChange={handleTogglePrivacy}
                      />
                    </div>
                  </div>
                  <p className="text-slate-300 text-[12px]">
                    When your account is public, your profile and bubbles can be
                    seen by anyone, on or off flexCard, even if they don&apos;t
                    have an flexCard account.
                  </p>
                  <br />
                  <p className="text-slate-300 text-[12px]">
                    When your account is private, only the followers you approve
                    can see what you share, and your followers and following
                    lists.
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
