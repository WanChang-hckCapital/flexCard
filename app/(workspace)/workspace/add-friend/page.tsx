import React from "react";
import {
  fetchAllUser,
  getUserFriend,
  getCurrentUserAllFriendRequest,
} from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { redirect } from "next/navigation";
import FriendItem from "./_component/FriendItem";
import FriendRequestList from "./_component/ReceiveRequestList";
import MyFriendList from "./_component/MyFriendList";
// import { getAccountType } from "@/lib/actions/user.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavBar from "./_component/NavBar";
import { Badge } from "@/components/ui/badge";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authenticatedUserId = user.id;

  // Fetch all possible friends
  let allUsers: any[] = [];
  let unAddedUser: any[] = [];
  try {
    allUsers = await fetchAllUser(authenticatedUserId);

    // filter all the unadded user
    unAddedUser = allUsers.filter((user) => user.friendStatus === "0");
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }

  // Fetch current user's friends
  let userFriends: any[] = [];
  try {
    const response = await getUserFriend(authenticatedUserId);
    if (response.success && response.friends) {
      userFriends = response.friends;
    } else {
      console.error(response.message);
    }
  } catch (error) {
    console.error("Failed to fetch user's friends:", error);
  }

  // fetch all current user's friend requests
  let friendRequests: any[] = [];
  try {
    const response = await getCurrentUserAllFriendRequest(authenticatedUserId);
    if (response.success && response.friendRequests) {
      friendRequests = response.friendRequests;
    } else {
      console.error(response.message);
    }
  } catch (error) {
    console.error("Failed to fetch user's friend requests:", error);
  }

  //   const { success, accountType, message } = await getAccountType(
  //     authenticatedUserId
  //   );

  //   if (success) {
  //     console.log("Account Type:", accountType);
  //   } else {
  //     console.error("Failed to fetch account type:", message);
  //   }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <NavBar />

      <div className="flex flex-col flex-1 items-center justify-start p-4 pt-16">
        <Tabs defaultValue="friendrequest" className="w-11/12 pt-10">
          <div className="relative w-11/12 flex justify-start space-x-4 mb-4">
            {/* <Badge variant="outline">My Profile</Badge> */}
            {/* <Badge variant="outline">Suggestion</Badge> */}
          </div>
          <TabsList className="flex justify-between w-full mb-2">
            <TabsTrigger value="friendrequest" className="w-1/2 text-center">
              Follow Request
            </TabsTrigger>
            {/* <TabsTrigger value="followers" className="w-1/2 text-center">
              Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="w-1/2 text-center">
              Following
            </TabsTrigger> */}
            {/* <TabsTrigger value="friendrequest" className="w-1/2 text-center">
              Friend Request
            </TabsTrigger> */}

            {/* <TabsTrigger value="yourfriends" className="w-1/2 text-center">
              Your Friends
            </TabsTrigger> */}
          </TabsList>
          <TabsContent value="friendrequest">
            <div className="grid gap-2">
              <FriendRequestList authenticatedUserId={authenticatedUserId} />
            </div>
          </TabsContent>
          <TabsContent value="yourfriends">
            <div className="grid gap-2">
              <MyFriendList
                userFriends={userFriends}
                authenticatedUserId={authenticatedUserId}
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex-1 mt-4 overflow-y-auto w-11/12">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">
              Suggestion
            </div>
            {unAddedUser.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className="grid gap-2">
                {unAddedUser.map((user) => (
                  <FriendItem
                    key={user._id}
                    user={user}
                    senderId={authenticatedUserId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
