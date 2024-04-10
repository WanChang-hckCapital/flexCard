
import { redirect } from "next/navigation";
import { fetchMember, fetchMemberImage, fetchUser } from "@/lib/actions/user.actions";
import MemberProfile from "@/components/forms/member-profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


async function Page() {
    //   const user = await currentUser();
    //   if (!user) return null;

    //   const userInfo = await fetchUser(user.id);
    //   if (!userInfo?.onboarded) redirect("/onboarding");

    //   const userData = {
    //     id: user.id,
    //     objectId: userInfo?._id,
    //     username: userInfo ? userInfo?.username : user.username,
    //     name: userInfo ? userInfo?.name : user.firstName ?? "",
    //     bio: userInfo ? userInfo?.bio : "",
    //     image: userInfo ? userInfo?.image : user.imageUrl,
    //   };

    const session = await getServerSession(authOptions)
    const user = session?.user;


    console.log("edit: " + user);

    if (!user) return null;

    const userInfo = await fetchMember(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    let userImage = null;
    if (userInfo.image != null) {
        userImage = await fetchMemberImage(userInfo.image);
    } else {
        userImage = user?.image;
    }

    const userData = {
        userId: user.id,
        accountname: userInfo ? userInfo?.accountname : "",
        image: userImage.binaryCode,
        email: userInfo ? userInfo?.email : user.email,
        phone: userInfo ? userInfo?.phone : "",
        shortdescription: userInfo ? userInfo?.shortdescription : "",
    };

    return (
        <main className='mx-auto flex max-w-3xl w-screen flex-col justify-start px-10 py-20'>
            <h1 className='head-text'>Edit Profile</h1>
            <p className='mt-3 text-base-regular text-light-2'>
                Modify your personal details here...
            </p>

            <section className='mt-9 bg-dark-2 pl-10 pr-10 pb-10 pt-6 rounded-xl'>
                <MemberProfile user={userData} btnTitle='Continue' />
            </section>
        </main>
    );
}

export default Page;
