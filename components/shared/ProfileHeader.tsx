"use client";

import React, { useState } from "react";
import Image from "next/image";
import VisitWebButton from "../buttons/visitweb-button";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { updateMemberFollow } from "@/lib/actions/user.actions";
import { RiUserUnfollowLine } from "react-icons/ri";
import {
  getAllFollowers,
  getAllFollowing,
  checkIfFollowing,
  checkIfFollower,
  removeFollower,
  removeFollowing,
} from "@/lib/actions/user.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Props {
  accountId: string;
  authActiveProfileId?: string;
  accountName: string;
  imgUrl?: string;
  shortdescription?: string;
  usertype: string;
  cards: Number;
  followers: string[];
  following: string[];
  webUrl: string; //changelater
  initialFollowingStatus: boolean;
}

function ProfileHeader({
  accountId,
  authActiveProfileId,
  accountName,
  imgUrl,
  shortdescription,
  usertype,
  cards,
  followers,
  following,
  webUrl,
  initialFollowingStatus,
}: Props) {
  const [isFollowing, setIsFollowing] = useState<boolean>(
    initialFollowingStatus
  );
  const [followersLength, setFollowersLength] = useState<number>(
    followers.length
  );
  const [followingLength, setFollowingLength] = useState<number>(
    following.length
  );

  const [followersUsers, setFollowersUsers] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);
  const [followerButtonText, setFollowerButtonText] =
    useState<string>("Remove");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  const isDifferentUser = accountId !== authActiveProfileId;
  const isOrganization = usertype.toUpperCase() == "ORGANIZATION";

  const handleButtonClick = async (method: "FOLLOW" | "UNFOLLOW") => {
    if (!authActiveProfileId) {
      toast.error("You need to login first before action.");
      return;
    }

    try {
      const response = await updateMemberFollow({
        authActiveProfileId,
        accountId,
        method,
      });
      if (response.success === true) {
        const { updatedFollowing, updateFollower } = response.data;
        if (
          method === "FOLLOW" &&
          updatedFollowing.includes(accountId.toString())
        ) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
        setFollowersLength(updateFollower.length);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to do action, please try again.");
    }
  };

  // show current user following
  const openFollowingDialog = async (accountId: any) => {
    try {
      const currentUserFollowing = await getAllFollowing(accountId);
      setFollowingUsers(currentUserFollowing.following);
      setIsFollowingDialogOpen(true);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  // show current user follower
  const openFollowerDialog = async (accountId: any) => {
    try {
      const currentUserFollower = await getAllFollowers(accountId);
      setFollowersUsers(currentUserFollower.followers);
      setIsFollowersDialogOpen(true);
    } catch (error) {
      console.error("Error fetching follower:", error);
    }
  };

  // auth user remove followers
  const removeFollowerHandler = async (
    authUserId: any,
    removeFollowerId: any
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const followerStatus = await checkIfFollower({
        authUserId,
        accountId: removeFollowerId,
      });

      if (followerStatus.success && followerStatus.isFollower) {
        const removeResponse = await removeFollower(
          authUserId,
          removeFollowerId
        );

        if (removeResponse.success) {
          toast.success("Follower removed successfully.");
          // setFollowerButtonText("Following");

          setFollowersLength((prev) => prev - 1);
          setIsFollowersDialogOpen(false);
          return { success: true, message: "Follower removed successfully." };
        } else {
          toast.error(removeResponse.message || "Failed to remove follower.");
          return {
            success: false,
            message: removeResponse.message || "Failed to remove follower.",
          };
        }
      } else {
        const message = "You are not following this user.";
        toast.error(message);
        return { success: false, message };
      }
    } catch (error) {
      const errorMessage = "Error removing follower.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // auth user remove following
  // const removeFollowingHandler = async (
  //   authUserId: any,
  //   removeFollowingId: any
  // ): Promise<{ success: boolean; message: string }> => {
  //   try {
  //     const followerStatus = await checkIfFollowing({
  //       authUserId,
  //       accountId: removeFollowingId,
  //     });

  //     if (followerStatus.success && followerStatus.isFollowing) {
  //       const removeResponse = await removeFollowing(
  //         authUserId,
  //         removeFollowingId
  //       );

  //       if (removeResponse.success) {
  //         toast.success("Following removed successfully.");
  //         setFollowingLength((prev) => prev - 1);
  //         setIsFollowingDialogOpen(false);
  //         setShowAlertDialog(false);
  //         return { success: true, message: "Following removed successfully." };
  //       } else {
  //         toast.error(removeResponse.message || "Failed to remove following.");
  //         return {
  //           success: false,
  //           message: removeResponse.message || "Failed to remove following.",
  //         };
  //       }
  //     } else {
  //       const message = "You are not following this user.";
  //       toast.error(message);
  //       return { success: false, message };
  //     }
  //   } catch (error) {
  //     const errorMessage = "Error removing follower.";
  //     toast.error(errorMessage);
  //     return { success: false, message: errorMessage };
  //   }
  // };

  const handleUnfollowClick = (userId: string) => {
    setSelectedUser(userId);
    setShowAlertDialog(true);
  };

  // const handleUnfollowConfirm = async () => {
  //   if (selectedUser) {
  //     await removeFollowingHandler(authUserId, selectedUser);
  //   }
  //   setShowAlertDialog(false);
  //   setSelectedUser(null);
  // };

  return (
    <div className="flex w-full flex-col justify-center mt-12 sm:mt-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-8 max-sm:gap-4">
          <div className="relative h-24 w-24 object-cover">
            {imgUrl ? (
              <Image
                src={imgUrl.toString()}
                alt="User Profile Image"
                fill
                className="rounded-full object-cover shadow-2xl"
              />
            ) : (
              <Image
                src={"/logo.png"}
                alt="Logo"
                fill
                className="rounded-full object-cover shadow-2xl"
              />
            )}
          </div>

          <div className="flex-1 justify-center min-w-60">
            <div className="flex justify-between items-center">
              <h2 className="flex row text-left text-heading3-bold text-light-1 gap-2">
                {accountName ? accountName : "Nickname"}
                {usertype == "ORGANIZATION" && (
                  <Image
                    src="/assets/verified.svg"
                    alt="logout"
                    width={24}
                    height={24}
                  />
                )}
              </h2>
            </div>
            <div className="flex flex-row gap-6 mt-2">
              <p>{cards.toString()} Card</p>
              <p
                className="cursor-pointer"
                onClick={() => openFollowerDialog(accountId)}
              >
                {followersLength.toString()} Followers
              </p>
              <p
                className="cursor-pointer"
                onClick={() => openFollowingDialog(accountId)}
              >
                {followingLength.toString()} Following
              </p>
            </div>
            <p className="mt-2 max-w-lg text-base-regular text-light-2">
              {shortdescription ? shortdescription : "Short Descriptions"}
            </p>
            <div className="flex row gap-3 pt-5">
              {isDifferentUser &&
                (!isFollowing ? (
                  <Button
                    className="px-3 w-full "
                    variant="sky"
                    onClick={() => handleButtonClick("FOLLOW")}
                  >
                    <Image
                      width={16}
                      height={16}
                      className="rounded-full mr-3"
                      src="/assets/user.svg"
                      alt="profile icon"
                    />
                    Follow
                  </Button>
                ) : (
                  <Button
                    className="px-3 w-full"
                    variant="ghost"
                    onClick={() => handleButtonClick("UNFOLLOW")}
                  >
                    <RiUserUnfollowLine className="mr-3" />
                    Unfollow
                  </Button>
                ))}
              {isDifferentUser && isOrganization && (
                <VisitWebButton url={webUrl} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 h-0.5 bg-gray-900 mx-36" />

      {/* Dialog for displaying followers */}
      <Dialog
        open={isFollowersDialogOpen}
        onOpenChange={setIsFollowersDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {followersUsers.length > 0 ? (
              followersUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-4">
                  {user.image ? (
                    <Image
                      src={user.image.toString()}
                      alt="Follower Image"
                      width={40}
                      height={40}
                      className="rounded-full object-cover shadow-2xl"
                    />
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image || "/assets/user.svg"}
                        alt="Avatar"
                      />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span>{user.name}</span>
                  {/* <span>{user.userId}</span> */}
                  {/* {!isDifferentUser && (
                    <Button
                      variant="destructive"
                      className="ml-auto"
                      onClick={() =>
                        removeFollowerHandler(authUserId, user.userId)
                      }
                    >
                      {followerButtonText}
                    </Button>
                  )} */}
                </div>
              ))
            ) : (
              <p>You don't have any followers yet.</p>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" className="mt-4">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Dialog for displaying following users */}
      <Dialog
        open={isFollowingDialogOpen}
        onOpenChange={setIsFollowingDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {followingUsers.length > 0 ? (
              followingUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-4">
                  {user.image ? (
                    <Image
                      src={user.image.toString()}
                      alt="Following Image"
                      width={40}
                      height={40}
                      className="rounded-full object-cover shadow-2xl"
                    />
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image || "/assets/user.svg"}
                        alt="Avatar"
                      />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span>{user.name}</span>
                  {/* <span>{user.userId}</span> */}
                  {/* {!isDifferentUser && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="ml-auto"
                            onClick={() => handleUnfollowClick(user.userId)}
                          >
                            Following
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Unfollow
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to unfollow this user? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUnfollowConfirm}>
                              Unfollow
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )} */}
                </div>
              ))
            ) : (
              <p>You are not following anyone yet.</p>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" className="mt-4">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfileHeader;
