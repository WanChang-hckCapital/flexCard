"use server";

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongodb";
import Member from "../models/member";
import Card from "../models/card";
import Image from "../models/image";
import UserModel from "../models/user";
import FriendRequestModel from "../models/friendrequest";
import FriendModel from "../models/friend";
import FollowRequestModel from "../models/followrequest";
import OrganizationModel from "../models/organization";
import ChatroomModel from "../models/chatroomtable";
import MessageModel from "../models/message";
import Organization from "../models/organization";
import { Readable } from "stream";
import { headers } from "next/headers";
import { addMinutes, startOfDay, subMinutes } from "date-fns";
import ComponentModel from "../models/component";
import MemberModel from "../models/member";
import liff from "@line/liff";
import axios from "axios";
import ProductModel from "../models/product";
import FeedbackModel from "../models/feedback";
import CommentModel from "../models/comment";
import { generateCustomID } from "../utils";
import { Comment, MemberType } from "@/types";

export async function authenticateUser(email: string, password: string) {
  try {
    await connectToDB();

    const user = await Member.findOne({ email });
    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const strUser = user.toString();
      console.log(strUser);
      return strUser;
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(`Failed to authenticate user: ${error.message}`);
  }
}

export async function createUser(
  email: string,
  username: string,
  password: string
) {
  try {
    await connectToDB();

    const existingUser = await Member.findOne({ email: email });
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Member.create({
      email,
      username,
      password: hashedPassword,
    });

    const initalProfile = new ProfileModel();
    await initalProfile.save();

    newUser.profiles.push(initalProfile._id);
    await newUser.save();

    return newUser;
  } catch (error: any) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

export async function createMember(userId: string, email: string) {
  try {
    await connectToDB();

    const existingMember = await Member.findOne({ user: userId });

    if (!existingMember) {
      const newMember = new Member({
        user: userId,
      });

      const initalProfile = new ProfileModel({ email: email });
      await initalProfile.save();

      newMember.profiles.push(initalProfile._id);

      await newMember.save();
      return true;
    }

    return false;
  } catch (error: any) {
    throw new Error(`Failed to create member: ${error.message}`);
  }
}

export async function getIPCountryInfo() {
  if (process.env.NODE_ENV === "development") {
    // const ip = "2001:f40:983:ca54:11c7:d9be:7e0c:eab1" // MY IP address for testing
    const ip = "103.123.240.66"; // TW IP address for testing
    return fetch(`http://ip-api.com/json/${ip}`)
      .then((response) => response.json())
      .then((data) => {
        return {
          ip: data.query,
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          city: data.city,
        };
      });
  } else {
    const headersList = headers();
    const ip = headersList.get("request-ip");
    return fetch(`http://ip-api.com/json/${ip}`)
      .then((response) => response.json())
      .then((data) => {
        return {
          ip: data.query,
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          city: data.city,
        };
      });
  }
}

export async function getGeoInfoByIP(ipAddress: string) {
  return fetch(`http://ip-api.com/json/${ipAddress}`)
    .then((response) => response.json())
    .then((data) => {
      return {
        ip: data.query,
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
      };
    });
}

export async function updateLastLoginDateAndIP(
  userId: string,
  ipAddress: string
) {
  try {
    await connectToDB();

    const member = await Member.findOne({ user: userId });

    if (!member) {
      throw new Error("Member not found");
    }

    const lastLoginDateTime = new Date();

    if (member.ip_address !== ipAddress) {
      const oldGeoInfo = await getGeoInfoByIP(member.ip_address);
      const newGeoInfo = await getGeoInfoByIP(ipAddress);

      if (!oldGeoInfo || !newGeoInfo || oldGeoInfo.city !== newGeoInfo.city) {
        await Member.findOneAndUpdate(
          { user: userId },
          {
            lastlogin: lastLoginDateTime,
            ip_address: ipAddress,
          },
          { upsert: true }
        );
      } else {
        await Member.findOneAndUpdate(
          { user: userId },
          { lastlogin: lastLoginDateTime },
          { upsert: true }
        );
      }
    } else {
      await Member.findOneAndUpdate(
        { user: userId },
        { lastlogin: lastLoginDateTime },
        { upsert: true }
      );
    }

    return true;
  } catch (error: any) {
    throw new Error(`Failed to update last login date: ${error.message}`);
  }
}

export async function fetchMemberImage(imageId: string) {
  try {
    await connectToDB();

    const imageUrl = await Image.findOne({ _id: imageId });

    return imageUrl;
  } catch (error: any) {
    throw new Error(`Failed to fetch Image: ${error.message}`);
  }
}

export async function fetchCurrentActiveProfile(userId: string) {
  try {
    await connectToDB();

    const member = await Member.findOne({ user: userId }).select(
      "activeProfile profiles"
    );

    const activeProfileIndex = member.activeProfile;

    const activeProfileId = member.profiles[activeProfileIndex];

    const profile = await ProfileModel.findOne({ _id: activeProfileId });

    if (!profile) {
      throw new Error("Profile not found");
    }

    return profile;
  } catch (error: any) {
    throw new Error(`Failed to fetch current active profile: ${error.message}`);
  }
}

export async function fetchCurrentActiveProfileId(userId: string) {
  try {
    await connectToDB();

    const member = await Member.findOne({ user: userId }).select(
      "activeProfile profiles"
    );

    const activeProfileIndex = member.activeProfile;
    const activeProfileId = member.profiles[activeProfileIndex];

    if (!activeProfileId) {
      throw new Error("Profile not found");
    }

    return activeProfileId;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch current active profile Id: ${error.message}`
    );
  }
}

export async function setCurrentActiveProfileById(
  userId: string,
  targetProfileId: string
) {
  try {
    await connectToDB();

    const member = await Member.findOne({ user: userId }).select(
      "activeProfile profiles"
    );

    const targetProfileIndex = member.profiles.findIndex(
      (id: any) => id.toString() === targetProfileId
    );
    const newActiveProfileIndex = targetProfileIndex;

    member.activeProfile = newActiveProfileIndex;
    await member.save();
  } catch (error: any) {
    throw new Error(`Failed to set new active profile Id: ${error.message}`);
  }
}

export async function fetchMemberWithProfiles(userId: string) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({ user: userId })
      .populate({
        path: "profiles",
        populate: [
          {
            path: "image",
            model: "Image",
          },
          {
            path: "organization",
            model: "Organization",
          },
        ],
      })
      .lean<MemberType>();

    if (!member) {
      throw new Error("Member not found");
    }

    return member;
  } catch (error: any) {
    throw new Error(`Failed to fetch member with profiles: ${error.message}`);
  }
}

interface ParamsNewProfileDetails {
  userId: string;
  accountname: string;
  email: string;
  phone: string;
  shortdescription: string;
  image?: {
    binaryCode: string;
    name: string;
  };
}

export async function addNewProfile({
  userId,
  accountname,
  email,
  phone,
  shortdescription,
  image,
}: ParamsNewProfileDetails) {
  try {
    await connectToDB();

    const existingEmail = await ProfileModel.findOne({ email: email }).lean();

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    let newProfileData: any = {
      accountname,
      email,
      phone,
      shortdescription,
    };

    if (image) {
      console.log("Saving image...");
      const savedImage = await Image.create({
        binaryCode: image.binaryCode,
        name: image.name,
      });

      newProfileData.image = savedImage._id;
    }

    const newProfile = new ProfileModel(newProfileData);
    await newProfile.save();

    const member = await MemberModel.findOne({
      user: userId,
    }).lean<MemberType>();

    if (!member) {
      throw new Error("Member not found");
    }

    member.profiles.push(newProfile._id);

    await MemberModel.updateOne(
      { user: userId },
      { profiles: member.profiles }
    );

    const responseProfile = {
      _id: newProfile._id,
      accountname: newProfile.accountname,
      email: newProfile.email,
      phone: newProfile.phone,
      shortdescription: newProfile.shortdescription,
      image: newProfile.image,
    };

    return { success: true, profile: responseProfile };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to create profile: ${error.message}`,
    };
  }
}

export async function editProfile(profileId: string, profileData: any) {
  try {
    await connectToDB();

    const updatedProfile = await ProfileModel.findByIdAndUpdate(
      profileId,
      profileData,
      { new: true }
    );

    if (!updatedProfile) {
      throw new Error("Profile not found");
    }

    return { success: true, profile: updatedProfile };
  } catch (error: any) {
    throw new Error(`Failed to edit profile: ${error.message}`);
  }
}

export async function setActiveProfile(
  userId: string,
  activeProfileIndex: number
) {
  try {
    await connectToDB();

    const member = await MemberModel.findOneAndUpdate(
      { user: userId },
      { activeProfile: activeProfileIndex },
      { new: true }
    );

    if (!member) {
      throw new Error("Member not found");
    }

    return {
      success: true,
      activeProfile: member.profiles[activeProfileIndex],
    };
  } catch (error: any) {
    throw new Error(`Failed to set active profile: ${error.message}`);
  }
}

interface ParamsUpdateProfileViewData {
  profileId: string;
  authUserId: string;
}

//done convert to ProfileModel, stil need to be confirm
export async function updateProfileViewData({
  profileId,
  authUserId,
}: ParamsUpdateProfileViewData) {
  const now = new Date();
  const threeMinutesAgo = subMinutes(now, 3);

  try {
    await connectToDB();

    if (!profileId) {
      throw new Error("Profile Id not found.");
    }

    if (profileId === authUserId) {
      console.log(
        `${authUserId} view ${profileId} considered same user and not recorded.`
      );
      return null;
    }

    const profile = await ProfileModel.findOne({ _id: profileId });
    if (!profile) {
      throw new Error("Profile not found");
    }

    const lastView = profile.viewDetails.find(
      (v: { viewerId: { toString: () => string | undefined } }) =>
        v.viewerId.toString() === authUserId
    );
    if (lastView && lastView.viewedAt > threeMinutesAgo) {
      console.log(
        `${authUserId} view ${authUserId} considered spam and not recorded.`
      );
      return null;
    }

    const result = await ProfileModel.findOneAndUpdate(
      { _id: profileId },
      {
        $inc: { totalViews: 1 },
        $push: {
          viewDetails: {
            viewerId: authUserId,
            viewedAt: now,
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log("Profile View Data Updated: " + JSON.stringify(result));

    return result;
  } catch (error) {
    console.error("Failed to update Profile view data:", error);
    throw error;
  }
}

//done convert to ProfileModel but still need to be confirm
export async function fetchProfileViewDetails(
  profileId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    await connectToDB();

    if (endDate === null) {
      endDate = new Date();
    }

    const query = {
      _id: profileId,
      "viewDetails.viewedAt": { $gte: startDate, $lte: endDate },
    };
    const profile = await ProfileModel.findOne(query).select("viewDetails");

    if (!profile) {
      throw new Error("Profile not found");
    }

    const views = profile.viewDetails;
    const dayMap = new Map();

    views.forEach((view: { viewedAt: string | number | Date }) => {
      const date = new Date(view.viewedAt).toISOString().slice(0, 10);
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    const chartData = Array.from(dayMap).map(([date, count]) => ({
      date,
      totalViews: count,
    }));

    return { success: true, data: chartData };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch profile view details: ${error.message}`,
    };
  }
}

//done convert to ProfileModel but still need to be confirm
export async function fetchFollowersByDateRange(
  profileId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    await connectToDB();

    if (endDate === null) {
      endDate = new Date();
    }

    console.log("profileId: " + profileId);

    const query = {
      _id: profileId,
      "followers.followedAt": { $gte: startDate, $lte: endDate },
    };
    const profile = await ProfileModel.findOne(query).select("followers");

    if (!profile) {
      throw new Error("Profile not found");
    }

    const followers = profile.followers;

    console.log("Followers: " + JSON.stringify(followers));
    const dayMap = new Map();

    followers.forEach((follower: { followedAt: string | number | Date }) => {
      const date = new Date(follower.followedAt).toISOString().slice(0, 10);
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    const chartData = Array.from(dayMap).map(([date, count]) => ({
      date,
      totalFollowedUser: count,
    }));

    console.log("chartData: " + JSON.stringify(chartData));

    return { success: true, data: chartData };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch Follower details: ${error.message}`,
    };
  }
}

// not working
export async function fetchUser(userId: string) {
  try {
    await connectToDB();

    const db = mongoose.connection.getClient().db();
    const testCollection = db.collection("test");

    const cursor = testCollection.find({ "users.user": userId });
    const userArray = await cursor.toArray();

    console.log("User123: " + JSON.stringify(userArray));

    return userArray;
  } catch (error: any) {
    throw new Error(`Failed to fetch User: ${error.message}`);
  }
}

type CheckIfFollowingParams = {
  authActiveProfileId: string;
  accountId: string;
};

//done convert to ProfileModel
export async function checkIfFollowing({
  authActiveProfileId,
  accountId,
}: CheckIfFollowingParams): Promise<{
  success: boolean;
  isFollowing: boolean;
  message?: string;
}> {
  try {
    await connectToDB();

    const authMember = await MemberModel.findOne({
      user: authActiveProfileId,
    });

    const targetMember = await MemberModel.findOne({
      user: accountId,
    });

    const activeAuthProfile = authMember.profiles[authMember.activeProfile];

    const activeTargetProfile =
      targetMember.profiles[targetMember.activeProfile];

    const currentProfile = await ProfileModel.findOne({
      _id: activeAuthProfile,
    });

    const accountProfile = await ProfileModel.findOne({
      _id: activeTargetProfile,
    });

    if (!currentProfile || !accountProfile) {
      throw new Error("Current profile or account profile not found");
    }

    const isFollowing = currentProfile.following.includes(
      activeTargetProfile.toString()
    );

    return { success: true, isFollowing };
  } catch (error: any) {
    return {
      success: false,
      isFollowing: false,
      message: `Failed to check following status: ${error.message}`,
    };
  }
}

type CheckIfFollowerParams = {
  authUserId: string;
  accountId: string;
};

export async function checkIfFollower({
  authUserId,
  accountId,
}: CheckIfFollowerParams): Promise<{
  success: boolean;
  isFollower: boolean;
  message?: string;
}> {
  try {
    await connectToDB();

    const currentMember = await Member.findOne({ user: authUserId });
    const accountMember = await Member.findOne({ user: accountId });

    if (!currentMember || !accountMember) {
      throw new Error("Current member or account member not found");
    }

    const isFollower = currentMember.followers.some(
      (follower: any) =>
        follower.followersId.toString() === accountId.toString()
    );

    return { success: true, isFollower };
  } catch (error: any) {
    return {
      success: false,
      isFollower: false,
      message: `Failed to check follower status: ${error.message}`,
    };
  }
}

interface ParamUpdateMemberFollowData {
  authActiveProfileId: string;
  accountId: string;
  method: "FOLLOW" | "UNFOLLOW";
}

//done convert to ProfileModel but still need to be confirm
export async function updateMemberFollow({
  authActiveProfileId,
  accountId,
  method,
}: ParamUpdateMemberFollowData): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  try {
    await connectToDB();

    const now = new Date();
    const threeMinutesAgo = subMinutes(now, 3);

    const currentMemberProfile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    });
    const accountMemberProfile = await ProfileModel.findOne({ _id: accountId });

    if (!currentMemberProfile || !accountMemberProfile) {
      throw new Error("Current member profile not found");
    }

    const userUpdateTimestamps =
      accountMemberProfile.updateHistory?.filter(
        (update: any) => update.profileId.toString() === authActiveProfileId
      ) || [];
    const recentUpdatesCount = userUpdateTimestamps.filter(
      (update: any) => update.timestamp > threeMinutesAgo
    ).length;

    if (recentUpdatesCount >= 5) {
      const nextAvailableTime = addMinutes(
        userUpdateTimestamps[0].timestamp,
        3
      ).toLocaleTimeString();
      return {
        success: false,
        message: `Although We know you like this profile so much but unfortunately You have reach the modify limits for follow this profile, Please Try again in ${nextAvailableTime}.`,
      };
    }

    let updatedFollowing: string[] = currentMemberProfile.following.map(
      (f: { toString: () => any }) => f.toString()
    );
    let updateFollower = [...accountMemberProfile.followers];

    if (method.toUpperCase() === "FOLLOW") {
      if (!updatedFollowing.includes(accountId.toString())) {
        updatedFollowing.push(accountId.toString());
      }
      if (
        !updateFollower.some(
          (follower) => follower.followersId.toString() === authActiveProfileId
        )
      ) {
        updateFollower.push({
          followersId: authActiveProfileId,
          followedAt: new Date(),
        });
      }
    } else if (method.toUpperCase() === "UNFOLLOW") {
      updatedFollowing = updatedFollowing.filter((id) => id !== accountId);
      updateFollower = updateFollower.filter(
        (follower) => follower.followersId.toString() !== authActiveProfileId
      );
    }

    await Promise.all([
      ProfileModel.findByIdAndUpdate(currentMemberProfile._id, {
        following: updatedFollowing,
      }),
      ProfileModel.findByIdAndUpdate(currentMemberProfile._id, {
        followers: updateFollower,
      }),
      ProfileModel.findByIdAndUpdate(currentMemberProfile._id, {
        $push: {
          updateHistory: { profileId: authActiveProfileId, timestamp: now },
        },
      }),
    ]);

    const safeUpdatedFollower = updateFollower.map((follower) => ({
      followersId: follower.followersId.toString(),
      followedAt: follower.followedAt,
    }));

    return {
      success: true,
      data: { updatedFollowing, updateFollower: safeUpdatedFollower },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to follow/unfollow user: ${error.message}`,
    };
  }
}

export async function getLikeCount(cardId: string) {
  try {
    await connectToDB();
    const card = await Card.findById(cardId);
    if (!card) throw new Error("Card not found");
    return { success: true, likes: card.likes.length };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

interface ParamsCardLikes {
  authActiveProfileId: string;
  cardId: string;
}

//done convert to ProfileModel
export async function updateCardLikes(params: ParamsCardLikes): Promise<{
  success: boolean;
  data?: any[];
  reachedLimit: boolean;
  message?: string;
}> {
  try {
    await connectToDB();

    const now = new Date();
    const threeMinutesAgo = subMinutes(now, 3);

    const { authActiveProfileId, cardId } = params;

    const authProfileIdSanitized = authActiveProfileId.trim();

    const card = await Card.findOne({ _id: cardId });

    if (!card) {
      throw new Error("Card not found");
    }

    const userUpdateTimestamps =
      card.updateHistory?.filter(
        (update: any) => update.profileId.toString() === authActiveProfileId
      ) || [];

    const recentUpdatesCount = userUpdateTimestamps.filter(
      (update: any) => update.timestamp > threeMinutesAgo
    ).length;

    if (recentUpdatesCount >= 5) {
      const nextAvailableTime = addMinutes(
        userUpdateTimestamps[0].timestamp,
        3
      ).toLocaleTimeString();
      return {
        success: false,
        message: `Although We know you like this card so much but unfortunately You have reach the like limits for this card, Please Try again in ${nextAvailableTime}.`,
        reachedLimit: true,
      };
    }

    let update;
    const userHasLiked = card.likes.includes(authActiveProfileId);

    if (userHasLiked) {
      update = {
        $pull: { likes: authProfileIdSanitized },
        $push: {
          updateHistory: { profileId: authProfileIdSanitized, timestamp: now },
        },
      };
    } else {
      update = {
        $addToSet: { likes: authProfileIdSanitized },
        $push: {
          updateHistory: { profileId: authProfileIdSanitized, timestamp: now },
        },
      };
    }

    const updatedCard = await Card.findByIdAndUpdate(card._id, update, {
      new: true,
    });

    if (!updatedCard) {
      throw new Error("Update failed");
    }

    // update and return likes after fetch user image
    const likesDetails = await Promise.all(
      updatedCard.likes.map(async (likeId: any) => {
        const likeProfile = await ProfileModel.findOne({ _id: likeId }).select(
          "accountname image"
        );
        if (likeProfile && likeProfile.image) {
          const imageDoc = await Image.findById(likeProfile.image).select(
            "binaryCode"
          );
          return {
            profileId: likeProfile._id.toString(),
            accountname: likeProfile.accountname,
            binarycode: imageDoc ? imageDoc.binaryCode : undefined,
          };
        }
        return {
          profileId: likeProfile._id.toString(),
          accountname: likeProfile ? likeProfile.accountname : "Unknown",
          binarycode: undefined,
        };
      })
    );

    return { success: true, data: likesDetails, reachedLimit: false };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to update card likes: ${error.message}`,
      reachedLimit: false,
    };
  }
}

//done convert to ProfileModel
export async function updateAccountType(
  authActiveProfileId: string,
  accountType: string
) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("accountType");

    if (!profile) {
      throw new Error("Member not found");
    }

    profile.accountType = accountType;
    await profile.save();

    return {
      success: true,
      message: "Account type updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to update account type: ${error.message}`,
    };
  }
}

export async function getCloseFriends(authenticatedUserId: string) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({
      user: authenticatedUserId,
    }).populate({
      path: "closeFriends",
      select: "accountname image email username",
      populate: {
        path: "image",
        select: "binaryCode",
      },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    const closeFriends = member.closeFriends.map((friend: any) => ({
      _id: friend._id,
      accountname: friend.accountname,
      image: friend.image.length > 0 ? friend.image[0].binaryCode : null,
      username: friend.username,
      email: friend.email,
      isCloseFriend: true,
    }));

    console.log("Close Friends: " + JSON.stringify(closeFriends));

    return {
      success: true,
      closeFriends,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch close friends: ${error.message}`,
    };
  }
}

export async function updateCloseFriends(
  authActiveProfileId: string,
  closeFriendsIds: string[]
) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("closeFriends");

    if (!profile) {
      throw new Error("Profile not found");
    }

    profile.closeFriends = closeFriendsIds;
    await profile.save();

    return {
      success: true,
      message: "Close friends updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to update close friends: ${error.message}`,
    };
  }
}

//done convert to ProfileModel
export async function fetchProfleRole(
  authActiveProfileId: string
): Promise<{ success: boolean; data?: string; message?: string }> {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("role");

    if (!profile) {
      return { success: false, message: "Profile not found" };
    }

    return { success: true, data: profile.role };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

interface ParamsOrganizationDetails {
  businessType: string;
  businessLocation: string;
  legalBusinessName: string;
  businessRegistrationNumber: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  industry: string;
  businessWebsite: string;
  businessProductDescription: string;
  bankAccountHolder: string;
  bankName: string;
  bankAccountNumber: string;
  authActiveProfileId: string;
  createNewProfile: boolean;
  accountname?: string;
  email?: string;
  phone?: string;
  shortdescription?: string;
  profile_image?: {
    binaryCode: string;
    name: string;
  };
}

//done convert to ProfileModel but still need to be confirm
export async function signUpOrganization({
  businessType,
  businessLocation,
  legalBusinessName,
  businessRegistrationNumber,
  businessName,
  businessAddress,
  businessPhone,
  industry,
  businessWebsite,
  businessProductDescription,
  bankAccountHolder,
  bankName,
  bankAccountNumber,
  authActiveProfileId,
  createNewProfile,
  accountname,
  email,
  phone,
  shortdescription,
  profile_image,
}: ParamsOrganizationDetails): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    let profile;
    let organization;

    if (createNewProfile) {
      profile = new ProfileModel({
        accountname: accountname,
        email: email,
        phone: phone,
        shortdescription: shortdescription,
        usertype: "ORGANIZATION",
        role: "ORGANIZATION",
        onboarded: true,
      });

      if (profile_image) {
        const savedImage = await Image.create({
          binaryCode: profile_image.binaryCode,
          name: profile_image.name,
        });
        profile.image = savedImage._id;
      }

      await profile.save();

      const member = await MemberModel.findOne({
        profiles: authActiveProfileId,
      });
      if (!member) {
        return { success: false, message: "Member not found." };
      }

      member.profiles.push(profile._id);
      await member.save();
    } else {
      profile = await ProfileModel.findOne({
        _id: authActiveProfileId,
      }).populate("organization");
      if (!profile) {
        return { success: false, message: "Profile not found." };
      }

      if (profile.role.toUpperCase() === "ORGANIZATION") {
        if (profile.organization) {
          organization = await OrganizationModel.findById(profile.organization);
          if (!organization) {
            return {
              success: false,
              message: "Organization linked to the profile not found.",
            };
          }

          organization.businessType = businessType;
          organization.businessLocation = businessLocation;
          organization.businessName = businessName;
          organization.businessAddress = businessAddress;
          organization.businessPhone = businessPhone;
          organization.industry = industry;
          organization.businessWebsite = businessWebsite;
          organization.businessProductDescription = businessProductDescription;
          organization.bankAccountHolder = bankAccountHolder;
          organization.bankName = bankName;
          organization.bankAccountNumber = bankAccountNumber;

          await organization.save();
        } else {
          organization = new OrganizationModel({
            businessType,
            businessLocation,
            legalBusinessName,
            businessRegistrationNumber,
            businessName,
            businessAddress,
            businessPhone,
            industry,
            businessWebsite,
            businessProductDescription,
            bankAccountHolder,
            bankName,
            bankAccountNumber,
          });

          await organization.save();

          profile.organization = organization._id;
          profile.accountname = businessName;
          profile.shortdescription = businessProductDescription;
          await profile.save();
        }
      } else {
        profile.usertype = "ORGANIZATION";
        profile.role = "ORGANIZATION";
        profile.accountname = businessName;
        profile.shortdescription = businessProductDescription;

        // If no organization exists, create a new one
        if (!profile.organization) {
          organization = new OrganizationModel({
            businessType,
            businessLocation,
            legalBusinessName,
            businessRegistrationNumber,
            businessName,
            businessAddress,
            businessPhone,
            industry,
            businessWebsite,
            businessProductDescription,
            bankAccountHolder,
            bankName,
            bankAccountNumber,
          });

          await organization.save();
          profile.organization = organization._id;
        }

        await profile.save();
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteProfileById(
  profileId: string,
  userId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const profile = await ProfileModel.findById(profileId).populate(
      "organization"
    );
    if (!profile) {
      return { success: false, message: "Profile not found." };
    }

    const member = await MemberModel.findOne({ user: userId });
    if (!member) {
      return { success: false, message: "Member not found." };
    }

    member.profiles = member.profiles.filter(
      (p: { toString: () => string }) => p.toString() !== profileId
    );
    await member.save();

    if (profile.organization) {
      await OrganizationModel.findByIdAndDelete(profile.organization._id);
    }

    if (profile.image) {
      await Image.findByIdAndDelete(profile.image);
    }

    await ProfileModel.findByIdAndDelete(profileId);

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

interface ParamsUpdWebURL {
  authUserId: string;
  url: string;
}

export async function updateOrganizationUrl(
  params: ParamsUpdWebURL
): Promise<void> {
  try {
    await connectToDB();

    const { authUserId, url } = params;
    const currentMember = await Member.findOne({ user: authUserId });

    if (!currentMember) {
      throw new Error("Current member not found");
    }

    if (currentMember.usertype.toUpperCase() !== "ORGANIZATION") {
      throw new Error("Current member isn't Organization owner.");
    }

    const organization = await OrganizationModel.findOne({
      organizationID: currentMember._id,
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    organization.businessWebsite = url;

    await organization.save();
  } catch (error: any) {
    throw new Error(`Failed to update weburl: ${error.message}`);
  }
}

//not using
export async function uploadImageToGridFS(
  file: File,
  filename: string
): Promise<string> {
  try {
    await connectToDB();

    const db = mongoose.connection.getClient().db();
    const bucket = new GridFSBucket(db);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(filename);
    const uploadPromise = new Promise<string>((resolve, reject) => {
      uploadStream.once("finish", () => {
        resolve(uploadStream.id.toString());
      });
      uploadStream.once("error", (err) => {
        reject("Something went wrong: " + err);
      });
    });

    readableStream.pipe(uploadStream);

    return await uploadPromise;
  } catch (error: any) {
    throw new Error(`Failed to upload image to GridFS: ${error.message}`);
  }
}

interface ParamsMemberDetails {
  userId: string;
  profileId: string;
  accountname: string;
  email: string;
  password: string;
  phone: string;
  shortdescription: string;
  ip_address: string;
  country?: string;
  countrycode?: string;
  image?: {
    binaryCode: string;
    name: string;
  };
  path: string;
}

type UpdateMemberData = {
  email: string;
  password: string;
  phone: string;
  ip_address: string;
  country?: string;
  countrycode?: string;
};

type UpdateProfileData = {
  accountname: string;
  shortdescription: string;
  image?: any;
  onboarded: boolean;
};

//done convert to ProfileModel but still need to be confirm
export async function updateMemberDetails({
  userId,
  profileId,
  accountname,
  email,
  password,
  phone,
  shortdescription,
  ip_address,
  country,
  countrycode,
  image,
  path,
}: ParamsMemberDetails): Promise<void> {
  try {
    await connectToDB();

    const existingEmail = await Member.findOne({ email: email });
    if (existingEmail && path != "/profile/edit") {
      throw new Error("User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let updateMemberData: UpdateMemberData;
    let updateProfileData: UpdateProfileData;

    if (image) {
      const savedImage = await Image.create({
        binaryCode: image.binaryCode,
        name: image.name,
      });
      const imageId = savedImage._id;
      updateProfileData = {
        accountname: accountname,
        shortdescription: shortdescription,
        image: imageId,
        onboarded: true,
      };

      updateMemberData = {
        email: email,
        password: hashedPassword,
        phone: phone,
        ip_address: ip_address,
      };
    } else {
      updateProfileData = {
        accountname: accountname,
        shortdescription: shortdescription,
        onboarded: true,
      };

      updateMemberData = {
        email: email,
        password: hashedPassword,
        phone: phone,
        ip_address: ip_address,
      };
    }

    if (path !== "/profile/edit") {
      updateMemberData.country = country;
      updateMemberData.countrycode = countrycode;
    }

    await Member.findOneAndUpdate({ user: userId }, updateMemberData, {
      upsert: true,
    });

    await ProfileModel.findOneAndUpdate({ _id: profileId }, updateProfileData, {
      upsert: true,
    });

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

// interface ParamsUpdateCardViewData {
//     userId?: string;
//     cardId: string;
// }

// export async function updateCardViewData({
//     userId, cardId
// }: ParamsUpdateCardViewData) {
//     try {
//         await connectToDB();

//         const now = new Date();
//         const threeMinutesAgo = subMinutes(now, 3);

//         const currentMember = await Member.findOne({ user: authUserId });
//         const accountMember = await Member.findOne({ user: accountId });

//         if (!currentMember || !accountMember) {
//             throw new Error("Current member not found");
//         }

//         const userUpdateTimestamps =
//             accountMember.updateHistory?.filter(
//                 (update: any) => update.userId.toString() === authUserId
//             ) || [];
//         const recentUpdatesCount = userUpdateTimestamps.filter(
//             (update: any) => update.timestamp > threeMinutesAgo
//         ).length;

//         if (recentUpdatesCount >= 5) {
//             const nextAvailableTime = addMinutes(
//                 userUpdateTimestamps[0].timestamp,
//                 3
//             ).toLocaleTimeString();
//             return {
//                 success: false,
//                 message: `Although We know you like this profile so much but unfortunately You have reach the modify limits for follow this profile, Please Try again in ${nextAvailableTime}.`,
//             };
//         }

//         let updatedFollowing: string[] = currentMember.following.map(
//             (f: { toString: () => any }) => f.toString()
//         );
//         let updateFollower = [...accountMember.followers];

//         if (method.toUpperCase() === "FOLLOW") {
//             if (!updatedFollowing.includes(accountId.toString())) {
//                 updatedFollowing.push(accountId.toString());
//             }
//             if (
//                 !updateFollower.some(
//                     (follower) => follower.followersId.toString() === authUserId
//                 )
//             ) {
//                 updateFollower.push({
//                     followersId: authUserId,
//                     followedAt: new Date(),
//                 });
//             }
//         } else if (method.toUpperCase() === "UNFOLLOW") {
//             updatedFollowing = updatedFollowing.filter((id) => id !== accountId);
//             updateFollower = updateFollower.filter(
//                 (follower) => follower.followersId.toString() !== authUserId
//             );
//         }

//         await Promise.all([
//             Member.findByIdAndUpdate(currentMember._id, {
//                 following: updatedFollowing,
//             }),
//             Member.findByIdAndUpdate(accountMember._id, {
//                 followers: updateFollower,
//             }),
//             Member.findByIdAndUpdate(accountMember._id, {
//                 $push: { updateHistory: { userId: authUserId, timestamp: now } },
//             }),
//         ]);

//         const safeUpdatedFollower = updateFollower.map((follower) => ({
//             followersId: follower.followersId.toString(),
//             followedAt: follower.followedAt,
//         }));

//         return {
//             success: true,
//             data: { updatedFollowing, updateFollower: safeUpdatedFollower },
//         };
//     } catch (error: any) {
//         return {
//             success: false,
//             message: `Failed to follow/unfollow user: ${error.message}`,
//         };
//     }
// }

interface ParamsMemberDetails {
  userId: string;
  accountname: string;
  email: string;
  password: string;
  phone: string;
  shortdescription: string;
  ip_address: string;
  country?: string;
  countrycode?: string;
  image?: {
    binaryCode: string;
    name: string;
  };
  path: string;
}

interface ParamsUpdateCardViewData {
  authActiveProfileId?: string;
  cardId: string;
}

//done convert to ProfileModel but still need to be confirm
export async function updateCardViewData({
  authActiveProfileId,
  cardId,
}: ParamsUpdateCardViewData) {
  const now = new Date();
  const threeMinutesAgo = subMinutes(now, 3);

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    const lastView = card.viewDetails.find(
      (v: { viewerId: { toString: () => string | undefined } }) =>
        v.viewerId.toString() === authActiveProfileId
    );
    if (lastView && lastView.viewedAt > threeMinutesAgo) {
      console.log(
        `${authActiveProfileId} view ${cardId} considered spam and not recorded.`
      );
      return null;
    }

    const today = startOfDay(new Date());
    const result = await Card.findByIdAndUpdate(
      cardId,
      {
        $inc: { totalViews: 1 },
        $push: {
          viewDetails: {
            viewerId: authActiveProfileId,
            viewedAt: now,
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return result;
  } catch (error) {
    console.error("Failed to update card view data:", error);
    throw error;
  }
}

export async function fetchCardViewDetails(
  cardId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    await connectToDB();

    if (endDate === null) {
      endDate = new Date();
    }

    const query = {
      _id: cardId,
      "viewDetails.viewedAt": { $gte: startDate, $lte: endDate },
    };
    const card = await Card.findOne(query).select("viewDetails");

    if (!card) {
      throw new Error("Card not found");
    }

    const views = card.viewDetails;
    const dayMap = new Map();

    views.forEach((view: { viewedAt: string | number | Date }) => {
      const date = new Date(view.viewedAt).toISOString().slice(0, 10);
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    const chartData = Array.from(dayMap).map(([date, count]) => ({
      date,
      totalViews: count,
    }));

    return { success: true, data: chartData };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch card view details: ${error.message}`,
    };
  }
}

//done convert to ProfileModel but still need to be confirm
export async function fetchOnlyCardId(profileId: string) {
  try {
    await connectToDB();

    const cardId = await ProfileModel.findOne({ _id: profileId }).select(
      "cards"
    );
    const cardWithTitle = await Card.find({
      _id: { $in: cardId.cards },
    }).select("title");

    return cardWithTitle;
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
}

//done convert but still need to be confirm
export async function fetchPersonalCards(profileId: string) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({ _id: profileId });

    if (!profile) {
      throw new Error(`Profile with ID ${profile} not found.`);
    }

    if (!profile.cards) {
      throw new Error(`Profile with ID ${profile} has no cards.`);
    }

    const cards = await Card.find({
      _id: { $in: profile.cards },
    });

    const cardsData = await Promise.all(
      cards.map(async (card) => {
        const creator = await ProfileModel.findOne({
          _id: card.creator,
        }).select("accountname image");
        const creatorImage = await Image.findOne({ _id: creator.image }).select(
          "binaryCode"
        );
        const creatorData = {
          accountname: creator ? creator.accountname : "Unknown",
          image: creator && creatorImage ? creatorImage.binaryCode : undefined,
        };

        // const componentInCard = await Card.findOne({ _id: card }).select('components');
        const lineComponents = await Card.findOne({ _id: card }).select(
          "lineFormatComponent"
        );

        const likesDetails = await Promise.all(
          card.likes.map(async (likeId: any) => {
            const likeProfile = await ProfileModel.findOne({
              _id: likeId,
            }).select("accountname image");

            if (likeProfile && likeProfile.image) {
              const imageDoc = await Image.findById(likeProfile.image).select(
                "binaryCode"
              );
              return {
                profileId: likeProfile._id.toString(),
                accountname: likeProfile.accountname,
                binarycode: imageDoc ? imageDoc.binaryCode : undefined,
              };
            }
            return {
              profileId: likeProfile ? likeProfile._id.toString() : "Unknown",
              accountname: likeProfile ? likeProfile.accountname : "Unknown",
              binarycode: undefined,
            };
          })
        );

        const flexFormatHTML = await Card.findOne({ _id: card }).select(
          "flexFormatHtml"
        );

        const followers = await Promise.all(
          card.followers.map((id: any) =>
            ProfileModel.find({ _id: id }).select("accountname")
          )
        );
        // const followersImage = await Promise.all(card.followers.map((id: any) => MemberModel.findById(id).select('image')));
        // const followersImageBinary = await Promise.all(followersImage.map((image: any) => Image.find(image.image).select('binaryCode')));
        // const components = await ComponentModel.findOne({ _id: componentInCard.components }).select('content');
        const lineFormatComponent = await ComponentModel.findOne({
          _id: lineComponents.lineFormatComponent,
        }).select("content");
        const flexFormatHTMLContent = await ComponentModel.findOne({
          _id: flexFormatHTML.flexFormatHtml,
        }).select("content");

        return {
          cardId: card._id.toString(),
          title: card.title,
          creator: creatorData,
          likes: likesDetails,
          followers: followers.map((follower) => ({
            accountname: follower.accountname,
          })),
          // components: {
          //     content: components ? components.content : undefined,
          // },
          lineComponents: {
            content: lineFormatComponent
              ? lineFormatComponent.content
              : undefined,
          },
          flexHtml: {
            content: flexFormatHTMLContent
              ? flexFormatHTMLContent.content
              : undefined,
          },
        };
      })
    );

    return cardsData;
  } catch (error) {
    console.error("Error fetching personal cards:", error);
    throw error;
  }
}

//done convert strucutre
export async function fetchAllCards() {
  try {
    await connectToDB();

    const cards = await Card.find();

    const cardsData = await Promise.all(
      cards.map(async (card) => {
        const creator = await ProfileModel.findOne({
          _id: card.creator,
        }).select("accountname image");
        const creatorImage = await Image.findOne({ _id: creator.image }).select(
          "binaryCode"
        );
        const creatorData = {
          accountname: creator ? creator.accountname : "Unknown",
          image: creator && creatorImage ? creatorImage.binaryCode : undefined,
        };

        const lineComponents = await Card.findOne({ _id: card }).select(
          "lineFormatComponent"
        );

        const likesDetails = await Promise.all(
          card.likes.map(async (likeId: any) => {
            const likeUser = await ProfileModel.findOne({ _id: likeId }).select(
              "accountname image"
            );
            if (likeUser && likeUser.image) {
              const imageDoc = await Image.findById(likeUser.image).select(
                "binaryCode"
              );
              return {
                // userId: likeUser.user.toString(),
                accountname: likeUser.accountname,
                binarycode: imageDoc ? imageDoc.binaryCode : undefined,
              };
            }
            return {
              // userId: likeUser.user.toString(),
              accountname: likeUser ? likeUser.accountname : "Unknown",
              binarycode: undefined,
            };
          })
        );

        const flexFormatHTML = await Card.findOne({ _id: card }).select(
          "flexFormatHtml"
        );

        const followers = await Promise.all(
          card.followers.map((id: any) =>
            ProfileModel.find({ _id: id }).select("accountname")
          )
        );

        const lineFormatComponent = await ComponentModel.findOne({
          _id: lineComponents.lineFormatComponent,
        }).select("content");
        const flexFormatHTMLContent = await ComponentModel.findOne({
          _id: flexFormatHTML.flexFormatHtml,
        }).select("content");

        return {
          cardId: card._id.toString(),
          title: card.title,
          creator: creatorData,
          likes: likesDetails,
          followers: followers.map((follower) => ({
            accountname: follower.accountname,
          })),
          lineComponents: {
            content: lineFormatComponent
              ? lineFormatComponent.content
              : undefined,
          },
          flexHtml: {
            content: flexFormatHTMLContent
              ? flexFormatHTMLContent.content
              : undefined,
          },
        };
      })
    );

    return cardsData;
  } catch (error) {
    console.error("Error fetching all cards:", error);
    throw error;
  }
}

interface ProfileDetails {
  accountname: string;
  image: string | null;
}

interface CommentWithReplies {
  _id: string;
  commentID: string;
  comment: string;
  commentBy: ProfileDetails | null;
  commentDate: Date;
  likes: string[];
  replies: CommentWithReplies[];
}

async function getProfileDetails(
  profileId: string
): Promise<ProfileDetails | null> {
  const profile: any = await ProfileModel.findOne({ _id: profileId })
    .select("user accountname image")
    .lean();
  if (profile && Array.isArray(profile.image) && profile.image.length > 0) {
    const image: any = await Image.findById(profile.image[0])
      .select("binaryCode")
      .lean();
    profile.image = image ? image.binaryCode : null;
  } else {
    profile.image = null;
  }
  return profile;
}

//done convert to CommentModel but still need to be confirm
async function getCommentDetails(
  commentId: string
): Promise<CommentWithReplies | null> {
  const comment: any = await CommentModel.findById(commentId).lean();
  if (!comment) {
    return null;
  }

  const memberDetails = await getProfileDetails(comment.commentBy);
  const replies = await Promise.all(
    (comment.replies || []).map(async (replyId: string) => {
      return await getCommentDetails(replyId);
    })
  );

  const likesDetails = await Promise.all(
    (comment.likes || []).map(async (likeId: string) => {
      return await getProfileDetails(likeId);
    })
  );

  return {
    ...comment,
    commentBy: memberDetails,
    likes: likesDetails.filter((like) => like !== null),
    replies: replies.filter((reply) => reply !== null),
  } as CommentWithReplies;
}

export async function fetchComments(
  cardId: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    await connectToDB();

    const card: any = await Card.findById(cardId)
      .select("comments")
      .populate({
        path: "comments",
        model: "Comment",
      })
      .lean();

    if (!card) {
      return { success: false, message: "Card not found" };
    }

    if (!Array.isArray(card.comments)) {
      return { success: false, message: "Comments not found" };
    }

    const commentsWithDetails = await Promise.all(
      card.comments.map(async (comment: any) => {
        return await getCommentDetails(comment._id);
      })
    );

    return {
      success: true,
      data: commentsWithDetails.filter((comment) => comment !== null),
    };
  } catch (error: any) {
    console.log("error: ", error.message);
    return { success: false, message: error.message };
  }
}

//done convert to CommentModel but still need to be confirm
export async function addComment(
  cardId: string,
  authActiveProfileId: string,
  commentText: string
): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    await connectToDB();

    const newComment = new CommentModel({
      commentID: generateCustomID(),
      comment: commentText,
      commentBy: authActiveProfileId,
    });

    await newComment.save();

    const profileInfo = await getProfileDetails(newComment.commentBy);

    const replyWithUserDetails = {
      ...newComment.toObject(),
      commentBy: profileInfo,
    };

    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error("Card not found");
    }
    card.comments.push(newComment._id);

    await card.save();

    return { success: true, data: replyWithUserDetails };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

//done convert to CommentModel but still need to be confirm
export async function likeComment(
  commentId: string,
  authActiveProfileId: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    await connectToDB();

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    const userIdStr = authActiveProfileId.toString();

    if (
      !comment.likes
        .map((like: { toString: () => string }) => like.toString())
        .includes(userIdStr)
    ) {
      comment.likes.push(authActiveProfileId);
    } else {
      comment.likes = comment.likes.filter(
        (like: any) => like.toString() !== userIdStr
      );
    }

    await comment.save();

    const updatedComment: any = await CommentModel.findById(commentId).lean();

    const likesDetails = await Promise.all(
      (updatedComment.likes || []).map(async (likeId: string) => {
        return await getProfileDetails(likeId);
      })
    );

    const updatedCommentWithLikes = {
      ...updatedComment,
      likes: likesDetails.filter((like) => like !== null),
    };

    return { success: true, data: updatedCommentWithLikes };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

//done convert to CommentModel but still need to be confirm
export async function addReply(
  commentId: string,
  authActiveProfileId: string,
  replyText: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    await connectToDB();

    const newReply = new CommentModel({
      commentID: generateCustomID(),
      comment: replyText,
      commentBy: authActiveProfileId,
    });

    await newReply.save();

    const profileInfo = await getProfileDetails(newReply.commentBy);

    const replyWithUserDetails = {
      ...newReply.toObject(),
      commentBy: profileInfo,
    };

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return { success: false, message: "Comment not found." };
    }

    comment.replies.push(newReply._id);
    await comment.save();

    return { success: true, data: replyWithUserDetails };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function fetchProductPlanLimitedCardQuantity(
  productId: string
): Promise<number> {
  try {
    await connectToDB();

    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    return product.limitedCard;
  } catch (error: any) {
    console.error("Error fetching product plan limited card quantity:", error);
    throw error;
  }
}

// done convert to ProfileModel but still need to be confirm
export async function fetchMemberProfileCardsLength(
  profileId: string
): Promise<number> {
  try {
    await connectToDB();

    const member = await ProfileModel.findOne({ _id: profileId }).populate(
      "cards"
    );

    if (!member) {
      throw new Error("Member not found");
    }

    return member.cards.length;
  } catch (error: any) {
    console.error("Error fetching member cards length:", error);
    throw error;
  }
}

interface FeedbackProps {
  selectedReasons: string[];
  otherReason: string;
  hasUsedSimilar: boolean;
  similarAppName: string;
  feedbackComment: string;
  isSkip: boolean;
  profileId: string;
}

// done convert to FeedbackModel but still need to be confirm
export async function submitFeedback({
  selectedReasons,
  otherReason,
  hasUsedSimilar,
  similarAppName,
  feedbackComment,
  isSkip,
  profileId,
}: FeedbackProps): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDB();

    const feedback = new FeedbackModel({
      selectedReasons,
      otherReason,
      hasUsedSimilar,
      similarAppName,
      feedbackComment,
      isSkip,
      feedbackDate: new Date(),
      feedbackBy: profileId,
    });

    await feedback.save();

    return { success: true, message: "Feedback submitted successfully" };
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return { success: false, message: error.message };
  }
}

interface ParamsSendFlexMessage {
  userId: string;
  flexContent: string;
}

export async function sendFlexMessageThruOA({
  userId,
  flexContent,
}: ParamsSendFlexMessage): Promise<{ success: boolean; message: string }> {
  const url = "https://api.line.me/v2/bot/message/push";
  const channelAccessToken = process.env.MESSAGING_LINE_CHANNEL_AT;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${channelAccessToken}`,
  };

  if (typeof flexContent === "string") {
    try {
      flexContent = JSON.parse(flexContent);
    } catch (error) {
      console.error("Error parsing flexContent:", error);
      return {
        success: false,
        message: "Something went wrong, Please try again later.",
      };
    }
  }

  const data = {
    to: userId,
    messages: [
      {
        type: "flex",
        altText: "This is a Flex Message",
        contents: flexContent,
      },
    ],
  };

  const JSONData = JSON.stringify(data);

  try {
    const response = await axios.post(url, JSONData, { headers });
    // console.log('Message sent:', response.data);
    return {
      success: true,
      message: "Card has been shared successfully, Please check your LINE.",
    };
  } catch (error: any) {
    console.error(
      "Error sharing Card Line:",
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      message: "Failed to share card to LINE, Please try again later.",
    };
  }
}

// done convert to ProfileModel but still need to be confirm
export async function fetchDashboardData({ profileId }: { profileId: string }) {
  try {
    await connectToDB();

    const cardDashboard = await ProfileModel.findOne({ _id: profileId }).select(
      "cards totalViews followers"
    );

    if (!cardDashboard) {
      throw new Error("Member not found");
    }

    const quantityOfCard = cardDashboard.cards.length;
    const profileViews = cardDashboard.totalViews;
    const totalFollowers = cardDashboard.followers.length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const cardsLastWeek = await Card.find({
      creator: profileId,
      createdAt: { $gte: sevenDaysAgo },
    }).countDocuments();

    const profileViewsLastWeek = await ProfileModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(cardDashboard._id) } },
      { $unwind: "$viewDetails" },
      { $match: { "viewDetails.viewedAt": { $gte: sevenDaysAgo } } },
      { $group: { _id: null, totalViews: { $sum: 1 } } },
    ]);

    const totalFollowersLastWeek = await ProfileModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(cardDashboard._id) } },
      { $unwind: "$followers" },
      { $match: { "followers.followedAt": { $gte: sevenDaysAgo } } },
      { $group: { _id: null, totalFollowers: { $sum: 1 } } },
    ]);

    return {
      memberCardQuantity: quantityOfCard,
      profileViews: profileViews,
      followersIncrease: totalFollowers,
      cardsLastWeek: cardsLastWeek,
      profileViewsLastWeek: profileViewsLastWeek[0]?.totalViews || 0,
      totalFollowersLastWeek: totalFollowersLastWeek[0]?.totalFollowers || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

// cannot run on server side
export async function sendFlexMessageLiff(flexContent: string) {
  try {
    const liffId = process.env.LIFF_LINE_CLIENT_ID;

    await liff.init({ liffId: liffId! });
    if (liff.isInClient()) {
      await liff.shareTargetPicker([
        {
          type: "flex",
          altText: "This is a Flex Message",
          contents: JSON.parse(flexContent),
        },
      ]);
      return {
        success: true,
        message: "Card has been shared successfully, Please check your LINE.",
      };
    } else {
      return {
        success: false,
        message: "Failed to share card to LINE, Please open in Line app.",
      };
    }
  } catch (error: any) {
    console.log("Error sharing Card Line:", error.message);
    return {
      success: false,
      message: "Failed to share card to LINE, Please try again later.",
    };
  }
}

import { MongoClient } from "mongodb";
import { Friend, User } from "@/types";
import ProfileModel from "../models/profile";

// get all possible member // need to remove this
export async function fetchAllMembers() {
  try {
    const uri = process.env.MONGODB_URL || "your-mongodb-connection-string";

    const client = new MongoClient(uri);

    // db name
    const db = client.db("test");

    //collection
    const collection = db.collection("members");

    // fetch all members
    const members = await collection.find({}).toArray();

    await client.close();

    return members;
  } catch (error: any) {
    throw new Error(`Failed to fetch member: ${error.message}`);
  }
}

// fetch all user(public and private)
export async function fetchAllUser(authenticatedUserId: string) {
  try {
    await connectToDB();

    // fetch all member no matter public and private
    const members = await MemberModel.find({});

    const userIds = members
      .map((member) => member.user.toString())
      .filter((userId) => userId !== authenticatedUserId);

    // filter out the current userId
    const users = await UserModel.find({
      _id: { $in: userIds },
    }).select("name");

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const member = members.find(
          (member) => member.user.toString() === user._id.toString()
        );

        // get the current active profile
        const activeProfile = await ProfileModel.findOne(
          member.profiles[member.activeProfile]
        );

        let imgUrl = null;
        if (
          activeProfile &&
          activeProfile.image &&
          activeProfile.image.length > 0
        ) {
          const imageRecord = await Image.findOne({
            _id: activeProfile?.image,
          }).select("binaryCode");

          imgUrl = imageRecord?.binaryCode || null;
        }

        return {
          userId: user._id.toString(),
          name: user.name,
          accountType: activeProfile?.accountType || "PUBLIC",
          image: imgUrl,
        };
      })
    );

    return {
      success: true,
      message: "Succesfully fetch the followers",
      users: usersWithDetails,
    };
  } catch (error: any) {
    console.error(`Failed to fetch users: ${error.message}`);
    return {
      success: false,
      message: `Failed to fetch users: ${error.message}`,
      users: [],
    };
  }
}

// send friend request
export async function sendFriendRequest(senderId: string, receiverId: string) {
  try {
    await connectToDB();

    const sender = await UserModel.findById(senderId);

    const receiver = await UserModel.findById(receiverId);

    // console.log("sender:" + sender + "receiver:" + receiver);

    if (!sender) {
      throw new Error("Sender not found");
    }

    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const friendRequest = new FriendRequestModel({
      sender: senderId,
      receiver: receiverId,
      status: 1,
    });

    // console.log("request:" + friendRequest);
    await friendRequest.save();

    return { success: true, message: "Friend request sent successfully" };
  } catch (error: any) {
    console.error("Error sending friend request:", error);
    return { success: false, message: error.message };
  }
}

// check friend request status
export async function getFriendRequestStatus(
  senderId: string,
  receiverId: string
) {
  try {
    await connectToDB();

    const friendRequest = await FriendRequestModel.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    // console.log("friend request:" + friendRequest);

    if (friendRequest) {
      return {
        success: true,
        message: "Friend request found",
        status: friendRequest.status,
      };
    } else {
      return { success: false, message: "No friend request found" };
    }
  } catch (error: any) {
    console.error("Error checking friend request status:", error);
    return { success: false, message: error.message };
  }
}

// get current user all friend request
export async function getCurrentUserAllFriendRequest(authenticatedId: string) {
  try {
    await connectToDB();

    const allFriendRequests = await FriendRequestModel.find({
      receiver: authenticatedId,
    }).lean();

    const friendRequestWithSenderName = await Promise.all(
      allFriendRequests.map(async (friendRequest) => {
        const senderId = friendRequest.sender.toString();
        const senderUser: User | null = await UserModel.findById(
          senderId
        ).lean();
        const senderName = senderUser ? senderUser.name : "Unknown";

        return {
          ...friendRequest,
          senderName,
        };
      })
    );

    // console.log(
    //   "friend request:" + JSON.stringify(friendRequestWithSenderName, null, 2)
    // );

    if (friendRequestWithSenderName.length > 0) {
      return {
        success: true,
        friendRequests: friendRequestWithSenderName,
        length: friendRequestWithSenderName,
      };
    } else {
      return { success: false, message: "No Friend Requests found", length: 0 };
    }
  } catch (error: any) {
    console.error(
      "Error checking current user's friend request status:",
      error
    );
    return { success: false, message: error.message };
  }
}

// get each user's friend
export async function getUserFriend(authenticatedId: string) {
  try {
    await connectToDB();

    const userFriends: Friend[] = await FriendModel.find({
      $or: [{ userA: authenticatedId }, { userB: authenticatedId }],
    }).lean();

    const friendsWithUserData = await Promise.all(
      userFriends.map(async (friend) => {
        const friendUserId =
          friend.userA.toString() === authenticatedId
            ? friend.userB.toString()
            : friend.userA.toString();

        const friendUser = await UserModel.findById(friendUserId).lean();

        return {
          ...friend,
          friendUser: friendUser as User,
        };
      })
    );

    // console.log("data:" + JSON.stringify(friendsWithUserData, null, 2));

    if (friendsWithUserData.length > 0) {
      return {
        success: true,
        message: "Friend found",
        friends: friendsWithUserData,
      };
    } else {
      return { success: false, message: "No friend found" };
    }
  } catch (error: any) {
    console.error("Error checking friend request status:", error);
    return { success: false, message: error.message };
  }
}

// accept friend request handler & let the user follow each other
export async function acceptFriendRequest(
  authenticatedId: string,
  otherUserId: string,
  friendRequestId: string
) {
  try {
    await connectToDB();

    console.log(authenticatedId);
    console.log(friendRequestId);

    const updatedFriendRequest = await FriendRequestModel.findByIdAndUpdate(
      friendRequestId,
      { status: 2 },
      { new: true }
    );

    if (updatedFriendRequest) {
      console.log(updatedFriendRequest);

      const userA = updatedFriendRequest.sender;
      const userB = updatedFriendRequest.receiver;

      // insert into friendmodel
      const newFriend = await FriendModel.create({
        userA: userA,
        userB: userB,
      });

      console.log("New Friend Entry: ", newFriend);

      // authenticated user follows the other user
      const followResultOne = await MemberModel.findOneAndUpdate(
        { user: authenticatedId },
        { $addToSet: { following: otherUserId } }
      );

      // authenticated user is followd by the other user
      const followResultThree = await MemberModel.findOneAndUpdate(
        { user: authenticatedId },
        {
          $addToSet: {
            followers: { followersId: otherUserId, followedAt: new Date() },
          },
        }
      );

      // other user follow the authenticated user
      const followResultTwo = await MemberModel.findOneAndUpdate(
        { user: otherUserId },
        { $addToSet: { following: authenticatedId } }
      );

      // other user is follwoed by authenticated user
      const followResultFour = await MemberModel.findOneAndUpdate(
        { user: otherUserId },
        {
          $addToSet: {
            followers: { followersId: authenticatedId, followedAt: new Date() },
          },
        }
      );

      return {
        success: true,
        message: "Friend request accepted and added to friends list",
        friendRequest: updatedFriendRequest,
        newFriend: newFriend,
      };
    } else {
      return { success: false, message: "Friend request not found" };
    }
  } catch (error: any) {
    console.error("Error accepting friend request:", error);
    return { success: false, message: error.message };
  }
}

// decline friend request handler
export async function declineFriendRequest(friendRequestId: string) {
  try {
    await connectToDB();

    // console.log(friendRequestId);
    const updatedFriendRequest = await FriendRequestModel.findByIdAndUpdate(
      friendRequestId,
      { status: 0 },
      { new: true }
    );

    if (updatedFriendRequest) {
      console.log(updatedFriendRequest);

      return {
        success: true,
        message: "Decline Friend Request succesfully!",
        friendRequest: updatedFriendRequest,
      };
    } else {
      return { success: false, message: "Friend request not found" };
    }
  } catch (error: any) {
    console.error("Error decline friend request:", error);
    return { success: false, message: error.message };
  }
}

// unfriend handler
export async function unfriendFriend(
  authenticatedId: string,
  friendRequestId: string
) {
  try {
    await connectToDB();

    // console.log("authenticatedId:" + authenticatedId);
    // console.log("friendRequestId:" + friendRequestId);

    const friendRelation = await FriendModel.findOneAndDelete({
      $or: [
        { userA: authenticatedId, userB: friendRequestId },
        { userA: friendRequestId, userB: authenticatedId },
      ],
    });

    console.log(friendRelation);

    if (!friendRelation) {
      return { success: false, message: "Friend relation not found" };
    }

    return { success: true, message: "Successfully unfriended" };
  } catch (error: any) {
    console.error("Error when unfriending:", error);
    return { success: false, message: error.message };
  }
}

// unfollow existing friend
export async function unfollowFriend(
  authenticatedId: string,
  friendRequestId: string
) {
  try {
    await connectToDB();

    // authenticated user remove the follwing
    const removeFollowingFromCurrentUser = await MemberModel.findOneAndUpdate(
      { user: authenticatedId },
      { $pull: { following: friendRequestId } }
    );

    const removeFollowerFromTargetUser = await MemberModel.findOneAndUpdate(
      { user: friendRequestId },
      { $pull: { followers: { followersId: authenticatedId } } }
    );

    return {
      success: true,
      message: "Successfully unfollowed the user",
    };
  } catch (error: any) {
    console.error("Error when unfollowing:", error);
    return { success: false, message: error.message };
  }
}

// unfollow before but still friend, want to follow back
export async function followFriend(authenticatedId: string, friendId: string) {
  try {
    await connectToDB();

    const followFromAuthUser = await MemberModel.findOneAndUpdate(
      { user: authenticatedId },
      { $addToSet: { following: friendId } }
    );

    // console.log("followFromAuthUser" + followFromAuthUser);

    const followingFromOtherUser = await MemberModel.findOneAndUpdate(
      { user: friendId },
      {
        $addToSet: {
          followers: { followersId: authenticatedId, followedAt: new Date() },
        },
      }
    );

    // console.log("followingFromOtherUser" + followingFromOtherUser);

    return { success: true, message: "Successfully followed" };
  } catch (error: any) {
    console.error("Error following user:", error);
    return { success: false, message: error.message };
  }
}

// get follow status of each friend
export async function getFollowStatus(
  authenticatedId: string,
  friendId: string
) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({ user: authenticatedId });
    // console.log("member" + member);
    const isFollowing = member.following.includes(friendId);
    console.log("isFollwing" + isFollowing);

    return { success: true, isFollowing };
  } catch (error: any) {
    console.error("Error fetching follow status:", error);
    return { success: false, message: error.message, isFollowing: false };
  }
}

export async function getFollowers(authActiveProfileId: string) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("followers closeFriends");

    const followersDetails = await Promise.all(
      profile.followers.map(async (follower: any) => {
        const followerDetails = await ProfileModel.findOne({
          _id: follower.followersId,
        }).select("accountname image");
        const imageDoc = await Image.findById(followerDetails.image[0])
          .select("binaryCode")
          .lean();

        return {
          _id: followerDetails._id,
          accountname: followerDetails.accountname,
          image: followerDetails.image.length > 0 ? imageDoc : null,
          isCloseFriend: profile.closeFriends.some(
            (closeFriend: any) =>
              closeFriend.toString() === followerDetails._id.toString()
          ),
        };
      })
    );

    return {
      success: true,
      followers: followersDetails,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch followers: ${error.message}`,
    };
  }
}

export async function getBlockedAccounts(authActiveProfileId: string) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("blockedAccounts");

    if (!profile) {
      throw new Error("Profile not found");
    }

    const blockedDetails = await Promise.all(
      profile.blockedAccounts.map(async (blockedAccountId: any) => {
        // if (member.followers.some((follower: any) => follower.followersId.toString() === blockedAccountId.toString())) {
        //     return null;
        // }

        const blockedDetails = await ProfileModel.findById(
          blockedAccountId
        ).select("accountname image");

        const imageDoc =
          blockedDetails.image.length > 0
            ? await Image.findById(blockedDetails.image[0])
                .select("binaryCode")
                .lean()
            : null;

        return {
          _id: blockedDetails._id,
          accountname: blockedDetails.accountname,
          image: imageDoc ? imageDoc : null,
          isBlocked: true,
        };
      })
    );

    const validBlockedDetails = blockedDetails.filter(
      (detail) => detail !== null
    );

    return {
      success: true,
      blockedAccounts: validBlockedDetails,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch blocked accounts: ${error.message}`,
    };
  }
}

export async function unblockAccount(
  authActiveProfileId: string,
  blockedAccountId: string
) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({ _id: authActiveProfileId });

    if (!profile) {
      throw new Error("Profile not found");
    }

    profile.blockedAccounts = profile.blockedAccounts.filter(
      (id: any) => id.toString() !== blockedAccountId
    );

    await profile.save();

    return {
      success: true,
      message: "Account unblocked successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to unblock account: ${error.message}`,
    };
  }
}

export async function getMutedAccounts(authActiveProfileId: string) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("mutedAccounts");

    if (!profile) {
      throw new Error("Profile not found");
    }

    const mutedDetails = await Promise.all(
      profile.mutedAccounts.map(async (mutedAccountId: any) => {
        // if (member.followers.some((follower: any) => follower.followersId.toString() === blockedAccountId.toString())) {
        //     return null;
        // }

        const mutedDetails = await ProfileModel.findById(mutedAccountId).select(
          "accountname image"
        );

        const imageDoc =
          mutedDetails.image.length > 0
            ? await Image.findById(mutedDetails.image[0])
                .select("binaryCode")
                .lean()
            : null;

        return {
          _id: mutedDetails._id,
          accountname: mutedDetails.accountname,
          image: imageDoc ? imageDoc : null,
          isBlocked: true,
        };
      })
    );

    const validMutedDetails = mutedDetails.filter((detail) => detail !== null);

    return {
      success: true,
      mutedAccounts: validMutedDetails,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch muted accounts: ${error.message}`,
    };
  }
}

export async function unmuteAccount(
  authActiveProfileId: string,
  mutedAccountId: string
) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({ _id: authActiveProfileId });

    if (!profile) {
      throw new Error("Profile not found");
    }

    profile.mutedAccounts = profile.mutedAccounts.filter(
      (id: any) => id.toString() !== mutedAccountId
    );

    await profile.save();

    return {
      success: true,
      message: "Account unblocked successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to unblock account: ${error.message}`,
    };
  }
}

// follow private acc
export async function followPrivateAcc(
  authenticatedId: string,
  followedId: string
) {
  try {
    await connectToDB();

    const privateAcc = await MemberModel.findOne({ user: followedId }).select(
      "accountType"
    );

    if (!privateAcc || privateAcc.accountType !== "private") {
      return {
        success: false,
        message: "Cannot follow. The account is not private.",
      };
    }
    // go into follow request table

    // const updateCurrentUserFollowing = await MemberModel.findOneAndUpdate(
    //   { user: authenticatedId },
    //   { $addToSet: { following: followedId } }
    // );

    // if (!updateCurrentUserFollowing) {
    //   return {
    //     success: false,
    //     message: "Failed to update the following list.",
    //   };
    // }

    // console.log("updateCurrentUserFollowing" + updateCurrentUserFollowing);

    // const updatePrivateUserFollower = await MemberModel.findOneAndUpdate(
    //   { user: followedId },
    //   {
    //     $addToSet: {
    //       followers: { followersId: authenticatedId, followedAt: new Date() },
    //     },
    //   }
    // );

    // if (!updatePrivateUserFollower) {
    //   return {
    //     success: false,
    //     message: "Failed to update the private user's followers list.",
    //   };
    // }

    // console.log("updatePrivateUserFollower" + updatePrivateUserFollower);

    return {
      success: true,
      message: "Successfully followed the private account.",
    };
  } catch (error: any) {
    console.error("Error following private account:", error);
    return { success: false, message: "Error following private account." };
  }
}

// get follower for current acc
export async function getAllFollowers(userId: string) {
  try {
    await connectToDB();

    // console.log("userId :" + userId);
    const member = await MemberModel.findOne({ user: userId });

    if (!member) {
      return { success: false, message: "User not found", followers: [] };
    }

    return {
      success: true,
      followers: member.followers.map((follower: any) => ({
        _id: follower.followersId._id,
        name: follower.followersId.name,
        image: follower.followersId.image,
        followedAt: follower.followedAt,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching followers:", error);
    return { success: false, message: error.message, followers: [] };
  }
}

// get following for current acc
export async function getAllFollowing(userId: string) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({ user: userId });

    if (!member) {
      return { success: false, message: "User not found", following: [] };
    }

    //     return {
    //         success: true,
    //         following: member.following.map((followingUser: any) => ({
    //             _id: followingUser._id,
    //             name: followingUser.name,
    //             image: followingUser.image,
    //         })),
    //     };
    // } catch (error: any) {
    //     console.error("Error fetching following users:", error);
    //     return { success: false, message: error.message, following: [] };
    // }

    const followingWithDetails = await Promise.all(
      member.following.map(async (following: any) => {
        const followeingDetails = await MemberModel.findOne({
          user: following,
        }).select("accountname user image _id");

        const imgUrl = await Image.findOne({
          _id: followeingDetails?.image,
        }).select("binaryCode");

        return {
          id: followeingDetails?._id,
          userId: followeingDetails?.user,
          name: followeingDetails?.accountname || "Unknown",
          image: imgUrl.binaryCode.toString(),
        };
      })
    );

    return {
      success: true,
      following: followingWithDetails,
    };
  } catch (error: any) {
    console.error("Error fetching following users:", error);
    return { success: false, message: error.message, following: [] };
  }
}

// follow a private acc/ need approval from the user
export async function sendFollowRequest(
  authenticatedId: string,
  targetUserId: string
) {
  try {
    await connectToDB();

    console.log("called");
    console.log(authenticatedId);
    console.log(targetUserId);

    const currentUser = await MemberModel.findOne({
      user: authenticatedId,
    });

    const targetMember = await MemberModel.findOne({
      user: targetUserId,
    });

    const currentActiveAuthProfile = await ProfileModel.findOne({
      _id: currentUser.profiles[currentUser.activeProfile],
    });
    const currentActiveTargetProfile = await ProfileModel.findOne({
      _id: targetMember.profiles[targetMember.activeProfile],
    });

    console.log(currentActiveAuthProfile);
    console.log(currentActiveTargetProfile);

    if (!currentActiveAuthProfile || !currentActiveTargetProfile) {
      return {
        success: false,
        message: "Target Profile or current profile not found",
      };
    }

    if (currentActiveTargetProfile.accountType === "PUBLIC") {
      const isAlreadyFollowing = currentActiveTargetProfile.followers.includes(
        currentActiveAuthProfile._id
      );

      if (isAlreadyFollowing) {
        return {
          success: false,
          message: "You are already following this user.",
        };
      }

      // update the follower for targetMembers
      await ProfileModel.findOneAndUpdate(
        {
          _id: currentActiveTargetProfile._id,
        },
        {
          $push: {
            followers: {
              followersId: currentActiveAuthProfile._id,
              followedAt: new Date(),
            },
          },
        },
        { new: true, useFindAndModify: false }
      );

      // update the current user's following
      await ProfileModel.findOneAndUpdate(
        { _id: currentActiveAuthProfile._id },
        {
          $push: { following: currentActiveTargetProfile._id },
        },
        { new: true, useFindAndModify: false }
      );

      return {
        success: true,
        message: "Successfully followed the user.",
      };
    } else if (currentActiveTargetProfile.accountType === "PRIVATE") {
      const existingRequest = await FollowRequestModel.findOne({
        sender: currentActiveAuthProfile,
        receiver: currentActiveTargetProfile,
        status: 0, // find only pending request
      });

      console.log("existingRequest:" + existingRequest);

      if (existingRequest) {
        return {
          success: false,
          message: "Follow request already sent.",
        };
      }

      // Create a new follow request
      const newFollowRequest = await FollowRequestModel.create({
        sender: currentActiveAuthProfile,
        receiver: currentActiveTargetProfile,
        status: 0, // 0 indicates pending status, 1 indicates decline, 2 indicates accepted
      });

      console.log("newFollowRequest" + newFollowRequest);

      if (newFollowRequest) {
        return {
          success: true,
          message: "Follow request sent successfully.",
        };
      } else {
        return {
          success: false,
          message: "Failed to send follow request.",
        };
      }
    } else {
      return {
        success: false,
        message: "Invalid account type.",
      };
    }
  } catch (error: any) {
    console.error("Error sending follow request:", error);
    return { success: false, message: "Error sending follow request." };
  }
}

// check in followRequest Table
export async function checkFollowRequestStatus({
  senderId,
  receiverId,
}: {
  senderId: string;
  receiverId: string;
}): Promise<{
  success: boolean;
  requestSent: boolean;
  message?: string;
}> {
  try {
    await connectToDB();

    const existingRequest = await FollowRequestModel.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 0, // Pending status
    });

    return {
      success: true,
      requestSent: !!existingRequest,
    };
  } catch (error) {
    console.error("Error checking follow request status:", error);
    return {
      success: false,
      requestSent: false,
      message: "Error checking follow request status",
    };
  }
}

// remove follower
export async function removeFollower(
  authUserId: string,
  targetUserId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDB();

    const updatedMember = await MemberModel.findOneAndUpdate(
      { user: authUserId },
      { $pull: { followers: { followersId: targetUserId } } },
      { new: true }
    );

    if (!updatedMember) {
      return { success: false, message: "User not found or update failed" };
    }

    return { success: true, message: "Follower removed successfully" };
  } catch (error) {
    console.error("Error removing follower:", error);
    return { success: false, message: "Failed to remove follower" };
  }
}

// remove following
export async function removeFollowing(
  authUserId: string,
  targetUserId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDB();

    const updatedMember = await MemberModel.findOneAndUpdate(
      { user: authUserId },
      { $pull: { following: targetUserId } },
      { new: true }
    );

    authUserId;

    if (!updatedMember) {
      return { success: false, message: "User not found or update failed" };
    }

    return { success: true, message: "Following removed successfully" };
  } catch (error) {
    console.error("Error removing following:", error);
    return { success: false, message: "Failed to remove following" };
  }
}

// get account type for member
export async function getAccountType(authenticatedId: string) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({ user: authenticatedId }).select(
      "user accountType"
    );

    if (!member) {
      return {
        success: false,
        message: "Member not found",
        accountType: null,
      };
    }

    return {
      success: true,
      message: "Successfully fetched the account type",
      accountType: member.accountType,
    };
  } catch (error: any) {
    console.error(`Failed to fetch account type: ${error.message}`);
    return {
      success: false,
      message: `Failed to fetch account type: ${error.message}`,
      accountType: null,
    };
  }
}

// get pending followrequest if the account is a private acc
export async function getFollowRequest(authenticatedId: string) {
  try {
    await connectToDB();

    const followRequests = await FollowRequestModel.find({
      receiver: authenticatedId,
      status: 0, // pending
    }).select("sender receiver status createdAt _id");

    if (!followRequests || followRequests.length === 0) {
      return {
        success: false,
        message: "No follow requests found",
        followRequests: [],
      };
    }

    const populatedFollowRequests = await Promise.all(
      followRequests.map(async (request) => {
        const senderMember = await MemberModel.findOne({
          user: request.sender,
        }).select("accountname image");

        const imgUrl = await Image.findOne({
          _id: senderMember?.image,
        }).select("binaryCode");

        return {
          ...request.toObject(),
          sender: senderMember ? senderMember.accountname : null,
          image: imgUrl.binaryCode,
        };
      })
    );

    return {
      success: true,
      message: "Successfully fetched follow requests",
      followRequests: populatedFollowRequests,
    };
  } catch (error: any) {
    console.error(`Failed to fetch follow requests: ${error.message}`);
    return {
      success: false,
      message: `Failed to fetch follow requests: ${error.message}`,
      followRequests: [],
    };
  }
}

// accept follow request
export async function acceptFollowRequest(followRequestId: string) {
  try {
    await connectToDB();

    // console.log("followRequestId:" + followRequestId);

    const updatedFollowRequest = await FollowRequestModel.findOneAndUpdate(
      {
        _id: followRequestId,
        status: 0, // pending
      },
      { status: 2 }, // accepted
      {
        new: true,
      }
    );

    if (!updatedFollowRequest) {
      return {
        success: false,
        message: "Follow Request not found or update failed",
      };
    }

    console.log("updatedFollowRequest sender" + updatedFollowRequest.sender);
    console.log(
      "updatedFollowRequest receiver" + updatedFollowRequest.receiver
    );

    const followFromAuthUser = await MemberModel.findOneAndUpdate(
      { user: updatedFollowRequest.sender },
      { $addToSet: { following: updatedFollowRequest.receiver } },
      { new: true }
    );

    if (!followFromAuthUser) {
      return {
        success: false,
        message: "Failed to update sender's following list",
      };
    }

    const followingFromOtherUser = await MemberModel.findOneAndUpdate(
      { user: updatedFollowRequest.receiver },
      {
        $addToSet: {
          followers: {
            followersId: updatedFollowRequest.sender,
            followedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!followingFromOtherUser) {
      return {
        success: false,
        message: "Failed to update receiver's followers list",
      };
    }

    return { success: true, message: "Accept follow request successfully" };
  } catch (error) {
    console.error("Error accepting follow request", error);
    return { success: false, message: "Failed to accept follow request." };
  }
}

// getMutualFollowStatus
export async function getMutualFollowStatus(
  authenticatedId: string,
  targetUserId: string
) {
  try {
    await connectToDB();

    const isMutualFollow = await MemberModel.findOne({
      $and: [
        { "followers.followersId": targetUserId },
        { "followers.followersId": authenticatedId },
      ],
    });

    return {
      success: true,
      message: isMutualFollow
        ? "Users mutually follow each other."
        : "Users do not follow each other.",
      mutualFollow: !!isMutualFollow,
    };
  } catch (error) {
    console.error("Error finding mutual follow status: ", error);
    return {
      success: false,
      message: "Failed to determine follow status.",
      mutualFollow: false,
    };
  }
}

// get all follower and following of userID that havent chat before
export async function getFollowersAndFollowing(userId: string) {
  try {
    await connectToDB();

    // console.log("group");
    // console.log(userId);
    const member = await MemberModel.findOne({ user: userId });

    if (!member) {
      return {
        success: false,
        message: "User not found",
        followers: [],
        following: [],
      };
    }
    console.log(member);

    const activeProfile = await ProfileModel.findOne({
      _id: member.profiles[member.activeProfile],
    });
    // console.log("active");
    // console.log(activeProfile);

    const chatroomExists = async (user1Id: string, user2Id: string) => {
      const chatroom = await ChatroomModel.findOne({
        participants: { $all: [user1Id, user2Id] },
        type: "PERSONAL",
      });
      return !!chatroom;
    };

    const followersWithDetails = await Promise.all(
      activeProfile.followers.map(async (follower: any) => {
        const followerId = follower.followersId;

        // profile id
        // console.log("cahtrrom follower id");
        // console.log(activeProfile._id);
        // console.log(followerId);
        const chatroomExistsForFollower = await chatroomExists(
          activeProfile._id,
          followerId
        );

        if (chatroomExistsForFollower) {
          return null;
        }
        const followerDetails = await ProfileModel.findOne({
          _id: follower.followersId,
        });

        // console.log("follower details");
        // console.log(followerDetails);

        const imgUrl = await Image.findOne({
          _id: followerDetails?.image,
        }).select("binaryCode");

        return {
          id: followerDetails?._id,
          userId: followerDetails?._id,
          name: followerDetails?.accountname || "Unknown",
          image: imgUrl?.binaryCode.toString(),
          followedAt: follower.followedAt,
        };
      })
    );

    const followingWithDetails = await Promise.all(
      activeProfile.following.map(async (following: any) => {
        // console.log("cahtrrom following id");
        // console.log(activeProfile._id);
        // console.log(following);

        const chatroomExistsForFollowing = await chatroomExists(
          activeProfile._id,
          following
        );

        if (chatroomExistsForFollowing) {
          return null;
        }

        const followeingDetails = await ProfileModel.findOne({
          _id: following,
        }).select("accountname user image _id");

        const imgUrl = await Image.findOne({
          _id: followeingDetails?.image,
        }).select("binaryCode");

        return {
          id: followeingDetails?._id,
          userId: followeingDetails?._id,
          name: followeingDetails?.accountname || "Unknown",
          image: imgUrl?.binaryCode.toString(),
        };
      })
    );

    return {
      success: true,
      message: "",
      followers: followersWithDetails,
      following: followingWithDetails,
    };
  } catch (error: any) {
    console.error("Error fetching followers and following:", error);
    return {
      success: false,
      message: error.message || "An error occurred",
      followers: [],
      following: [],
    };
  }
}

// used to create group chat, fetch all follower and following
export async function getAllFollowersAndFollowing(userId: string) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({ user: userId });

    // console.log("member group");
    // console.log(member);

    if (!member) {
      return {
        success: false,
        message: "User not found",
        followers: [],
        following: [],
      };
    }

    const activeProfile = await ProfileModel.findOne({
      _id: member.profiles[member.activeProfile],
    });
    // console.log("active");
    // console.log(activeProfile);

    const followersWithDetails = await Promise.all(
      activeProfile.followers.map(async (follower: any) => {
        const followerDetails = await ProfileModel.findOne({
          _id: follower.followersId,
        }).select("accountname user image _id");

        const imgUrl = await Image.findOne({
          _id: followerDetails?.image,
        }).select("binaryCode");

        return {
          id: followerDetails._id,
          userId: followerDetails.user,
          name: followerDetails.accountname || "Unknown",
          image: imgUrl?.binaryCode.toString(),
          followedAt: follower.followedAt,
        };
      })
    );

    const followingWithDetails = await Promise.all(
      activeProfile.following.map(async (followingId: string) => {
        const followingDetails = await ProfileModel.findOne({
          _id: followingId,
        }).select("accountname user image _id");

        const imgUrl = await Image.findOne({
          _id: followingDetails?.image,
        }).select("binaryCode");

        return {
          id: followingDetails._id,
          userId: followingDetails.user,
          name: followingDetails.accountname || "Unknown",
          image: imgUrl?.binaryCode.toString(),
        };
      })
    );

    return {
      success: true,
      message: "",
      followers: followersWithDetails,
      following: followingWithDetails,
    };
  } catch (error: any) {
    console.error("Error fetching followers and following:", error);
    return {
      success: false,
      message: error.message || "An error occurred",
      followers: [],
      following: [],
    };
  }
}

// create a new personal chatroom
export async function createOrGetChatroom(
  authenticatedId: string,
  targetUserId: string
) {
  try {
    console.log("cretae personal");
    console.log(authenticatedId);
    console.log(targetUserId);

    const member = await MemberModel.findOne({ user: authenticatedId });
    console.log(member);
    console.log(member.profiles[member.activeProfile]);

    const activeProfile = member.profiles[member.activeProfile];

    let chatroom = await ChatroomModel.findOne({
      type: "PERSONAL",
      participants: { $all: [activeProfile, targetUserId] },
    });

    console.log("chatrrom found");
    console.log(chatroom);

    if (chatroom) {
      console.log("Existing chatroom found: " + chatroom.id);
    } else {
      // Create new chatroom if not found
      chatroom = await ChatroomModel.create({
        type: "PERSONAL",
        name: "Personal Chat",
        participants: [activeProfile, targetUserId],
      });
      await chatroom.save();
      console.log("cretae called");
      // console.log("Newly created chatroom: " + chatroom.id);
    }

    return { success: true, chatroom };
  } catch (error: any) {
    console.error("Error in createOrGetChatroom: ", error);
    return { success: false, message: error.message };
  }
}

// create group chatroom
export async function createGroupChatroom(
  authenticatedId: string,
  participantIdArray: string[],
  groupName: string
) {
  try {
    console.log("array");
    console.log(participantIdArray);

    if (!groupName) {
      throw new Error("Group name is required.");
    }
    if (!Array.isArray(participantIdArray) || participantIdArray.length === 0) {
      throw new Error("At least one participant is required.");
    }

    // remove duplicate user id
    const participants = [authenticatedId, ...participantIdArray].filter(
      (id, index, self) => self.indexOf(id) === index
    );

    console.log("Participants array:", participants);

    // Create the group chatroom
    const groupChatroom = await ChatroomModel.create({
      type: "GROUP",
      name: groupName,
      participants: participants,
    });

    await groupChatroom.save();

    console.log("Newly created group chatroom:", groupChatroom);

    const chatroomPlain = groupChatroom.toObject();

    // Check all fields of the chatroom object
    console.log("Chatroom ID:", chatroomPlain._id);
    console.log("Chatroom participants:", chatroomPlain.participants);
    console.log("Chatroom name:", chatroomPlain.name);

    return { success: true, chatroom: chatroomPlain };
  } catch (error: any) {
    console.error("Error in createOrGetChatroom:", error);
    return { success: false, message: error.message };
  }
}

export async function getCurrentUserChatroom(authenticatedId: string) {
  try {
    await connectToDB();

    console.log("current");
    console.log(authenticatedId); // memberId

    const member = await MemberModel.findOne({ user: authenticatedId });

    console.log(member);
    console.log(member._id);
    console.log(member.profiles[member.activeProfile]);

    const activeProfile = await ProfileModel.findOne({
      _id: member.profiles[member.activeProfile],
    });

    console.log(activeProfile);
    const profile = await ProfileModel.findOne({ _id: activeProfile._id });

    console.log("currentProfile", profile);

    const chatrooms = await ChatroomModel.find({
      participants: profile._id,
    });

    const chatroomDetails = [];

    for (const chatroom of chatrooms) {
      const otherParticipants = chatroom.participants.filter(
        (participantId: any) => !participantId.equals(authenticatedId)
      );

      const participantsDetails = [];

      for (const participantId of otherParticipants) {
        const member = await MemberModel.findOne({ user: participantId });

        if (member) {
          let imgUrl = null;
          if (member && member.image && member.image.length > 0) {
            const imageRecord = await Image.findOne({
              _id: member?.image,
            }).select("binaryCode");

            imgUrl = imageRecord?.binaryCode || null;
          }

          participantsDetails.push({
            participantId: participantId.toString(),
            user: member.user,
            email: member.email,
            accountname: member.accountname,
            image: imgUrl,
          });
        } else {
          participantsDetails.push({
            participantId: participantId.toString(),
            error: `No member found for participant ID: ${participantId.toString()}`,
          });
        }
      }

      chatroomDetails.push({
        chatroomId: chatroom._id.toString(),
        name: chatroom.name,
        type: chatroom.type,
        participants: participantsDetails,
        createdAt: chatroom.createdAt,
        updatedAt: chatroom.updatedAt,
      });
    }

    return {
      success: true,
      message: "Chatrooms found!",
      chatrooms: chatroomDetails,
    };
  } catch (error) {
    console.error("Error finding chatroom: ", error);
    return {
      success: false,
      message: "Failed to find chatrooms.",
      chatrooms: [],
    };
  }
}

// getImage of account
export async function getImage(userId: string) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({ user: userId }).select("image");

    if (!member) {
      return {
        success: false,
        message: "User not found",
      };
    }

    let imgUrl = null;
    if (member && member.image && member.image.length > 0) {
      const imageRecord = await Image.findOne({
        _id: member?.image,
      }).select("binaryCode");

      imgUrl = imageRecord?.binaryCode || null;
    }

    return {
      success: true,
      message: "Image retrieved successfully",
      image: imgUrl,
    };
  } catch (error: any) {
    console.error("Error fetching member:", error);
    return {
      success: false,
      message: error.message || "An error occurred",
      image: null,
    };
  }
}

export async function getChatroomParticipantsImage(
  chatroomId: string,
  authenticatedUserId: string
) {
  try {
    await connectToDB();

    const chatroom = await ChatroomModel.findById(chatroomId).select(
      "participants"
    );

    if (!chatroom) {
      return {
        success: false,
        message: "Chatroom not found",
      };
    }

    const filteredParticipants = chatroom.participants.filter(
      (participant: any) => participant._id.toString() !== authenticatedUserId
    );

    const participantImages = await Promise.all(
      filteredParticipants.map(async (participant: any) => {
        const member = await MemberModel.findOne({
          user: participant._id,
        }).select("image");

        let imgUrl = null;

        if (member && member.image) {
          const imageRecord = await Image.findById(member.image).select(
            "binaryCode"
          );

          imgUrl = imageRecord?.binaryCode || null;
        }

        return {
          participantId: participant._id,
          image: imgUrl,
        };
      })
    );

    return {
      success: true,
      message: "Images retrieved successfully",
      images: participantImages,
    };
  } catch (error: any) {
    console.error("Error fetching participant images:", error);
    return {
      success: false,
      message: error.message || "An error occurred",
      images: null,
    };
  }
}

export async function fetchPreviousMessage(
  chatroomId: string,
  authenticatedUserId: string,
  skip: number,
  limit: number
) {
  try {
    await connectToDB();

    console.log("skip");
    console.log(skip);

    const sender = await MemberModel.findOne({ user: authenticatedUserId });

    if (!sender) {
      return {
        success: false,
        message: "Sender not found",
        messages: [],
      };
    }

    const messages = await MessageModel.find({ chatroomId: chatroomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const sortedMessages = messages.reverse();

    return {
      success: true,
      message: "Messages fetched successfully",
      messages: sortedMessages,
    };
  } catch (error) {
    console.error("Error fetching previous messages:", error);
    return {
      success: false,
      message: "An error occurred while fetching messages",
      messages: [],
    };
  }
}
