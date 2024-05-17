"use server";

import { connectToDB } from "../mongodb";
import Member from "../models/member";
import SubscriptionModel from "../models/subscription";
import ProductModel from "../models/product";
import PromotionModel from "../models/promotion";

export async function fetchAllMember(authenticatedUserId: string) {
    try {

        connectToDB();

        const admin = await Member.findOne({ user: authenticatedUserId });

        if (admin.usertype.toUpperCase() !== 'FLEXADMIN') {
            throw new Error("Member has no authorization to fetch all members");
        }

        const members = await Member.find();

        return members;
    } catch (error: any) {
        console.error(`Failed to fetch Member: ${error.message}`);
        return null;
    }
}

export async function fetchMember(userId: string) {
    try {

        connectToDB();

        const member = await Member.findOne({ user: userId });

        return member;
    } catch (error: any) {
        throw new Error(`Failed to fetch Member: ${error.message}`);
    }
}

export async function generateSubscription() {
    try {

        connectToDB();

        const dummySubscription = new SubscriptionModel({
            id: "sub123",
            planStarted: new Date(),
            estimatedEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            autoRenew: true,
            paidTerms: 1,
            plan: [],
            transaction: [],
        });

        const savedSubscription = await dummySubscription.save();

        const member = await Member.findOne({ user: "664599b296183879f95b32b5" });

        if (!member) {
            throw new Error("Current member not found");
        }

        const updatedSubscription = [...member.subscription, savedSubscription._id];

        await Member.findOneAndUpdate(
            { user: "664599b296183879f95b32b5" },
            {
                subscription: updatedSubscription,
            },
            { upsert: true }
        );

    } catch (error) {
        console.error("Failed to create dummy subscription:", error);
    }
}

export async function fetchSubscriptionById(subscriptionId: string) {
    try {
        const subscription = await SubscriptionModel.findOne({ _id: subscriptionId });

        if (!subscription) {
            throw new Error("No subscription found");
        }

        return subscription;
    } catch (error: any) {
        throw new Error(`Failed to fetch Member: ${error.message}`);
    }
}

interface ParamsProductDetails {
    name: string;
    description: string;
    price: number;
    availablePromo: string; //array
    features: { name: string }[];
    limitedCard: number;
    limitedIP: number;
    authenticatedUserId: string;
}

export async function InsertNewProduct({
    name,
    description,
    price,
    availablePromo,
    features,
    limitedCard,
    limitedIP,
    authenticatedUserId,
}: ParamsProductDetails): Promise<{ success: boolean; message?: string }> {
    try {
        connectToDB();

        const user = await Member.findOne({ user: authenticatedUserId });
        if (user.usertype.toUpperCase() !== "FLEXADMIN") {
            throw new Error("User is not authorized to add new product");
        }

        const newProduct = new ProductModel({
            name,
            description,
            price,
            availablePromo,
            features,
            limitedCard,
            limitedIP,
        });

        await newProduct.save();

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

interface ParamsPromotionDetails {
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

export async function InsertNewPromotion({
    name,
    code,
    discount,
    dateRange,
    limitedQuantity,
    authenticatedUserId,
}: ParamsPromotionDetails): Promise<{ success: boolean; message?: string }> {
    try {
        connectToDB();

        const user = await Member.findOne({ user: authenticatedUserId });
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
