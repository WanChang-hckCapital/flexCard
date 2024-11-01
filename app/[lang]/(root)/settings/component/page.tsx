"use client";

import { useState, useEffect, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MemberProfile from "@/components/forms/member-profile";
import { getFollowers } from "@/lib/actions/admin.actions";
import {
  Activity,
  Ban,
  Bell,
  BellOff,
  HeartHandshake,
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
import ThemeToggle from "@/components/theme-toogle";
import LanguageSwitcher from "@/components/language-switcher";
import PreferencesComponent from "@/components/root-settings/preferences";
import TermsConditions from "@/components/root-settings/terms-conditions";

interface Props {
  authUserId: string;
  authActiveProfileId: string;
  profileData: any;
  profiles: any[];
  dict: any;
}

const categories = [
  {
    label: "Entertainment",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Daily Life",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Comedy",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Pets",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Learning",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Foods",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Sports",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Telent Show",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Fashion",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Car",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Drama",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "DIY Life Tricks",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Family",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Healthcare",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Art & Design",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Dance",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Stress Relif",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Outdoor Sports",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
  {
    label: "Furniture & Garden",
    imageUrl:
      "https://i.pinimg.com/enabled_lo/564x/99/49/bc/9949bc1d81fc89fb31f930f2cc826475.jpg",
  },
];

function RootSetting({
  authUserId,
  authActiveProfileId,
  profileData,
  profiles,
  dict,
}: Props) {
  const [activeSection, setActiveSection] = useState("manage-account");
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
    <div className="flex h-[94vh] dark:bg-neutral-900 w-full overflow-hidden">
      <aside className="w-64 dark:bg-black border-r-2 p-6 overflow-y-auto">
        <div className="dark:text-light-2 mb-10">
          <h2 className="text-xl font-semibold">
            {dict.userSettingsLeftBar.title}
          </h2>
        </div>
        <nav className="space-y-4">
          <p className="dark:text-slate-400 text-[12px]">
            {dict.userSettingsLeftBar.accountSection}
          </p>
          <a
            onClick={() => handleNavClick("manage-account")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "manage-account"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <UsersRound className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.account}
          </a>
          <a
            onClick={() => handleNavClick("notifications")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "notifications"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <Bell className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.notification}
          </a>
          <p className="dark:text-slate-400 text-[12px] mt-6">
            {dict.userSettingsLeftBar.privacySection}
          </p>
          <a
            onClick={() => handleNavClick("accounts-privacy")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "accounts-privacy"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <Lock className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.privacy}
          </a>
          <a
            onClick={() => handleNavClick("close-friends")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "close-friends"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <Star className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.closeFriends}
          </a>
          <a
            onClick={() => handleNavClick("blocked")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "blocked"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <Ban className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.blockedUsers}
          </a>
          <p className="dark:text-slate-400 text-[12px] mt-6">
            {dict.userSettingsLeftBar.notificationSection}
          </p>
          <a
            onClick={() => handleNavClick("muted-accounts")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "muted-accounts"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <BellOff className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.mutedUsers}
          </a>
          <p className="dark:text-slate-400 text-[12px]">
            {dict.userSettingsLeftBar.themeSection}
          </p>
          <a
            onClick={() => handleNavClick("theme")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "theme"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <Palette className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.theme}
          </a>
          <a
            onClick={() => handleNavClick("preferences")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "preferences"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <Activity className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.preferences}
          </a>
          <p className="dark:text-slate-400 text-[12px]">
            {dict.userSettingsLeftBar.termsConditionSection}
          </p>
          <a
            onClick={() => handleNavClick("terms")}
            className={`flex p-3 rounded-lg items-center cursor-pointer ${
              activeSection === "terms"
                ? "dark:bg-light-3 dark:text-primary bg-stone-400 text-white"
                : ""
            }`}
          >
            <HeartHandshake className="mr-2 w-5 h-5" />
            {dict.userSettingsLeftBar.termsCondition}
          </a>
        </nav>
      </aside>

      <main
        className={`py-6 mx-auto transition-all duration-300`}
        style={{ width: activeSection === "terms" ? "70%" : "60%" }}
      >
        <div className="grid gap-6">
          {activeSection === "manage-account" && (
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{dict.userSettings.account.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileList
                  profile={profileData}
                  profiles={profiles}
                  authActiveProfileId={authActiveProfileId}
                  authUserId={authUserId}
                  dict={dict}
                />
              </CardContent>
            </Card>
          )}
          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>{dict.userSettings.notification.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h1>{dict.userSettings.notification.subTitle}</h1>
                  <p>{dict.userSettings.notification.description}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeSection === "accounts-privacy" && (
            <Card>
              <CardHeader>
                <CardTitle>{dict.userSettings.privacy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="mt-4 mb-6 flex items-center justify-between">
                    <h1>
                      {isPrivate
                        ? dict.userSettings.privacy.private
                        : dict.userSettings.privacy.public}
                    </h1>
                    <div className="items-center">
                      <Switch
                        checked={isPrivate}
                        onCheckedChange={handleTogglePrivacy}
                      />
                    </div>
                  </div>
                  <p className="dark:text-slate-300 text-[12px]">
                    {dict.userSettings.privacy.description}
                  </p>
                  <br />
                  <p className="dark:text-slate-300 text-[12px]">
                    {dict.userSettings.privacy.description2}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {activeSection === "close-friends" && (
            <CloseFriends
              authActiveProfileId={authActiveProfileId}
              dict={dict}
            />
          )}
          {activeSection === "blocked" && (
            <Blocked authActiveProfileId={authActiveProfileId} dict={dict} />
          )}
          {activeSection === "muted-accounts" && (
            <MutedAccount
              authActiveProfileId={authActiveProfileId}
              dict={dict}
            />
          )}
          {activeSection === "theme" && (
            <Card>
              <CardHeader>
                <CardTitle>{dict.userSettings.theme.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeToggle
                  dict={dict}
                  authActiveProfileId={authActiveProfileId}
                />
              </CardContent>
            </Card>
          )}
          {activeSection === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>{dict.userSettingsLeftBar.preferences}</CardTitle>
              </CardHeader>
              <CardContent>
                <PreferencesComponent
                  categories={categories}
                  profileId={authActiveProfileId}
                />
              </CardContent>
            </Card>
          )}
          {activeSection === "terms" && <TermsConditions />}
        </div>
      </main>
    </div>
  );
}

export default RootSetting;
