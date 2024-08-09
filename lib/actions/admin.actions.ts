"use server";

import { connectToDB } from "../mongodb";
import SubscriptionModel from "../models/subscription";
import ProductModel from "../models/product";
import PromotionModel from "../models/promotion";
import { revalidatePath } from "next/cache";
import TransactionModel from "../models/transaction";
import MemberModel from "../models/member";
import { endOfDay, endOfWeek, startOfDay, startOfWeek, subDays, subWeeks } from "date-fns";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import OfferModel from "../models/offer";
import { Member, Usertype } from "@/types";
import OrganizationModel from "../models/organization";

export async function authorizationAdmin(
    authenticatedUserId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await connectToDB();

        const admin = await MemberModel.findOne({ user: authenticatedUserId });

        if (admin.usertype.toUpperCase() !== 'FLEXADMIN') {
            return { success: false, message: "You has no authorization to do this action." };
        }

        return { success: true };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

function generateCustomID() {
    return uuidv4();
}

interface CreateMemberWithRoleParams {
    email: string;
    userRole: string;
    authenticatedUserId: string;
}

export async function createMemberWithRole({ email, userRole, authenticatedUserId }: CreateMemberWithRoleParams) {
    try {
        await connectToDB();

        const admin = await MemberModel.findOne({ user: authenticatedUserId });
        if (admin.usertype.toUpperCase() !== 'FLEXADMIN') {
            throw new Error("User is not authorized to create member with role.");
        }

        const existingMember = await MemberModel.findOne({ email: email });

        if (!existingMember) {
            const newMember = new MemberModel({
                generatedId: generateCustomID(),
                email: email,
                usertype: userRole,
            });

            await newMember.save();
            return { success: true, message: 'Member created successfully' };
        }

        return { success: false, message: 'Member already exists' };
    } catch (error: any) {
        throw new Error(`Failed to create member: ${error.message}`);
    }
}

export async function fetchAllMember(authenticatedUserId: string) {
    try {

        await connectToDB();

        const admin = await MemberModel.findOne({ user: authenticatedUserId });

        if (admin.usertype.toUpperCase() !== 'FLEXADMIN') {
            throw new Error("Member has no authorization to fetch all members");
        }

        const members = await MemberModel.find();

        return members;
    } catch (error: any) {
        console.error(`Failed to fetch Member: ${error.message}`);
        return null;
    }
}

export async function fetchMemberStats() {
    try {
        await connectToDB();

        const today = new Date();
        const currentWeekStart = startOfWeek(today);
        const currentWeekEnd = endOfWeek(today);
        const lastWeekStart = startOfWeek(subWeeks(today, 1));
        const lastWeekEnd = endOfWeek(subWeeks(today, 1));

        const currentWeekMembers = await MemberModel.find({
            createdAt: { $gte: currentWeekStart, $lt: currentWeekEnd }
        });

        const lastWeekMembers = await MemberModel.find({
            createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd }
        });

        // Helper function to categorize members
        const categorizeMembers = (members: any[]) => {
            return {
                general: members.filter(member => member.usertype === 'PERSONAL' || member.usertype === 'ORGANIZATION'),
                professional: members.filter(member => ['PREMIUM', 'EXPERT', 'ELITE'].includes(member.usertype)),
                organization: members.filter(member => ['ORGANIZATION', 'BUSINESS', 'ENTERPRISE'].includes(member.usertype)),
                admin: members.filter(member => member.usertype === 'FLEXADMIN'),
                superuser: members.filter(member => member.usertype === 'SUPERUSER'),
            };
        };

        const currentStats = categorizeMembers(currentWeekMembers);
        const lastWeekStats = categorizeMembers(lastWeekMembers);

        const calculateIncreaseRate = (currentCount: number, lastWeekCount: number) => {
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
                increaseRate: calculateIncreaseRate(currentStats.general.length, lastWeekStats.general.length),
                isNew: lastWeekStats.general.length === 0 && currentStats.general.length > 0
            },
            professional: {
                count: currentStats.professional.length,
                increaseRate: calculateIncreaseRate(currentStats.professional.length, lastWeekStats.professional.length),
                isNew: lastWeekStats.professional.length === 0 && currentStats.professional.length > 0
            },
            organization: {
                count: currentStats.organization.length,
                increaseRate: calculateIncreaseRate(currentStats.organization.length, lastWeekStats.organization.length),
                isNew: lastWeekStats.organization.length === 0 && currentStats.organization.length > 0
            },
            admin: {
                count: currentStats.admin.length,
                increaseRate: calculateIncreaseRate(currentStats.admin.length, lastWeekStats.admin.length),
                isNew: lastWeekStats.admin.length === 0 && currentStats.admin.length > 0
            },
            superuser: {
                count: currentStats.superuser.length,
                increaseRate: calculateIncreaseRate(currentStats.superuser.length, lastWeekStats.superuser.length),
                isNew: lastWeekStats.superuser.length === 0 && currentStats.superuser.length > 0
            },
        };
    } catch (error) {
        console.error("Error fetching member stats:", error);
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

export async function fetchTransactionStats(
    authenticatedUserId: string, startDate: Date | null, endDate: Date | null
) {
    try {
        await connectToDB();

        if (!endDate) {
            endDate = new Date();
        }

        if (!startDate) {
            startDate = subDays(endDate, 7);
        }

        const user = await MemberModel.findOne({ user: authenticatedUserId });
        const userType = user.usertype.toUpperCase();

        if (userType !== 'FLEXADMIN' && userType !== 'FLEXACCOUNTANT') {
            throw new Error("User is not authorized to fetch transaction stats.");
        }

        const previousStartDate = subDays(startDate, endDate.getTime() - startDate.getTime());
        const previousEndDate = subDays(endDate, endDate.getTime() - startDate.getTime());

        const transactions: Transaction[] = await TransactionModel.find({
            transactionDate: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) }
        });

        const previousTransactions: Transaction[] = await TransactionModel.find({
            transactionDate: { $gte: startOfDay(previousStartDate), $lte: endOfDay(previousEndDate) }
        });

        const totalTransactions = transactions.length;
        const totalFees = transactions.reduce((sum, transaction) => sum + transaction.transactionFees, 0);

        const previousTotalTransactions = previousTransactions.length;
        const previousTotalFees = previousTransactions.reduce((sum, transaction) => sum + transaction.transactionFees, 0);

        const calculateIncreaseRate = (current: number, previous: number) => {
            if (current === 0 && previous === 0) {
                return 0;
            } else if (previous === 0) {
                return 100;
            } else {
                return ((current - previous) / previous) * 100;
            }
        };

        const transactionIncreaseRate = calculateIncreaseRate(totalTransactions, previousTotalTransactions);
        const feeIncreaseRate = calculateIncreaseRate(totalFees, previousTotalFees);

        const transactionsByDate: TransactionsByDate = transactions.reduce((acc: TransactionsByDate, transaction) => {
            const date = transaction.transactionDate.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(transaction);
            return acc;
        }, {});

        const chartData = Object.entries(transactionsByDate).map(([date, transactions]) => ({
            date,
            count: transactions.length,
            fees: transactions.reduce((sum, transaction) => sum + transaction.transactionFees, 0)
        }));

        if (chartData.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            chartData.push({ date: today, count: 0, fees: 0 });
        }

        return {
            success: true,
            totalTransactions,
            totalFees,
            transactionIncreaseRate,
            feeIncreaseRate,
            chartData
        };
    } catch (error: any) {
        return { success: false, message: `Failed to fetch transaction details: ${error.message}` };
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

export async function fetchMember(userId: string) {
    try {
        await connectToDB();

        const member = await MemberModel.findOne({ user: userId });

        return member;
    } catch (error: any) {
        throw new Error(`Failed to fetch Member: ${error.message}`);
    }
}

export async function fetchMemberDetails(
    userId: string
): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        await connectToDB();

        const member = await MemberModel.findOne({ user: userId })
            .select("usertype ip_address country organization")
            .populate({
                path: "organization",
                options: { lean: true }
            })
            .lean<Member>();

        if (!member) {
            return { success: false, message: "Member not found" };
        }

        let verifiedAdminName = null;
        if (member.organization && member.organization.verify.verifiedBy) {
            const verifiedAdmin = await MemberModel.findOne({ user: member.organization.verify.verifiedBy}).select("accountname").lean<Member>();
            if (verifiedAdmin) {
                verifiedAdminName = verifiedAdmin.accountname;
            }
        }

        const restructureMemberOrganization = member.organization ? {
            ...member.organization,
            verify: {
                ...member.organization.verify,
                verifiedBy: verifiedAdminName,
            }
        } : null;

        const structuredMember = {
            ...member,
            organization: restructureMemberOrganization,
        };

        return { success: true, data: structuredMember };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function verifyOrganizationStatus(
    authenticatedUserId: string, organizationId: string
): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        await connectToDB();

        const member = await MemberModel.findOne({ user: authenticatedUserId }).select("usertype accountname");

        if (member.usertype.toUpperCase() !== 'FLEXADMIN' && member.usertype.toUpperCase() !== 'FLEXHR') {
            return { success: false, message: "User is not authorized to verify organization status." };
        }

        const organization = await OrganizationModel.findOne({ _id: organizationId }).select("verify");
        
        if (!organization) {
            return { success: false, message: "Organization not found." };
        }

        organization.verify.verified = true;
        organization.verify.verifiedAt = new Date();
        organization.verify.verifiedBy = authenticatedUserId;

        const returnOrganizationVerifyDetails = organization.verify;
        returnOrganizationVerifyDetails.verifiedBy = member.accountname;

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

export async function fetchCountMemberByDateRange(
    startDate: Date | null, endDate: Date | null
): Promise<{ success: boolean; data?: { date: string; totalMembers: number }[]; message?: string }> {
    try {
        await connectToDB();

        let modifiedEndDate = endDate || new Date();
        if (endDate) {
            modifiedEndDate = endOfDay(new Date(endDate));
        }

        const members = await MemberModel.find({
            createdAt: { $gte: startDate, $lte: modifiedEndDate }
        }).sort({ createdAt: 'asc' });

        const dayArray: { date: string; totalMembers: number }[] = [];

        if (members && members.length > 0) {
            let currentDate = startDate || (members.length ? startOfDay(members[0].createdAt) : new Date());
            while (currentDate <= modifiedEndDate) {
                dayArray.push({
                    date: currentDate.toISOString().slice(0, 10),
                    totalMembers: 0
                });
                currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
            }

            members.forEach((member: { createdAt: Date }) => {
                const memberDateStr = member.createdAt.toISOString().slice(0, 10);
                const day = dayArray.find(day => day.date === memberDateStr);
                if (day) {
                    day.totalMembers += 1;
                }
            });
        }

        return { success: true, data: dayArray };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function fetchTotalMemberByDateRange(
    startDate: Date | null, endDate: Date | null
): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
        await connectToDB();

        let modifiedEndDate = endDate || new Date();
        if (endDate) {
            modifiedEndDate = endOfDay(new Date(endDate));
        }

        const members = await MemberModel.find({
            createdAt: { $gte: startDate, $lte: modifiedEndDate }
        }).sort({ createdAt: 'asc' });

        const dayArray: { date: string; totalMembers: number; totalPersonal: number; totalOrganization: number }[] = [];

        let totalMembers = 0;
        let totalPersonal = 0;
        let totalOrganization = 0;

        let currentDate = startDate || (members.length ? startOfDay(members[0].createdAt) : new Date());

        while (currentDate <= modifiedEndDate) {
            dayArray.push({
                date: currentDate.toISOString().slice(0, 10),
                totalMembers: 0,
                totalPersonal: 0,
                totalOrganization: 0
            });
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }

        members.forEach((member: { createdAt: Date, usertype: string }) => {
            const memberDateStr = member.createdAt.toISOString().slice(0, 10);
            const day = dayArray.find(day => day.date === memberDateStr);

            if (day) {
                day.totalMembers += 1;
                totalMembers += 1;

                if (member.usertype === 'PERSONAL') {
                    day.totalPersonal += 1;
                    totalPersonal += 1;
                } else if (member.usertype === 'ORGANIZATION') {
                    day.totalOrganization += 1;
                    totalOrganization += 1;
                }
            }
        });

        dayArray.reduce((acc, day) => {
            day.totalMembers = acc.totalMembers + day.totalMembers;
            day.totalPersonal = acc.totalPersonal + day.totalPersonal;
            day.totalOrganization = acc.totalOrganization + day.totalOrganization;

            return {
                totalMembers: day.totalMembers,
                totalPersonal: day.totalPersonal,
                totalOrganization: day.totalOrganization
            };
        }, { totalMembers: 0, totalPersonal: 0, totalOrganization: 0 });

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

        const subscription = await SubscriptionModel.findOne({ _id: subscriptionId });

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

export async function fetchTransactionStatusFromSubsciptionId(
    subscriptionId: string, transactionId: string
): Promise<{ success: boolean; status?: boolean; estimatedEndDate?: Date; message?: string }> {
    try {
        await connectToDB();

        const subscription = await SubscriptionModel.findOne({ _id: subscriptionId }).select('transaction estimatedEndDate plan');
        if (!subscription) {
            throw new Error("No subscription found");
        }

        const transactionObjectIds = subscription.transaction;

        const transaction = await TransactionModel.findOne({ _id: { $in: transactionObjectIds }, id: transactionId });

        if (!transaction) {
            throw new Error("No specific transaction found");
        }

        const product = await ProductModel.findOne({ _id: subscription.plan });
        console.log("Product: ", product);

        const planCategory = product.category;

        const member = await MemberModel.findOne({ subscription: { $in: [subscriptionId] } }).select("user");

        const newUserType = checkAndReturnUserType(product.name, planCategory);

        let returnMessage: string;
        if (transaction.transactionStatus == true) {
            const result = await updateUserType(member.user, newUserType);
            if (result.success) {
                returnMessage = "Thank you for subscribing to our service. Your subscription is now active.";
            } else {
                returnMessage = "Something went wrong while updating your user type, please contact to our customer service for any assistance.";
            }
        } else {
            returnMessage = "Something went wrong while subscribing to our service, please contact to our customer service for any assistance."
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
            message: "Something went wrong while subscribing to our service, please contact to our customer service for any assistance. Error Code: " + error.message,
        };
    }
}

export async function updateUserType(memberId: string, userType: any) {
    try {
        await connectToDB();

        const member = await MemberModel.findOne({ user: memberId });

        if (!member) {
            throw new Error("Member not found");
        }

        member.usertype = userType;
        await member.save();

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function fetchSubscriptionByDateRange(
    startDate: Date | null, endDate: Date | null
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
                $lte: endDate || new Date()
            }
        }).populate({
            path: 'transaction',
            model: TransactionModel,
            match: {
                transactionDate: {
                    $gte: startDate || new Date(0),
                    $lte: endDate || new Date()
                }
            }
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
    authenticatedUserId: string;
    path: string;
}

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
    authenticatedUserId,
    path,
}: ParamsProductDetails): Promise<{ success: boolean; message?: string }> {
    try {
        await connectToDB();

        const user = await MemberModel.findOne({ user: authenticatedUserId });
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

export async function storeSubscription({
    authenticatedUserId,
    productId,
    paidTerms,
    totalAmount,
}: {
    authenticatedUserId: string;
    productId: string;
    paidTerms: number;
    totalAmount: number;
}): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        await connectToDB();

        const member = await MemberModel.findOne({ user: authenticatedUserId }).populate('offers');

        if (!member) {
            return { success: false, message: 'Member not found' };
        }

        let planStarted;
        let estimatedEndDate;
        let hasTrialOffer = false;

        if (member.offers && member.offers.length > 0) {
            for (const offerId of member.offers) {
                const offer = await OfferModel.findById(offerId);

                if (offer && offer.type === 'trial') {
                    hasTrialOffer = true;
                    break;
                }
            }
        }

        if (hasTrialOffer) {
            planStarted = new Date();
            estimatedEndDate = new Date(planStarted);
            estimatedEndDate.setMonth(planStarted.getMonth() + paidTerms);

            return await createSubscription(member, productId, paidTerms, totalAmount, planStarted, estimatedEndDate);
        } else {
            const trialStartDate = new Date();
            const trialEndDate = new Date(trialStartDate);
            trialEndDate.setDate(trialStartDate.getDate() + 14);

            const trial = new OfferModel({
                plan: productId,
                startDate: trialStartDate,
                endDate: trialEndDate,
                type: 'trial',
            });

            await trial.save();

            member.offers.push(trial._id);
            await member.save();

            planStarted = trialEndDate;
            estimatedEndDate = new Date(planStarted);
            estimatedEndDate.setMonth(planStarted.getMonth() + paidTerms);

            return await createSubscription(member, productId, paidTerms, totalAmount, planStarted, estimatedEndDate);
        }
    } catch (error: any) {
        console.error('Error storing subscription:', error);
        return { success: false, message: error.message };
    }
}

async function createSubscription(
    member: any,
    productId: string,
    paidTerms: number,
    totalAmount: number,
    planStarted: Date,
    estimatedEndDate: Date
) {
    try {
        const subscription = new SubscriptionModel({
            id: uuidv4(),
            planStarted,
            estimatedEndDate,
            paidTerms,
            totalAmount,
            plan: productId,
            transaction: [],
        });

        await subscription.save();

        member.subscription.push(subscription._id);
        await member.save();

        return { success: true, data: subscription._id.toString() };
    } catch (error: any) {
        console.error('Error creating subscription:', error);
        return { success: false, message: error.message };
    }
}

export async function fetchSubsriptionById(orderId: string): Promise<any> {
    try {
        await connectToDB();

        const subscription = await SubscriptionModel.findOne({ _id: orderId }).lean();

        if (!subscription) {
            throw new Error("No subscription found");
        }

        return subscription;
    } catch (error: any) {
        throw new Error(`Failed to fetch subscription: ${error.message}`);
    }
}

export async function fetchSubsriptionTotalAmountById(orderId: string): Promise<any> {
    try {
        await connectToDB();

        const subscription = await SubscriptionModel.findOne({ _id: orderId });

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

        const subscription = await SubscriptionModel.findOne({ _id: orderId });

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
    authenticatedUserId: string;
    productId: string;
    path: string;
}

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
    authenticatedUserId,
    productId,
    path,
}: ParamsUpdate): Promise<{ success: boolean; message?: string }> {
    try {
        await connectToDB();

        const user = await MemberModel.findOne({ user: authenticatedUserId });
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

export async function deleteProduct({ productId, authenticatedUserId }
    : { productId: string; authenticatedUserId: string }
): Promise<{ success: boolean; message?: string }> {
    try {
        await connectToDB();

        const user = await MemberModel.findOne({ user: authenticatedUserId });
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
    authenticatedUserId: string;
}

export async function insertNewPromotion({
    name,
    code,
    discount,
    dateRange,
    limitedQuantity,
    authenticatedUserId,
}: ParamsPromotionDetails): Promise<{ success: boolean; message?: string }> {
    try {
        await connectToDB();

        const user = await MemberModel.findOne({ user: authenticatedUserId });
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

export async function fetchAllPromotion(): Promise<{ success: boolean; data?: ParamsPromotionDetails[]; message?: string }> {
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
    authenticatedUserId: string;
    promoId: string;
    path: string;
}

export async function updatePromotion({
    name,
    discount,
    dateRange,
    limitedQuantity,
    authenticatedUserId,
    promoId,
    path,
}: ParamsPromoUpdate): Promise<{ success: boolean; message?: string }> {
    try {
        await connectToDB();

        const user = await MemberModel.findOne({ user: authenticatedUserId });
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

export async function deletePromotion({ promoId, authenticatedUserId }
    : { promoId: string; authenticatedUserId: string }
): Promise<{ success: boolean; message?: string }> {
    try {
        await connectToDB();

        const user = await MemberModel.findOne({ user: authenticatedUserId });
        if (user.usertype.toUpperCase() !== "FLEXADMIN") {
            throw new Error("User is not authorized to delete promotion");
        }

        await PromotionModel.deleteOne({ _id: promoId });

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// line api
export async function getFollowers(): Promise<{ success: boolean; message: string; followers?: string[] }> {
    const url = 'https://api.line.me/v2/bot/followers/ids';
    const channelAccessToken = process.env.MESSAGING_LINE_CHANNEL_AT;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
    };

    try {
        const response = await axios.get(url, { headers });
        const followers = response.data.userIds;
        return { success: true, message: 'Follower list retrieved successfully.', followers };
    } catch (error: any) {
        console.error('Error retrieving follower list:', error.response ? error.response.data : error.message);
        return { success: false, message: 'Failed to retrieve follower list, Please try again later.' };
    }
}

