import MemberProfile from "../forms/member-profile";

const EditProfile = ({ profileData }: any) => {
  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <main className="mx-auto flex max-w-3xl w-screen flex-col justify-start px-10 py-20">
      <h1 className="head-text">Edit Profile</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Modify your personal details here...
      </p>

      <section className="mt-9 bg-dark-2 pl-10 pr-10 pb-10 pt-6 rounded-xl">
        <MemberProfile profile={profileData} btnTitle="Continue" dict={undefined} />
      </section>
    </main>
  );
};

export default EditProfile;
