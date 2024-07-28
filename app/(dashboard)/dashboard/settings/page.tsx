import { getServerSession } from "next-auth";
import Setting from "./component/page";
import { authOptions } from "@/app/api/utils/authOptions";

const Page = async () => {
  const session = await getServerSession(authOptions);
  const authenticatedUserId = session?.user?.id || "";

  return <Setting authenticatedUserId={authenticatedUserId} />;
};

export default Page;
