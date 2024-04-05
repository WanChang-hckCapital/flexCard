
import { redirect } from "next/navigation";

import { fetchMember } from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MemberProfile from "@/components/forms/member-profile";

async function Page() {
  const session = await getServerSession(authOptions)
  const user = session?.user;

  if (!user) return null;

  const userInfo = await fetchMember(user.id);
  if (userInfo?.onboarded) redirect("/");

  const userData = {
    userId: user.id,
    accountname: userInfo ? userInfo?.accountname : "",
    image: userInfo ? userInfo?.image : user.image,
    email: userInfo ? userInfo?.email : user.email,
    password: userInfo ? userInfo?.password : "",
    phone: userInfo ? userInfo?.phone : "",
    shortdescription: userInfo ? userInfo?.shortdescription : "",
  };

  return (
    <main className='mx-auto flex max-w-3xl w-screen flex-col justify-start px-10 py-20'>
      <h1 className='head-text'>Almost there!</h1>
      <p className='mt-3 text-base-regular text-light-2'>
        Complete your profile now just a few steps to continue using flexCard.
      </p>

      <section className='mt-9 bg-dark-2 pl-10 pr-10 pb-10 pt-6 rounded-xl'>
        <MemberProfile user={userData} btnTitle='Continue' />
      </section>
    </main>
  );
}

export default Page;
