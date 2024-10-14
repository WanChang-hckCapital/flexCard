import { getServerSession } from "next-auth";
import Setting from "./component/page";
import { authOptions } from "@/app/api/utils/authOptions";
import { redirect } from "next/navigation";
import { fetchCurrentActiveProfileId } from "@/lib/actions/user.actions";

const Page = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authUserId = user.id.toString();
  const authActiveProfileId = await fetchCurrentActiveProfileId(authUserId);

  return <Setting authActiveProfileId={authActiveProfileId} />;
};

export default Page;
