import { redirect } from "next/navigation";
import { fetchProfile } from "@/lib/actions/admin.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import MemberProfile from "@/components/forms/member-profile";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";
import { getDictionary } from "../../dictionaries";

async function Page({ params }: { params: { lang: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const dict = await getDictionary(params.lang);

  if (!user) return redirect("/sign-in");

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  let profileInfo = await fetchProfile(authActiveProfileId);
  if (profileInfo && typeof profileInfo.toObject === "function") {
    profileInfo = profileInfo.toObject();
  }

  if (profileInfo?.onboarded) redirect("/");

  const profileData = {
    userId: user.id,
    profileId: authActiveProfileId,
    accountname: profileInfo ? profileInfo?.accountname : "",
    image: profileInfo ? profileInfo?.image : user.image,
    email: profileInfo ? profileInfo?.email : user.email,
    password: profileInfo ? profileInfo?.password : "",
    phone: profileInfo ? profileInfo?.phone : "",
    shortdescription: profileInfo ? profileInfo?.shortdescription : "",
  };

  return (
    <main className="mx-auto flex max-w-3xl w-screen flex-col justify-start px-10 py-20">
      <h1 className="head-text">{dict.auth.onboarding.title}</h1>
      <p className="mt-3 text-base-regular text-light-2">
        {dict.auth.onboarding.subTitle}
      </p>

      <section className="mt-9 bg-dark-2 pl-10 pr-10 pb-10 pt-6 rounded-xl">
        <MemberProfile profile={profileData} btnTitle={dict.auth.onboarding.btnContinue} dict={dict} />
      </section>
    </main>
  );
}

export default Page;
