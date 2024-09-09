import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/utils/authOptions";
import { fetchMember, fetchProfile } from "@/lib/actions/admin.actions";
import { fetchCurrentActiveProfileId, fetchMemberImage } from "@/lib/actions/user.actions";
import RootSetting from "./component/page";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
    return null;
  }

  const authActiveProfileId = await fetchCurrentActiveProfileId(user.id);
  const profileInfo = await fetchProfile(authActiveProfileId);

  if (!profileInfo?.onboarded) {
    redirect("/onboarding");
    return null;
  }

  let profileImage = null;
  if (profileInfo.image != null) {
    profileImage = await fetchMemberImage(profileInfo.image);
    if (typeof profileImage.toObject === "function") {
      profileImage = profileImage.toObject();
    }
  } else {
    profileImage = user?.image;
  }

  const profileData = {
    userId: user.id,
    accountname: profileInfo?.accountname || "",
    accountType: profileInfo?.accountType || "",
    image: profileImage.binaryCode || "",
    email: profileInfo?.email || user.email,
    phone: profileInfo?.phone || "",
    shortdescription: profileInfo?.shortdescription || "",
  };

  return <RootSetting authActiveProfileId={authActiveProfileId} profileData={profileData} />;
}
