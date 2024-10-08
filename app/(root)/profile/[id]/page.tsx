import Image from "next/image";
import { redirect } from "next/navigation";
import { personalTabs } from "@/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  fetchMemberImage,
  getIPCountryInfo,
  updateProfileViewData,
} from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import ProfileHeader from "@/components/shared/ProfileHeader";
import CardsTab from "@/components/shared/CardsTab";
import { fetchMember } from "@/lib/actions/admin.actions";

async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (session) {
    const user = session?.user;
    const authUserId = user.id.toString();
    await updateProfileViewData({ userId: params.id, authUserId: authUserId });
  } else {
    const geoInfo = await getIPCountryInfo();
    await updateProfileViewData({ userId: params.id, authUserId: geoInfo.ip });
  }

  const tempUrl = "https://hckcapital.net";

  let userInfo = await fetchMember(params.id);
  if (userInfo && typeof userInfo.toObject === "function") {
    userInfo = userInfo.toObject();
  }

  const followersIds = userInfo.followers.map(
    (follower: { followersId: { toString: () => string } }) =>
      follower.followersId.toString()
  );
  const isFollowing = followersIds.includes(session?.user.id.toString());

  let userImage = await fetchMemberImage(userInfo.image);
  if (userImage && typeof userImage.toObject === "function") {
    userImage = userImage.toObject();
  }

  if (session?.user.id.toString() === params.id && !userInfo?.onboarded)
    redirect("/onboarding");

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.user.toString()}
        authUserId={session?.user.id.toString()}
        accountName={userInfo.accountname}
        imgUrl={userImage.binaryCode}
        shortdescription={userInfo.shortdescription}
        usertype={userInfo.usertype}
        cards={userInfo.cards.length}
        followers={userInfo.followers}
        following={userInfo.following}
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
                    {userInfo.cards.length}
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
                authenticatedUserId={session?.user.id.toString()}
                accountId={params.id}
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
