"use server";

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { GridFSBucket } from 'mongodb';
import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongodb";
import Member from "../models/member";
import Card from "../models/card";
import Image from "../models/image";
import Organization from "../models/organization";
import { Readable } from "stream";
import { headers } from "next/headers";
import { startOfDay, subMinutes } from "date-fns";
import ComponentModel from "../models/component";
import MemberModel from "../models/member";

export async function authenticateUser(email: string, password: string) {
    try {
        connectToDB();

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

export async function createUser(email: string, username: string, password: string) {
    try {
        connectToDB();

        const existingUser = await Member.findOne({ email });
        if (existingUser) {
            throw new Error("User with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await Member.create({ email, username, password: hashedPassword });

        return newUser;
    } catch (error: any) {
        throw new Error(`Failed to create user: ${error.message}`);
    }
}

export async function createMember(userId: string) {
    try {
        connectToDB();

        const existingMember = await Member.findOne({ user: userId });

        if (!existingMember) {

            const newMember = new Member({
                user: userId,
            });

            await newMember.save();
            return true;
        }

        return false;
    } catch (error: any) {
        throw new Error(`Failed to create member: ${error.message}`);
    }
}

export async function getIPCountryInfo() {
    if (process.env.NODE_ENV === 'development') {
        // const ip = "2001:f40:983:ca54:11c7:d9be:7e0c:eab1" // MY IP address for testing
        const ip = '103.123.240.66'; // TW IP address for testing
        return fetch(`http://ip-api.com/json/${ip}`)
            .then(response => response.json())
            .then(data => {
                return {
                    ip: data.query,
                    country: data.country,
                    countryCode: data.countryCode,
                    region: data.regionName,
                    city: data.city
                };
            });
    } else {
        const headersList = headers()
        const ip = headersList.get('request-ip');
        return fetch(`http://ip-api.com/json/${ip}`)
            .then(response => response.json())
            .then(data => {
                return {
                    ip: data.query,
                    country: data.country,
                    countryCode: data.countryCode,
                    region: data.regionName,
                    city: data.city
                };
            });
    }
}

export async function getGeoInfoByIP(ipAddress: string) {
    return fetch(`http://ip-api.com/json/${ipAddress}`)
        .then(response => response.json())
        .then(data => {
            return {
                ip: data.query,
                country: data.country,
                countryCode: data.countryCode,
                region: data.regionName,
                city: data.city
            };
        });
}

export async function updateLastLoginDateAndIP(userId: string, ipAddress: string) {
    try {
        connectToDB();

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
                        ip_address: ipAddress
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
        const imageUrl = await Image.findOne({ _id: imageId });

        return imageUrl;
    } catch (error: any) {
        throw new Error(`Failed to fetch Image: ${error.message}`);
    }
}

// not working 
export async function fetchUser(userId: string) {
    try {
        await connectToDB();

        const db = mongoose.connection.getClient().db();
        const testCollection = db.collection('test');

        const cursor = testCollection.find({ 'users.user': userId });
        const userArray = await cursor.toArray();

        console.log("User123: " + JSON.stringify(userArray));

        return userArray;
    } catch (error: any) {
        throw new Error(`Failed to fetch User: ${error.message}`);
    }
}

interface Params {
    authUserId: string,
    accountId: string,
    method: string
}

export async function updateMemberFollow(params: Params): Promise<void> {
    try {
        connectToDB();

        const { authUserId, accountId, method } = params;
        const currentMember = await Member.findOne({ user: authUserId });
        const accountMember = await Member.findOne({ user: accountId });

        if (!currentMember) {
            throw new Error("Current member not found");
        }

        let updatedFollowing: string[] = [...currentMember.following];
        let updateFollower: string[] = [...accountMember.follower]

        if (method.toUpperCase() === "FOLLOW") {
            if (!updatedFollowing.includes(accountId)) {
                updatedFollowing.push(accountId);
            }
            if (!updateFollower.includes(authUserId)) {
                updateFollower.push(authUserId);
            }
        } else if (method.toUpperCase() === "UNFOLLOW") {
            updatedFollowing = updatedFollowing.filter(id => id !== accountId);
            updateFollower = updateFollower.filter(id => id !== authUserId);
        }

        await Promise.all([
            Member.findByIdAndUpdate(currentMember._id, { following: updatedFollowing }),
            Member.findByIdAndUpdate(accountMember._id, { followers: updateFollower })
        ]);

    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

interface ParamsCardLikes {
    authUserId: string,
    cardId: string,
}

export async function updateCardLikes(params: ParamsCardLikes): Promise<{success: boolean; data?: any[]; message?: string}> {
    try {
        connectToDB();

        const { authUserId, cardId } = params;
        const card = await Card.findById(cardId);

        if (!card) {
            throw new Error("Card not found");
        }

        let update;
        const userHasLiked = card.likes.includes(authUserId);

        if (userHasLiked) {
            update = { $pull: { likes: authUserId } };
        } else {
            update = { $addToSet: { likes: authUserId } };
        }

        const updatedCard = await Card.findByIdAndUpdate(cardId, update, { new: true });

        if (!updatedCard) {
            throw new Error("Update failed");
        }

        // update and return likes after fetch user image
        const likesDetails = await Promise.all(updatedCard.likes.map(async (likeId: any) => {
            const likeUser = await MemberModel.findOne({ user: likeId }).select('accountname image');
            if (likeUser && likeUser.image) {
                const imageDoc = await Image.findById(likeUser.image).select('binaryCode');
                return {
                    accountname: likeUser.accountname,
                    binarycode: imageDoc ? imageDoc.binaryCode : undefined
                };
            }
            return {
                accountname: likeUser ? likeUser.accountname : "Unknown",
                binarycode: undefined
            };
        }));

        return { success: true, data: likesDetails};
    }
    catch (error: any) {
        return { success: false, message: `Failed to update card likes: ${error.message}` };
    }
}

interface ParamsUpdWebURL {
    authUserId: string,
    url: string,
}

export async function updateOrganizationUrl(params: ParamsUpdWebURL): Promise<void> {
    try {
        connectToDB();

        const { authUserId, url } = params;
        const currentMember = await Member.findOne({ user: authUserId });

        if (!currentMember) {
            throw new Error("Current member not found");
        }

        if (currentMember.usertype.toUpperCase() !== 'ORGANIZATION') {
            throw new Error("Current member isn't Organization owner.");
        }

        const organization = await Organization.findOne({ organizationID: currentMember._id });

        if (!organization) {
            throw new Error("Organization not found");
        }

        organization.webUrl = url;

        await organization.save();

    } catch (error: any) {
        throw new Error(`Failed to update weburl: ${error.message}`);
    }
}

export async function uploadImageToGridFS(imageData: Buffer, filename: string): Promise<string> {
    try {
        await connectToDB();

        const db = mongoose.connection.getClient().db();
        const bucket = new GridFSBucket(db);

        const readableStream = new Readable();
        readableStream.push(imageData);
        readableStream.push(null);

        const uploadStream = bucket.openUploadStream(filename);
        const uploadPromise = new Promise<string>((resolve, reject) => {
            uploadStream.once('finish', () => {
                resolve(uploadStream.id.toString());
            });
            uploadStream.once('error', (err) => {
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
    accountname: string;
    email: string;
    password: string;
    phone: string;
    shortdescription: string;
    ip_address: string;
    country?: string;
    countrycode?: string;
    image: {
        binaryCode: string;
        name: string;
    };
    path: string;
}

type UpdateMemberData = {
    accountname: string;
    email: string;
    password: string;
    phone: string;
    shortdescription: string;
    ip_address: string;
    image: any;
    onboarded: boolean;
    country?: string;
    countrycode?: string;
};

export async function updateMemberDetails({
    userId,
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
        connectToDB();

        const existingUser = await Member.findOne({ email });
        if (existingUser && path != '/profile/edit') {
            throw new Error("User with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const savedImage = await Image.create({
            binaryCode: image.binaryCode,
            name: image.name,
        });
        const imageId = savedImage._id;

        const updateData: UpdateMemberData = {
            accountname: accountname,
            email: email,
            password: hashedPassword,
            phone: phone,
            shortdescription: shortdescription,
            ip_address: ip_address,
            image: imageId,
            onboarded: true,
        };

        if (path !== "/profile/edit") {
            updateData.country = country;
            updateData.countrycode = countrycode;
        }

        await Member.findOneAndUpdate(
            { user: userId },
            updateData,
            { upsert: true }
        );

        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

interface ParamsUpdateCardViewData {
    userId?: string;
    cardId: string;
}

export async function updateCardViewData({
    userId, cardId
}: ParamsUpdateCardViewData) {
    const now = new Date();
    const threeMinutesAgo = subMinutes(now, 3);

    try {
        const card = await Card.findById(cardId);
        if (!card) {
            throw new Error("Card not found");
        }

        const lastView = card.viewDetails.find((v: {
            viewerId: { toString: () => string | undefined; };
        }) => v.viewerId.toString() === userId);
        if (lastView && lastView.viewedAt > threeMinutesAgo) {
            console.log(`${userId} view ${cardId} considered spam and not recorded.`);
            return null;
        }

        const today = startOfDay(new Date());
        const result = await Card.findByIdAndUpdate(
            cardId,
            {
                $inc: { "totalViews": 1 },
                $push: {
                    "viewDetails": {
                        viewerId: userId,
                        viewedAt: now
                    }
                },
                $addToSet: {
                    "dailyViews": {
                        $each: [],
                        $not: { $elemMatch: { date: today } }
                    }
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        if (!result.dailyViews.some((e: {
            date: { toISOString: () => string; };
        }) => e.date.toISOString() === today.toISOString())) {
            result.dailyViews.push({ date: today, count: 1 });
            await result.save();
        } else {
            await Card.updateOne(
                { _id: cardId, "dailyViews.date": today },
                { $inc: { "dailyViews.$.count": 1 } }
            );
        }

        return result;
    } catch (error) {
        console.error("Failed to update card view data:", error);
        throw error;
    }
}

export async function fetchCardViewDetails(
    cardId: string, startDate: Date | null, endDate: Date | null
): Promise<{success: boolean; data?: any[]; message?: string}> {
    try {
        connectToDB();

        if (endDate === null) {
            endDate = new Date();
        }

        const query = { _id: cardId, 'viewDetails.viewedAt': { $gte: startDate, $lte: endDate } };
        const card = await Card.findOne(query).select('viewDetails');

        if (!card) {
            throw new Error("Card not found");
        }

        const views = card.viewDetails;
        const dayMap = new Map();

        views.forEach((view: { viewedAt: string | number | Date; }) => {
            const date = new Date(view.viewedAt).toISOString().slice(0, 10);
            dayMap.set(date, (dayMap.get(date) || 0) + 1);
        });

        const chartData = Array.from(dayMap).map(([date, count]) => ({
            date, totalViews: count
        }));

        return { success: true, data: chartData };
    } catch (error: any) {
        return { success: false, message: `Failed to fetch card view details: ${error.message}` };
    }
}

export async function fetchOnlyCardId(userId: string) {
    try {
        connectToDB();

        const cardId = await Member.findOne({ user: userId }).select('cards');
        const cardWithTitle = await Card.find({ '_id': { $in: cardId.cards } }).select('title');
        
        return cardWithTitle;
    } catch (error) {
        console.error("Error fetching cards:", error);
        throw error;
    }
}

export async function fetchPersonalCards(userId: string) {
    try {
        connectToDB();

        const member = await Member.findOne({ user: userId });

        if (!member) {
            throw new Error(`Member with ID ${userId} not found.`);
        }

        if (!member.cards) {
            throw new Error(`Member with ID ${userId} has no cards.`);
        }

        const cards = await Card.find({
            '_id': { $in: member.cards }
        });


        const cardsData = await Promise.all(cards.map(async (card) => {

            const creator = await MemberModel.findOne({ user: card.creator }).select('accountname image');
            const creatorImage = await Image.findOne({ _id: creator.image }).select('binaryCode');
            const creatorData = {
                accountname: creator ? creator.accountname : "Unknown",
                image: creator && creatorImage ? creatorImage.binaryCode : undefined
            };

            const componentInCard = await Card.findOne({ _id: card }).select('components');

            const likesDetails = await Promise.all(card.likes.map(async (likeId: any) => {
                const likeUser = await MemberModel.findOne({ user: likeId }).select('accountname image');
                if (likeUser && likeUser.image) {
                    const imageDoc = await Image.findById(likeUser.image).select('binaryCode');
                    return {
                        accountname: likeUser.accountname,
                        binarycode: imageDoc ? imageDoc.binaryCode : undefined
                    };
                }
                return {
                    accountname: likeUser ? likeUser.accountname : "Unknown",
                    binarycode: undefined
                };
            }));

            const followers = await Promise.all(card.followers.map((id: any) => MemberModel.find({ user: id }).select('accountname')));
            // const followersImage = await Promise.all(card.followers.map((id: any) => MemberModel.findById(id).select('image')));
            // const followersImageBinary = await Promise.all(followersImage.map((image: any) => Image.find(image.image).select('binaryCode')));
            const components = await ComponentModel.findOne({ _id: componentInCard.components }).select('content');

            // console.log("Like Image: " + JSON.stringify(likesImage));
            // console.log("likes image binary: " + JSON.stringify(likesImageBinary)); 
            // console.log("likes image: " + likesImageBinary);
            // console.log("followers image: " + followersImageBinary);

            return {
                cardId: card._id,
                title: card.title,
                creator: creatorData,
                likes: likesDetails,
                followers: followers.map(follower => ({ accountname: follower.accountname })),
                components: {
                    content: components ? components.content : undefined,
                },
            };
        }));

        // console.log("cardsData: " + JSON.stringify(cardsData));

        return cardsData;
    } catch (error) {
        console.error("Error fetching personal cards:", error);
        throw error;
    }
}


