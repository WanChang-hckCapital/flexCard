import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { redirect } from "next/navigation";

export default async function ChatRoomComponent() {
  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  return <div></div>;
}
