"use server";

import { connectToDB } from "../mongodb";
import SubscriptionModel from "../models/subscription";
import ProductModel from "../models/product";
import PromotionModel from "../models/promotion";
import { revalidatePath } from "next/cache";
import TransactionModel from "../models/transaction";
import MemberModel from "../models/member";
import {
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import OfferModel from "../models/offer";
import { MemberType, Usertype } from "@/types";
import OrganizationModel from "../models/organization";
import ProfileModel from "../models/profile";

export async function authorizationAdmin(
  authenticatedUserId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const admin = await MemberModel.findOne({ user: authenticatedUserId });

    if (admin.usertype.toUpperCase() !== "FLEXADMIN") {
      return {
        success: false,
        message: "You has no authorization to do this action.",
      };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

function generateCustomID() {
  return uuidv4();
}

interface CreateMemberWithProfileRoleParams {
  email: string;
  userRole: string;
  authActiveProfileId: string;
}

// convert to Profile Model but still need to check
export async function createMemberWithProfileRole({
  email,
  userRole,
  authActiveProfileId,
}: CreateMemberWithProfileRoleParams) {
  try {
    await connectToDB();

    const adminProfile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    });
    if (adminProfile.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("User is not authorized to create member with role.");
    }

    const existingMember = await MemberModel.findOne({ email: email });

    if (!existingMember) {
      const newProfile = new ProfileModel({
        usertype: userRole,
      });

      await newProfile.save();

      const newMember = new MemberModel({
        generatedId: generateCustomID(),
        email: email,
        profiles: [newProfile._id],
      });

      await newMember.save();
      return { success: true, message: "Member created successfully" };
    }

    return { success: false, message: "Member already exists" };
  } catch (error: any) {
    throw new Error(`Failed to create member: ${error.message}`);
  }
}

//done convert to Profile Model but still need to check
export async function fetchAllMember(authActiveProfileId: string) {
  try {
    await connectToDB();

    const admin = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("usertype");

    if (admin.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("Member has no authorization to fetch all members");
    }

    const members = await MemberModel.find();

    return members;
  } catch (error: any) {
    console.error(`Failed to fetch Member: ${error.message}`);
    return null;
  }
}

//done convert to Profile Model but still need to check
export async function fetchAllMemberProfile(authActiveProfileId: string) {
  try {
    await connectToDB();

    const admin = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("usertype");

    if (admin.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("Member has no authorization to fetch all members");
    }

    const profiles = await ProfileModel.find().select("usertype accountname email image accountType usertype cards subscription onboarded totalViews");

    const profilesWithStringId = profiles.map((profile: any) => ({
      ...profile.toObject(),
      _id: profile._id.toString(),
    }));

    return profilesWithStringId;
  } catch (error: any) {
    console.error(`Failed to fetch Profile: ${error.message}`);
    return null;
  }
}

//done convert to Profile Model but still need to check
export async function fetchMemberProfileStats() {
  try {
    await connectToDB();

    const today = new Date();
    const currentWeekStart = startOfWeek(today);
    const currentWeekEnd = endOfWeek(today);
    const lastWeekStart = startOfWeek(subWeeks(today, 1));
    const lastWeekEnd = endOfWeek(subWeeks(today, 1));

    const currentWeekMembers = await ProfileModel.find({
      createdAt: { $gte: currentWeekStart, $lt: currentWeekEnd },
    });

    const lastWeekMembers = await ProfileModel.find({
      createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd },
    });

    // Helper function to categorize members
    const categorizeMemberProfiles = (profiles: any[]) => {
      return {
        general: profiles.filter(
          (profile) =>
            profile.usertype === "PERSONAL" ||
            profile.usertype === "ORGANIZATION"
        ),
        professional: profiles.filter((profile) =>
          ["PREMIUM", "EXPERT", "ELITE"].includes(profile.usertype)
        ),
        organization: profiles.filter((profile) =>
          ["ORGANIZATION", "BUSINESS", "ENTERPRISE"].includes(profile.usertype)
        ),
        admin: profiles.filter((profile) => profile.usertype === "FLEXADMIN"),
        superuser: profiles.filter(
          (profile) => profile.usertype === "SUPERUSER"
        ),
      };
    };

    const currentStats = categorizeMemberProfiles(currentWeekMembers);
    const lastWeekStats = categorizeMemberProfiles(lastWeekMembers);

    const calculateIncreaseRate = (
      currentCount: number,
      lastWeekCount: number
    ) => {
      if (currentCount === 0 && lastWeekCount === 0) {
        return 0;
      } else if (lastWeekCount === 0) {
        return 100;
      } else {
        return ((currentCount - lastWeekCount) / lastWeekCount) * 100;
      }
    };

    return {
      general: {
        count: currentStats.general.length,
        increaseRate: calculateIncreaseRate(
          currentStats.general.length,
          lastWeekStats.general.length
        ),
        isNew:
          lastWeekStats.general.length === 0 && currentStats.general.length > 0,
      },
      professional: {
        count: currentStats.professional.length,
        increaseRate: calculateIncreaseRate(
          currentStats.professional.length,
          lastWeekStats.professional.length
        ),
        isNew:
          lastWeekStats.professional.length === 0 &&
          currentStats.professional.length > 0,
      },
      organization: {
        count: currentStats.organization.length,
        increaseRate: calculateIncreaseRate(
          currentStats.organization.length,
          lastWeekStats.organization.length
        ),
        isNew:
          lastWeekStats.organization.length === 0 &&
          currentStats.organization.length > 0,
      },
      admin: {
        count: currentStats.admin.length,
        increaseRate: calculateIncreaseRate(
          currentStats.admin.length,
          lastWeekStats.admin.length
        ),
        isNew:
          lastWeekStats.admin.length === 0 && currentStats.admin.length > 0,
      },
      superuser: {
        count: currentStats.superuser.length,
        increaseRate: calculateIncreaseRate(
          currentStats.superuser.length,
          lastWeekStats.superuser.length
        ),
        isNew:
          lastWeekStats.superuser.length === 0 &&
          currentStats.superuser.length > 0,
      },
    };
  } catch (error) {
    console.error("Error fetching member profile stats:", error);
    throw error;
  }
}

interface Transaction {
  id: string;
  transactionDate: Date;
  transactionFees: number;
  ip_address: string;
  payment_types: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TransactionsByDate {
  [date: string]: Transaction[];
}

//done convert to Profile Model but still need to check
export async function fetchTransactionStats(
  authActiveProfileId: string,
  startDate: Date | null,
  endDate: Date | null
) {
  try {
    await connectToDB();

    if (!endDate) {
      endDate = new Date();
    }

    if (!startDate) {
      startDate = subDays(endDate, 7);
    }

    const user = await ProfileModel.findOne({ _id: authActiveProfileId });
    const userType = user.usertype.toUpperCase();

    if (userType !== "FLEXADMIN" && userType !== "FLEXACCOUNTANT") {
      throw new Error("User is not authorized to fetch transaction stats.");
    }

    const previousStartDate = subDays(
      startDate,
      endDate.getTime() - startDate.getTime()
    );
    const previousEndDate = subDays(
      endDate,
      endDate.getTime() - startDate.getTime()
    );

    const transactions: Transaction[] = await TransactionModel.find({
      transactionDate: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) },
    });

    const previousTransactions: Transaction[] = await TransactionModel.find({
      transactionDate: {
        $gte: startOfDay(previousStartDate),
        $lte: endOfDay(previousEndDate),
      },
    });

    const totalTransactions = transactions.length;
    const totalFees = transactions.reduce(
      (sum, transaction) => sum + transaction.transactionFees,
      0
    );

    const previousTotalTransactions = previousTransactions.length;
    const previousTotalFees = previousTransactions.reduce(
      (sum, transaction) => sum + transaction.transactionFees,
      0
    );

    const calculateIncreaseRate = (current: number, previous: number) => {
      if (current === 0 && previous === 0) {
        return 0;
      } else if (previous === 0) {
        return 100;
      } else {
        return ((current - previous) / previous) * 100;
      }
    };

    const transactionIncreaseRate = calculateIncreaseRate(
      totalTransactions,
      previousTotalTransactions
    );
    const feeIncreaseRate = calculateIncreaseRate(totalFees, previousTotalFees);

    const transactionsByDate: TransactionsByDate = transactions.reduce(
      (acc: TransactionsByDate, transaction) => {
        const date = transaction.transactionDate.toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(transaction);
        return acc;
      },
      {}
    );

    const chartData = Object.entries(transactionsByDate).map(
      ([date, transactions]) => ({
        date,
        count: transactions.length,
        fees: transactions.reduce(
          (sum, transaction) => sum + transaction.transactionFees,
          0
        ),
      })
    );

    if (chartData.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      chartData.push({ date: today, count: 0, fees: 0 });
    }

    return {
      success: true,
      totalTransactions,
      totalFees,
      transactionIncreaseRate,
      feeIncreaseRate,
      chartData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to fetch transaction details: ${error.message}`,
    };
  }
}

// export async function fetchTransactionStats() {
//     try {
//         await connectToDB();

//         const today = new Date();
//         const currentWeekStart = startOfWeek(today);
//         const currentWeekEnd = endOfWeek(today);
//         const lastWeekStart = startOfWeek(subWeeks(today, 1));
//         const lastWeekEnd = endOfWeek(subWeeks(today, 1));

//         const transactions: Transaction[] = await TransactionModel.find({});
//         const currentWeekTransactions: Transaction[] = await TransactionModel.find({ transactionDate: { $gte: currentWeekStart, $lt: currentWeekEnd } });
//         const lastWeekTransactions: Transaction[] = await TransactionModel.find({ transactionDate: { $gte: lastWeekStart, $lt: lastWeekEnd } });

//         const totalTransactions = transactions.length;
//         const totalFees = transactions.reduce((sum, transaction) => sum + transaction.transactionFees, 0);

//         const currentWeekTransactionCount = currentWeekTransactions.length;
//         const lastWeekTransactionCount = lastWeekTransactions.length;

//         const currentWeekFees = currentWeekTransactions.reduce((sum, transaction) => sum + transaction.transactionFees, 0);
//         const lastWeekFees = lastWeekTransactions.reduce((sum, transaction) => sum + transaction.transactionFees, 0);

//         const calculateIncreaseRate = (currentCount: number, lastWeekCount: number) => {
//             if (currentCount === 0 && lastWeekCount === 0) {
//                 return 0;
//             } else if (lastWeekCount === 0) {
//                 return 100;
//             } else {
//                 return ((currentCount - lastWeekCount) / lastWeekCount) * 100;
//             }
//         };

//         const transactionIncreaseRate = calculateIncreaseRate(currentWeekTransactionCount, lastWeekTransactionCount);
//         const feeIncreaseRate = calculateIncreaseRate(currentWeekFees, lastWeekFees);

//         const transactionsByDate: TransactionsByDate = transactions.reduce((acc: TransactionsByDate, transaction) => {
//             const date = transaction.transactionDate.toISOString().split('T')[0];
//             if (!acc[date]) acc[date] = [];
//             acc[date].push(transaction);
//             return acc;
//         }, {});

//         const chartData = Object.entries(transactionsByDate).map(([date, transactions]) => ({
//             date,
//             count: transactions.length,
//             fees: transactions.reduce((sum, transaction) => sum + transaction.transactionFees, 0)
//         }));

//         if (chartData.length === 0) {
//             chartData.push({ date: today.toISOString().split('T')[0], count: 0, fees: 0 });
//         }

//         return {
//             totalTransactions,
//             totalFees,
//             currentWeekTransactionCount,
//             lastWeekTransactionCount,
//             transactionIncreaseRate,
//             feeIncreaseRate,
//             chartData,
//         };
//     } catch (error) {
//         console.error("Error fetching transaction stats:", error);
//         throw error;
//     }
// }

export async function fetchProfile(profileId: string) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({ _id: profileId });

    if (!profile) {
      throw new Error("No profile found");
    }

    return profile;
  } catch (error: any) {
    throw new Error(`Failed to fetch Profile: ${error.message}`);
  }
}

export async function fetchMember(userId: string) {
  try {
    await connectToDB();

    const member = await MemberModel.findOne({ user: userId });

    return member;
  } catch (error: any) {
    throw new Error(`Failed to fetch Member: ${error.message}`);
  }
}

// done convert to Profile Model but still need to check, something should wrong here
export async function fetchMemberProfileDetails(
  profileId: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({ _id: profileId })
      .select("usertype organization")
      .populate({
        path: "organization",
        options: { lean: true },
      });

    console.log("Profile: ", profile);

    if (!profile) {
      return { success: false, message: "Profile not found" };
    }

    let verifiedAdminName = null;
    if (profile.organization && profile.organization.verify.verifiedBy) {
      const verifiedAdmin = await ProfileModel.findOne({
        _id: profile.organization.verify.verifiedBy,
      }).select("accountname");
      if (verifiedAdmin) {
        verifiedAdminName = verifiedAdmin.accountname;
      }
    }

    const restructureProfileOrganization = profile.organization
      ? {
          ...profile.organization,
          verify: {
            ...profile.organization.verify,
            verifiedBy: verifiedAdminName,
          },
        }
      : null;

    const structuredProfile = {
      ...profile.toObject(),
      _id: profile._id.toString(),
      organization: restructureProfileOrganization
        ? {
            ...restructureProfileOrganization,
            _id: restructureProfileOrganization._id.toString(),
          }
        : null,
    };

    return { success: true, data: structuredProfile };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}


// done convert to Profile Model
export async function verifyOrganizationStatus(
  authActiveProfileId: string,
  organizationId: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).select("usertype accountname");

    if (
      profile.usertype.toUpperCase() !== "FLEXADMIN" &&
      profile.usertype.toUpperCase() !== "FLEXHR"
    ) {
      return {
        success: false,
        message: "User is not authorized to verify organization status.",
      };
    }

    const organization = await OrganizationModel.findOne({
      _id: organizationId,
    }).select("verify");

    if (!organization) {
      return { success: false, message: "Organization not found." };
    }

    organization.verify.verified = true;
    organization.verify.verifiedAt = new Date();
    organization.verify.verifiedBy = authActiveProfileId;

    const returnOrganizationVerifyDetails = organization.verify;
    returnOrganizationVerifyDetails.verifiedBy = profile.accountname;

    await organization.save();

    return { success: true, data: returnOrganizationVerifyDetails };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// export async function fetchMemberByDateRange(
//     startDate: Date | null, endDate: Date | null
// ): Promise<any> {
//     try {
//         connectToDB();

//         if (startDate) startDate = startOfDay(new Date(startDate));
//         if (endDate) {
//             endDate = endOfDay(new Date(endDate));
//         }else{
//             endDate = endOfDay(new Date());
//         }

//         console.log("M date range start: ", startDate);
//         console.log("M date range end: ", endDate);

//         const members = await MemberModel.find({
//             createdAt: { $gte: startDate, $lte: endDate }
//         }).sort({ createdAt: 'asc' });

//         return members;
//     } catch (error: any) {
//         console.error(`Failed to fetch Members by range: ${error.message}`);
//         return null;
//     }
// }

//done convert to Profile Model but still need to check
export async function fetchCountMemberProfileByDateRange(
  startDate: Date | null,
  endDate: Date | null
): Promise<{
  success: boolean;
  data?: { date: string; totalProfiles: number }[];
  message?: string;
}> {
  try {
    await connectToDB();

    let modifiedEndDate = endDate || new Date();
    if (endDate) {
      modifiedEndDate = endOfDay(new Date(endDate));
    }

    const profiles = await ProfileModel.find({
      createdAt: { $gte: startDate, $lte: modifiedEndDate },
    }).sort({ createdAt: "asc" });

    const dayArray: { date: string; totalProfiles: number }[] = [];

    if (profiles && profiles.length > 0) {
      let currentDate =
        startDate ||
        (profiles.length ? startOfDay(profiles[0].createdAt) : new Date());
      while (currentDate <= modifiedEndDate) {
        dayArray.push({
          date: currentDate.toISOString().slice(0, 10),
          totalProfiles: 0,
        });
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }

      profiles.forEach((profile: { createdAt: Date }) => {
        const profileDateStr = profile.createdAt.toISOString().slice(0, 10);
        const day = dayArray.find((day) => day.date === profileDateStr);
        if (day) {
          day.totalProfiles += 1;
        }
      });
    }

    return { success: true, data: dayArray };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

//done convert to Profile Model but still need to check
export async function fetchTotalMemberProfileByDateRange(
  startDate: Date | null,
  endDate: Date | null
): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    await connectToDB();

    let modifiedEndDate = endDate || new Date();
    if (endDate) {
      modifiedEndDate = endOfDay(new Date(endDate));
    }

    const profiles = await ProfileModel.find({
      createdAt: { $gte: startDate, $lte: modifiedEndDate },
    }).sort({ createdAt: "asc" });

    const dayArray: {
      date: string;
      totalProfiles: number;
      totalPersonalProfile: number;
      totalOrganizationProfile: number;
    }[] = [];

    let totalProfiles = 0;
    let totalPersonalProfile = 0;
    let totalOrganizationProfile = 0;

    let currentDate =
      startDate ||
      (profiles.length ? startOfDay(profiles[0].createdAt) : new Date());

    while (currentDate <= modifiedEndDate) {
      dayArray.push({
        date: currentDate.toISOString().slice(0, 10),
        totalProfiles: 0,
        totalPersonalProfile: 0,
        totalOrganizationProfile: 0,
      });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    profiles.forEach((profile: { createdAt: Date; usertype: string }) => {
      const memberDateStr = profile.createdAt.toISOString().slice(0, 10);
      const day = dayArray.find((day) => day.date === memberDateStr);

      if (day) {
        day.totalProfiles += 1;
        totalProfiles += 1;

        if (profile.usertype === "PERSONAL") {
          day.totalPersonalProfile += 1;
          totalPersonalProfile += 1;
        } else if (profile.usertype === "ORGANIZATION") {
          day.totalOrganizationProfile += 1;
          totalOrganizationProfile += 1;
        }
      }
    });

    dayArray.reduce(
      (acc, day) => {
        day.totalProfiles = acc.totalProfiles + day.totalProfiles;
        day.totalPersonalProfile =
          acc.totalPersonalProfile + day.totalPersonalProfile;
        day.totalOrganizationProfile =
          acc.totalOrganizationProfile + day.totalOrganizationProfile;

        return {
          totalProfiles: day.totalProfiles,
          totalPersonalProfile: day.totalPersonalProfile,
          totalOrganizationProfile: day.totalOrganizationProfile,
        };
      },
      { totalProfiles: 0, totalPersonalProfile: 0, totalOrganizationProfile: 0 }
    );

    return {
      success: true,
      data: dayArray,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function fetchSubscriptionById(subscriptionId: string) {
  try {
    await connectToDB();

    const subscription = await SubscriptionModel.findOne({
      _id: subscriptionId,
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    return subscription;
  } catch (error: any) {
    throw new Error(`Failed to fetch Member: ${error.message}`);
  }
}

function checkAndReturnUserType(productName: string, planCategory: string) {
  if (planCategory.toUpperCase() === "PERSONAL") {
    switch (productName.toLocaleUpperCase()) {
      case "PREMIUM":
        return Usertype.PREMIUM;
      case "EXPERT":
        return Usertype.EXPERT;
      case "ELITE":
        return Usertype.ELITE;
      case "PREMIUM":
        return Usertype.PREMIUM;
      default:
        return Usertype.PERSONAL;
    }
  } else if (planCategory.toUpperCase() === "ORGANIZATION") {
    switch (productName.toLocaleUpperCase()) {
      case "BUSINESS":
        return Usertype.BUSINESS;
      case "ENTERPRISE":
        return Usertype.ENTERPRISE;
      default:
        return Usertype.ORGANIZATION;
    }
  }
}

//done convert to Profile Model
export async function fetchTransactionStatusFromSubsciptionId(
  subscriptionId: string,
  transactionId: string
): Promise<{
  success: boolean;
  status?: boolean;
  estimatedEndDate?: Date;
  message?: string;
}> {
  try {
    await connectToDB();

    const subscription = await SubscriptionModel.findOne({
      id: subscriptionId,
    }).select("transaction estimatedEndDate plan");

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const transactionObjectIds = subscription.transaction;

    const transaction = await TransactionModel.findOne({
      _id: { $in: transactionObjectIds },
      id: transactionId,
    });

    if (!transaction) {
      throw new Error("No specific transaction found");
    }

    const product = await ProductModel.findOne({ _id: subscription.plan });

    const planCategory = product.category;

    const profile = await ProfileModel.findOne({
      subscription: { $in: [subscription._id] },
    })
      .select("_id subscription")
      .populate({
        path: "subscription",
        model: "Subscription",
        select: "id estimatedEndDate transaction plan",
      });

    const newUserType = checkAndReturnUserType(product.name, planCategory);

    let returnMessage: string;
    if (transaction.transactionStatus == true) {
      const result = await updateUserType(profile._id, newUserType);
      if (result.success) {
        returnMessage =
          "Thank you for subscribing to our service. Your subscription is now active.";
      } else {
        returnMessage =
          "Something went wrong while updating your user type, please contact to our customer service for any assistance.";
      }
    } else {
      returnMessage =
        "Something went wrong while subscribing to our service, please contact to our customer service for any assistance.";
    }

    return {
      success: true,
      status: transaction.transactionStatus,
      estimatedEndDate: subscription.estimatedEndDate,
      message: returnMessage,
    };
  } catch (error: any) {
    return {
      success: false,
      status: false,
      message:
        "Something went wrong while subscribing to our service, please contact to our customer service for any assistance. Error Code: " +
        error.message,
    };
  }
}

//done convert to Profile Model
export async function updateUserType(profileId: string, userType: any) {
  try {
    await connectToDB();

    const profile = await ProfileModel.findOne({ _id: profileId });

    if (!profile) {
      throw new Error("Profile not found");
    }

    profile.usertype = userType;
    await profile.save();

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function fetchSubscriptionByDateRange(
  startDate: Date | null,
  endDate: Date | null
): Promise<any> {
  try {
    await connectToDB();

    if (startDate) startDate = startOfDay(new Date(startDate));
    if (endDate) {
      endDate = endOfDay(new Date(endDate));
    } else {
      endDate = endOfDay(new Date());
    }

    const subscription = await SubscriptionModel.find({
      "transaction.transactionDate": {
        $gte: startDate || new Date(0),
        $lte: endDate || new Date(),
      },
    }).populate({
      path: "transaction",
      model: TransactionModel,
      match: {
        transactionDate: {
          $gte: startDate || new Date(0),
          $lte: endDate || new Date(),
        },
      },
    });

    return subscription;
  } catch (error: any) {
    console.error(`Failed to fetch Subscription by range: ${error.message}`);
    return null;
  }
}

interface ParamsProductDetails {
  name: string;
  description: string;
  category: string;
  price: number;
  availablePromo: string; //array
  stripeProductId: string;
  monthlyDiscount: number;
  annualDiscount: number;
  features: { name: string }[];
  limitedCard: number;
  limitedIP: number;
  authActiveProfileId: string;
  path: string;
}

// done convert to Profile Model but still need to check
export async function insertNewProduct({
  name,
  description,
  category,
  price,
  availablePromo,
  stripeProductId,
  monthlyDiscount,
  annualDiscount,
  features,
  limitedCard,
  limitedIP,
  authActiveProfileId,
  path,
}: ParamsProductDetails): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const user = await ProfileModel.findOne({ _id: authActiveProfileId });
    if (user.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("User is not authorized to add new product");
    }

    const newProduct = new ProductModel({
      name,
      description,
      category,
      price,
      availablePromo,
      stripeProductId,
      monthlyDiscount,
      annualDiscount,
      features,
      limitedCard,
      limitedIP,
    });

    await newProduct.save();

    if (path !== "/dashboard/products/add-new-plans") {
      revalidatePath(path);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function fetchAllProduct() {
  try {
    await connectToDB();

    const products = await ProductModel.find();

    return products;
  } catch (error: any) {
    console.error(`Failed to fetch Products: ${error.message}`);
    return null;
  }
}

export async function fetchProductById(productId: string): Promise<any> {
  try {
    await connectToDB();

    const product = await ProductModel.findOne({ _id: productId }).lean();

    if (!product) {
      throw new Error("No product found");
    }

    return product;
  } catch (error: any) {
    throw new Error(`Failed to fetch Product: ${error.message}`);
  }
}

//done convert to Profile Model
export async function storeSubscription({
  authActiveProfileId,
  productId,
  paidTerms,
  totalAmount,
}: {
  authActiveProfileId: string;
  productId: string;
  paidTerms: number;
  totalAmount: number;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    await connectToDB();

    console.log(
      "authActiveProfileId in storeSubscription: ",
      authActiveProfileId
    );

    const profile = await ProfileModel.findOne({
      _id: authActiveProfileId,
    }).populate("offers");

    if (!profile) {
      return { success: false, message: "Profile not found" };
    }

    let planStarted;
    let estimatedEndDate;
    let hasTrialOffer = false;

    if (profile.offers && profile.offers.length > 0) {
      for (const offerId of profile.offers) {
        const offer = await OfferModel.findById(offerId);

        if (offer && offer.type === "trial") {
          hasTrialOffer = true;
          break;
        }
      }
    }

    if (hasTrialOffer) {
      planStarted = new Date();
      estimatedEndDate = new Date(planStarted);
      estimatedEndDate.setMonth(planStarted.getMonth() + paidTerms);

      return await createSubscription(
        profile,
        productId,
        paidTerms,
        totalAmount,
        planStarted,
        estimatedEndDate
      );
    } else {
      const trialStartDate = new Date();
      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setDate(trialStartDate.getDate() + 14);

      const trial = new OfferModel({
        plan: productId,
        startDate: trialStartDate,
        endDate: trialEndDate,
        type: "trial",
      });

      await trial.save();

      profile.offers.push(trial._id);
      await profile.save();

      planStarted = trialEndDate;
      estimatedEndDate = new Date(planStarted);
      estimatedEndDate.setMonth(planStarted.getMonth() + paidTerms);

      return await createSubscription(
        profile,
        productId,
        paidTerms,
        totalAmount,
        planStarted,
        estimatedEndDate
      );
    }
  } catch (error: any) {
    console.error("Error storing subscription:", error);
    return { success: false, message: error.message };
  }
}

async function createSubscription(
  profile: any,
  productId: string,
  paidTerms: number,
  totalAmount: number,
  planStarted: Date,
  estimatedEndDate: Date
) {
  try {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, "");
    const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const subscriptionId = `OTX${formattedDate}${formattedTime}`;

    const subscription = new SubscriptionModel({
      id: subscriptionId, // changed to custom id
      planStarted,
      estimatedEndDate,
      paidTerms,
      totalAmount,
      plan: productId,
      transaction: [],
    });

    await subscription.save();

    profile.subscription.push(subscription._id);
    await profile.save();

    return { success: true, data: subscription.id.toString() };
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return { success: false, message: error.message };
  }
}

export async function fetchSubsriptionById(orderId: string): Promise<any> {
  try {
    await connectToDB();

    const subscription = await SubscriptionModel.findOne({
      id: orderId,
    }).lean();

    if (!subscription) {
      throw new Error("No subscription found");
    }

    return subscription;
  } catch (error: any) {
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }
}

export async function fetchSubsriptionTotalAmountById(
  orderId: string
): Promise<any> {
  try {
    await connectToDB();

    const subscription = await SubscriptionModel.findOne({ id: orderId });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    return subscription.totalAmount;
  } catch (error: any) {
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }
}

export async function generateTransactionAndUpdateSubscription({
  orderId,
  transactionId,
  transactionDate,
  transactionFees,
  ip_address,
  payment_types,
  currency,
  transactionStatus,
  stripeSubscriptionId,
  status,
}: {
  orderId: string;
  transactionId: string;
  transactionDate: Date;
  transactionFees: number;
  ip_address: string;
  payment_types: string;
  currency: string;
  transactionStatus: boolean;
  stripeSubscriptionId?: string;
  status: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const subscription = await SubscriptionModel.findOne({ id: orderId });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const transaction = new TransactionModel({
      id: transactionId,
      transactionDate,
      transactionFees,
      ip_address,
      payment_types,
      currency,
      transactionStatus,
    });

    if (payment_types === "Stripe" && stripeSubscriptionId) {
      if (stripeSubscriptionId) {
        subscription.stripeSubscriptionId = stripeSubscriptionId;
      } else {
        throw new Error("No stripe subscription id found");
      }
    }

    await transaction.save();

    subscription.transaction.push(transaction._id);
    subscription.status = status;
    await subscription.save();

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

interface ParamsUpdate {
  name: string;
  description: string;
  category: string;
  price: number;
  availablePromo: string; //array
  stripeProductId: string;
  monthlyDiscount: number;
  annualDiscount: number;
  features: { name: string }[];
  limitedCard: number;
  limitedIP: number;
  authActiveProfileId: string;
  productId: string;
  path: string;
}

// done convert to Profile Model but still need to check
export async function updateProduct({
  name,
  description,
  category,
  price,
  availablePromo,
  stripeProductId,
  monthlyDiscount,
  annualDiscount,
  features,
  limitedCard,
  limitedIP,
  authActiveProfileId,
  productId,
  path,
}: ParamsUpdate): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const user = await ProfileModel.findOne({ _id: authActiveProfileId });
    if (user.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("User is not authorized to update product");
    }

    console.log("monthlyDiscount", monthlyDiscount);

    await ProductModel.findOneAndUpdate(
      { _id: productId },
      {
        name,
        description,
        category,
        price,
        availablePromo,
        stripeProductId,
        monthlyDiscount,
        annualDiscount,
        features,
        limitedCard,
        limitedIP,
      },
      { upsert: true }
    );

    if (path !== "/dashboard/products/add-new-plans") {
      revalidatePath(path);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

//done convert to Profile Model but still need to check
export async function deleteProduct({
  productId,
  authActiveProfileId,
}: {
  productId: string;
  authActiveProfileId: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const user = await ProfileModel.findOne({ _id: authActiveProfileId });
    if (user.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("User is not authorized to delete product");
    }

    await ProductModel.deleteOne({ _id: productId });

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

interface ParamsPromotionDetails {
  id: string;
  name: string;
  code: string;
  discount: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  limitedQuantity: number;
  authActiveProfileId: string;
}

//done convert to Profile Model but still need to check
export async function insertNewPromotion({
  name,
  code,
  discount,
  dateRange,
  limitedQuantity,
  authActiveProfileId,
}: ParamsPromotionDetails): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const user = await ProfileModel.findOne({ _id: authActiveProfileId });
    if (user.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("User is not authorized to add new product");
    }

    const newPromotion = new PromotionModel({
      name,
      code,
      discount,
      dateRange,
      limitedQuantity,
    });

    await newPromotion.save();

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function fetchAllPromotion(): Promise<{
  success: boolean;
  data?: ParamsPromotionDetails[];
  message?: string;
}> {
  try {
    await connectToDB();

    const promotions = await PromotionModel.find();

    return { success: true, data: promotions };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function fetchPromoById(promoId: string): Promise<any> {
  try {
    await connectToDB();

    const promotion = await PromotionModel.findOne({ _id: promoId });

    if (!promotion) {
      throw new Error("No promotion found");
    }

    return promotion;
  } catch (error: any) {
    throw new Error(`Failed to fetch Promotion: ${error.message}`);
  }
}

interface ParamsPromoUpdate {
  name: string;
  discount: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  limitedQuantity: number;
  authActiveProfileId: string;
  promoId: string;
  path: string;
}

// done convert to Profile Model but still need to check
export async function updatePromotion({
  name,
  discount,
  dateRange,
  limitedQuantity,
  authActiveProfileId,
  promoId,
  path,
}: ParamsPromoUpdate): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const user = await ProfileModel.findOne({ _id: authActiveProfileId });
    if (user.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("User is not authorized to update product");
    }

    await PromotionModel.findOneAndUpdate(
      { _id: promoId },
      {
        name,
        discount,
        dateRange,
        limitedQuantity,
      },
      { upsert: true }
    );

    if (path !== "/dashboard/promotions/add-new-promotions") {
      revalidatePath(path);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

//done convert to Profile Model but still need to check
export async function deletePromotion({
  promoId,
  authActiveProfileId,
}: {
  promoId: string;
  authActiveProfileId: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const user = await ProfileModel.findOne({ _id: authActiveProfileId });
    if (user.usertype.toUpperCase() !== "FLEXADMIN") {
      throw new Error("User is not authorized to delete promotion");
    }

    await PromotionModel.deleteOne({ _id: promoId });

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// line api need PREMIUM OR VERIFY
export async function getFollowers(): Promise<{
  success: boolean;
  message: string;
  followers?: string[];
}> {
  const url = "https://api.line.me/v2/bot/followers/ids";
  const channelAccessToken = process.env.NEXT_PUBLIC_MESSAGING_LINE_CHANNEL_AT;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${channelAccessToken}`,
  };

  try {
    const response = await axios.get(url, { headers });
    const followers = response.data.userIds;
    return {
      success: true,
      message: "Follower list retrieved successfully.",
      followers,
    };
  } catch (error: any) {
    console.error(
      "Error retrieving follower list:",
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      message: "Failed to retrieve follower list, Please try again later.",
    };
  }
}

// line api
export async function broadcastMessage(
  message: string
): Promise<{ success: boolean; data?: any; message: string }> {
  const url = "https://api.line.me/v2/bot/message/broadcast";
  const channelAccessToken = process.env.NEXT_PUBLIC_MESSAGING_LINE_CHANNEL_AT;

  if (!message) {
    return { success: false, message: "Message content is required." };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${channelAccessToken}`,
  };

  try {
    const response = await axios.post(
      url,
      {
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      },
      {
        headers: headers,
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Message broadcasted successfully.",
    };
  } catch (error: any) {
    console.error(
      "Error broadcasting message:",
      error.response ? error.response.data : error.message
    );
    return { success: false, message: "Failed to broadcast message." };
  }
}

// line api
// export async function sendFlexMessageThruOA({
//   userId,
//   flexContent,
// }: ParamsSendFlexMessage): Promise<{ success: boolean; message: string }> {
//   const url = "https://api.line.me/v2/bot/message/push";
//   const channelAccessToken = process.env.MESSAGING_LINE_CHANNEL_AT;
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${channelAccessToken}`,
//   };

//   if (typeof flexContent === "string") {
//     try {
//       flexContent = JSON.parse(flexContent);
//     } catch (error) {
//       console.error("Error parsing flexContent:", error);
//       return {
//         success: false,
//         message: "Something went wrong, Please try again later.",
//       };
//     }
//   }

//   const data = {
//     to: userId,
//     messages: [
//       {
//         type: "flex",
//         altText: "This is a Flex Message",
//         contents: flexContent,
//       },
//     ],
//   };

//   const JSONData = JSON.stringify(data);

//   try {
//     const response = await axios.post(url, JSONData, { headers });
//     // console.log('Message sent:', response.data);
//     return {
//       success: true,
//       message: "Card has been shared successfully, Please check your LINE.",
//     };
//   } catch (error: any) {
//     console.error(
//       "Error sharing Card Line:",
//       error.response ? error.response.data : error.message
//     );
//     return {
//       success: false,
//       message: "Failed to share card to LINE, Please try again later.",
//     };
//   }
// }
