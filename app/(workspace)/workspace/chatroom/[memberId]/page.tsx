import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { redirect } from "next/navigation";
import {
  getCurrentUserChatroom,
  fetchAllUser,
  getFollowersAndFollowing,
  getAllFollowersAndFollowing,
} from "@/lib/actions/user.actions";
import ChatRoomSideBar from "../_components/ChatRoomSideBar";
import ChatRoomMainBar from "../_components/ChatRoomMainComponent";
import SkeletonComponent from "../_components/Skeleton";
import ChatRoomComponent from "../_components/ChatRoomComponent";

interface ChatroomResponse {
  success: boolean;
  message: string;
  chatrooms: Array<any>;
}

interface ChatRoomProps {
  params: { memberId: string };
}

interface UserResponse {
  success: boolean;
  message: string;
  users: Array<any>;
}

interface AllFollowerAndFollowing {
  success: boolean;
  message: string;
  followers: any[];
  following: any[];
}

export default async function ChatComponent({ params }: ChatRoomProps) {
  const userId = { params };

  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user) {
    redirect("/sign-in");
  }

  const memberId = userId.params.memberId;

  //fetch all chatroom of current user
  let isLoading = false;
  let allChatrooms: ChatroomResponse = {
    success: false,
    message: "",
    chatrooms: [],
  };

  let allUsers: UserResponse = {
    success: false,
    message: "",
    users: [],
  };

  try {
    allChatrooms = await getCurrentUserChatroom(memberId);

    allUsers = await fetchAllUser(memberId);

    isLoading = false;
  } catch (error: any) {
    console.error("Failed to fetch chatrooms:", error.message || error);
    isLoading = false;
  }

  let allFollowerAndFollowingForPersonal: AllFollowerAndFollowing = {
    success: false,
    message: "",
    followers: [],
    following: [],
  };

  let allFollowerAndFollowingForGroup: AllFollowerAndFollowing = {
    success: false,
    message: "",
    followers: [],
    following: [],
  };

  try {
    // all following/follower user but havent create personal chatroom before
    allFollowerAndFollowingForPersonal = await getFollowersAndFollowing(
      memberId
    );
  } catch (error: any) {}

  try {
    // for group
    allFollowerAndFollowingForGroup = await getAllFollowersAndFollowing(
      memberId
    );
  } catch (error: any) {}

  return (
    <div>
      <div className="flex h-screen w-full bg-background">
        {/* {allChatrooms.success ? ( */}
        <ChatRoomComponent
          chatrooms={allChatrooms.chatrooms}
          authenticatedUserId={memberId}
          allUsers={allUsers.users}
          allFollowerAndFollowingForPersonal={
            allFollowerAndFollowingForPersonal
          }
          allFollowerAndFollowingForGroup={allFollowerAndFollowingForGroup}
        />
        {/* ) : (
          <SkeletonComponent />
        )} */}
      </div>
    </div>
  );
}
