import { redirect } from "next/navigation";
import { fetchCurrentActiveProfileId, fetchMemberImage, fetchUser } from "@/lib/actions/user.actions";
import MemberProfile from "@/components/forms/member-profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { fetchMember, fetchProfile } from "@/lib/actions/admin.actions";

async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  const profileInfo = await fetchProfile(authActiveProfileId);
  if (!profileInfo?.onboarded) redirect("/onboarding");

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
    userId: authUserId, //backend need this
    profileId: authActiveProfileId,
    accountname: profileInfo ? profileInfo?.accountname : "",
    image: profileInfo.binaryCode,
    email: profileInfo ? profileInfo?.email : user.email,
    phone: profileInfo ? profileInfo?.phone : "",
    shortdescription: profileInfo ? profileInfo?.shortdescription : "",
  };

  return (
    <main className="mx-auto flex max-w-3xl w-screen flex-col justify-start px-10 py-20">
      <h1 className="head-text">Edit Profile</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Modify your personal details here...
      </p>

      <section className="mt-9 bg-dark-2 pl-10 pr-10 pb-10 pt-6 rounded-xl">
        <MemberProfile profile={profileData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;
