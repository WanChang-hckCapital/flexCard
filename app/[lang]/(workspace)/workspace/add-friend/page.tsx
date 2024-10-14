import React from "react";
import {
  fetchAllUser,
  getAccountType,
  getFollowRequest,
} from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/utils/authOptions";
import { redirect } from "next/navigation";
import FriendItem from "./_component/FriendItem";
import NavBar from "./_component/NavBar";
import FollowRequestModal from "./_component/FollowRequestModal";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const authenticatedUserId = user.id;

  // Fetch all possible users
  let allUsers: { success: boolean; users: any[]; message: string } = {
    success: false,
    users: [],
    message: "",
  };
  let unAddedUser: any[] = [];
  try {
    allUsers = await fetchAllUser(authenticatedUserId);

    // filter all the unadded user
    if (allUsers.success) {
      unAddedUser = allUsers.users;
    } else {
      console.error("Failed to fetch users:", allUsers.message);
    }
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }

  let accountType = "Unknown";
  let followRequests: any[] = [];
  try {
    const accountTypeResponse = await getAccountType(authenticatedUserId);
    if (accountTypeResponse.success) {
      accountType = accountTypeResponse.accountType;

      // console.log("accountType:" + accountType);
      if (accountType === "PRIVATE") {
        const followRequestResponse = await getFollowRequest(
          authenticatedUserId
        );
        if (followRequestResponse.success) {
          followRequests = followRequestResponse.followRequests;
          // console.log("followRequests frontend:" + followRequests);
        } else {
          console.error(
            "Failed to fetch follow requests:",
            followRequestResponse.message
          );
        }
      }
    } else {
      console.error(
        "Failed to fetch account type:",
        accountTypeResponse.message
      );
    }
  } catch (error) {
    console.error("Failed to fetch account type:", error);
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <NavBar />

      <div className="flex flex-col flex-1 items-center justify-start p-4 pt-16">
        <div className="flex-1 mt-4 overflow-y-auto w-11/12">
          <div className="grid gap-2">
            {/* <div className="text-sm font-medium text-muted-foreground">
              Suggestion
            </div> */}
            {/* {accountType === "PRIVATE" && (
              <div className="flex items-center gap-2">
                <Badge className="cursor-pointer" variant="bgRed">
                  Follow Request:{followRequests.length}
                </Badge>
              </div>
            )} */}
            {accountType === "PRIVATE" && (
              <FollowRequestModal initialFollowRequests={followRequests} />
            )}
            {unAddedUser.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className="grid gap-2">
                {unAddedUser.map((user) => (
                  <FriendItem
                    key={user.userId}
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
