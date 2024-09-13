import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { redirect } from "next/navigation";
import {
  getCurrentUserChatroom,
  fetchAllUser,
  getFollowersAndFollowing,
  getAllFollowersAndFollowing,
  getProfileId,
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
  merged: any[];
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

  let allFollowerAndFollowingForPersonal: AllFollowerAndFollowing = {
    success: false,
    message: "",
    followers: [],
    following: [],
    merged: [],
  };

  let allFollowerAndFollowingForGroup: AllFollowerAndFollowing = {
    success: false,
    message: "",
    followers: [],
    following: [],
    merged: [],
  };

  let profileId: any;
  let serializedChatrooms: any;
  let serializedAllUsers: any;
  let serializedFollowerAndFollowingForPersonal: any;
  let serializedFollowerAndFollowingForGroup: any;
  let serializedProfileId: any;

  try {
    allChatrooms = await getCurrentUserChatroom(memberId);

    allUsers = await fetchAllUser(memberId);

    serializedChatrooms = JSON.parse(JSON.stringify(allChatrooms.chatrooms));
    serializedAllUsers = JSON.parse(JSON.stringify(allUsers.users));

    // all following/follower user but havent create personal chatroom before
    allFollowerAndFollowingForPersonal = await getFollowersAndFollowing(
      memberId
    );

    // all following/follower user but havent create personal chatroom before
    allFollowerAndFollowingForPersonal = await getFollowersAndFollowing(
      memberId
    );

    serializedFollowerAndFollowingForPersonal = JSON.parse(
      JSON.stringify(allFollowerAndFollowingForPersonal)
    );
    serializedFollowerAndFollowingForGroup = JSON.parse(
      JSON.stringify(allFollowerAndFollowingForGroup)
    );

    profileId = await getProfileId(memberId);
    serializedProfileId = JSON.parse(JSON.stringify(profileId.profile));

    isLoading = false;
  } catch (error: any) {
    console.error("Failed to fetch chatrooms:", error.message || error);
    isLoading = false;
  }

  if (isLoading) {
    return <SkeletonComponent />;
  }

  // In case profileId or other data fetching failed
  if (!profileId || !allChatrooms.success) {
    return <div>Error loading chatrooms or profile data</div>;
  }

  return (
    <div>
      <div className="flex h-screen w-full bg-background">
        <ChatRoomComponent
          chatrooms={serializedChatrooms}
          authenticatedUserId={serializedProfileId}
          allUsers={serializedAllUsers}
          allFollowerAndFollowingForPersonal={
            serializedFollowerAndFollowingForPersonal
          }
          allFollowerAndFollowingForGroup={
            serializedFollowerAndFollowingForGroup
          }
        />
      </div>
    </div>
  );
}
