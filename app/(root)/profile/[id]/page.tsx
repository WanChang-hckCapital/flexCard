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

async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  let authActiveProfileId = "";
  let authProfileIdFromParams = "";
  if (session) {
    const user = session?.user;
    const authUserId = user.id.toString();

    authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

    authProfileIdFromParams = params.id;

    await updateProfileViewData({ profileId: authProfileIdFromParams, authUserId: authActiveProfileId });
  } else {
    const geoInfo = await getIPCountryInfo();
    await updateProfileViewData({ profileId: authProfileIdFromParams, authUserId: geoInfo.ip });
  }

  const tempUrl = "https://hckcapital.net";

  let profileInfo = await fetchProfile(authProfileIdFromParams);
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

  console.log("authActiveProfileId", authActiveProfileId);
  console.log("authProfileIdFromParams", authProfileIdFromParams);
  console.log("profileInfo onboarded", profileInfo);

  if (authActiveProfileId.toString() === authProfileIdFromParams.toString() && !profileInfo?.onboarded)
    redirect("/onboarding");

  return (
    <section>
      <ProfileHeader
        accountId={authProfileIdFromParams}
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
      />

      <div className="">
        <Tabs defaultValue="flexCard" className="w-full">
          <TabsList className="tab mx-36">
            {personalTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>

                {tab.label === "CARDS" && (
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
              className="w-full text-light-1">
              <CardsTab
                authenticatedProfileId={authActiveProfileId}
                profileId={authProfileIdFromParams}
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
