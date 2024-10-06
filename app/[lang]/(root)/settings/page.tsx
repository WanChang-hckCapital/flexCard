// pages/settings.tsx (or wherever you're using the action)
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/utils/authOptions";
import RootSetting from "./component/page";
import { fetchMemberWithProfiles } from "@/lib/actions/user.actions";
import { getDictionary } from "../../dictionaries";

export default async function SettingsPage({ params }: { params: { lang: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const dict = await getDictionary(params.lang);

  if (!user) {
    redirect("/sign-in");
    return null;
  }

  const authUserId = user.id.toString();
  
  const member = await fetchMemberWithProfiles(authUserId);

  if (!member) {
    redirect("/error");
    return null;
  }

  const profiles = member.profiles || [];

  const activeProfileId = profiles[member.activeProfile]?._id;
  const activeProfile = profiles.find(profile => profile._id.toString() === activeProfileId?.toString());

  if (!activeProfile?.onboarded) {
    redirect("/onboarding");
    return null;
  }

  const profileData = {
    userId: user.id,
    accountname: activeProfile?.accountname || "",
    accountType: activeProfile?.accountType || "",
    image: activeProfile?.image[0].binaryCode || user.image,
    email: activeProfile?.email || user.email,
    shortdescription: activeProfile?.shortdescription || "",
  };

  return <RootSetting authUserId={authUserId} authActiveProfileId={activeProfileId} profileData={profileData} profiles={profiles} dict={dict} />;
}
