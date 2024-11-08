import Image from "next/image";
import { redirect } from "next/navigation";
import { personalTabs } from "@/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  fetchCurrentActiveProfileId,
  fetchMemberImage,
  getIPCountryInfo,
  updateProfileViewData,
} from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import ProfileHeader from "@/components/shared/ProfileHeader";
import CardsTab from "@/components/shared/CardsTab";
import { fetchMember, fetchProfile } from "@/lib/actions/admin.actions";
import { Grip } from "lucide-react";
import { getDictionary } from "@/app/[lang]/dictionaries";

async function Page({ params }: { params: { id: string; lang: string } }) {
  const session = await getServerSession(authOptions);
  const dict = await getDictionary(params.lang);

  let authActiveProfileId = "";
  let profileIdFromParams = "";
  if (session) {
    const user = session?.user;
    const authUserId = user.id.toString();

    authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

    profileIdFromParams = params.id;

    await updateProfileViewData({
      profileId: profileIdFromParams,
      authUserId: authActiveProfileId,
    });
  } else {
    const geoInfo = await getIPCountryInfo();
    await updateProfileViewData({
      profileId: profileIdFromParams,
      authUserId: geoInfo.ip,
    });
  }

  const tempUrl = "https://hckcapital.net";

  let profileInfo = await fetchProfile(profileIdFromParams);
  if (profileInfo && typeof profileInfo.toObject === "function") {
    profileInfo = profileInfo.toObject();
  }

  const followersIds = profileInfo.followers.map(
    (follower: { followersId: { toString: () => string } }) =>
      follower.followersId.toString()
  );
  const isFollowing = followersIds.includes(authActiveProfileId);

  let profileImage = await fetchMemberImage(profileInfo.image);
  if (profileImage && typeof profileImage.toObject === "function") {
    profileImage = profileImage.toObject();
  }

  // console.log("authActiveProfileId", authActiveProfileId);
  // console.log("authProfileIdFromParams", profileIdFromParams);
  // console.log("profileInfo onboarded", profileInfo);

  if (
    authActiveProfileId.toString() === profileIdFromParams.toString() &&
    !profileInfo?.onboarded
  )
    redirect("/onboarding");

  const styles: React.CSSProperties = {
    textAlign: "-webkit-center" as "center",
  };

  return (
    <section>
      <ProfileHeader
        accountId={profileIdFromParams}
        authActiveProfileId={authActiveProfileId}
        accountName={profileInfo.accountname}
        imgUrl={profileImage.binaryCode}
        shortdescription={profileInfo.shortdescription}
        usertype={profileInfo.usertype}
        cards={profileInfo.cards.length}
        followers={profileInfo.followers}
        following={profileInfo.following}
        // webUrl={userInfo.organization.webUrl}
        webUrl={tempUrl}
        initialFollowingStatus={isFollowing}
        dict={dict}
      />

      <div style={styles}>
        <Tabs defaultValue="flexCard" className="w-full">
          <TabsList className="tab mx-36">
            {personalTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Grip
                  size={24}
                  className="mr-2"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth={1}
                />
                <p className="max-sm:hidden">{dict.profileTab[tab.label]}</p>

                {tab.label === "BUBBLES" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {profileInfo.cards.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {personalTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              <CardsTab
                authenticatedProfileId={authActiveProfileId}
                profileId={profileIdFromParams}
                userType="PERSONAL"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
export default Page;
