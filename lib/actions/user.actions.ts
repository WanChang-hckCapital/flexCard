"use server";

import bcrypt from "bcrypt";
import mongoose, { FilterQuery, SortOrder } from "mongoose";
import { GridFSBucket } from 'mongodb';
import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongodb";
import Member from "../models/member";
import Card from "../models/card";
import Organization from "../models/organization";
import { Readable } from "stream";

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

            console.log("user: " + userId);

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

export async function fetchMember(userId: string) {
    try {
        const member = await Member.findOne({ user: userId });

        console.log("Member: " + member);

        return member;
    } catch (error: any) {
        throw new Error(`Failed to fetch Member: ${error.message}`);
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

// export async function uploadImageToGridFS(imageData: File, filename: string): Promise<string> {
//     try {
//         await connectToDB();

//         const db = mongoose.connection.getClient().db();
//         const bucket = new GridFSBucket(db);

//         const readableStream = new Readable();
//         readableStream.push(imageData);
//         readableStream.push(null);

//         const uploadStream = bucket.openUploadStream(filename);
//         const uploadPromise = new Promise<string>((resolve, reject) => {
//             uploadStream.once('finish', () => {
//                 resolve(uploadStream.id.toString());
//             });
//             uploadStream.once('error', (err) => {
//                 reject("something when wrong: " + err);
//             });
//         });

//         readableStream.pipe(uploadStream);

//         return await uploadPromise;
//     } catch (error:any) {
//         throw new Error(`Failed to upload image to GridFS: ${error.message}`);
//     }
// }

interface ParamsMemberDetails {
    userId: string;
    accountname: string;
    email: string;
    password: string;
    phone: string;
    shortdescription: string;
    image: string;
    path: string;
}


export async function updateMemberDetails({
    userId,
    accountname,
    email,
    password,
    phone,
    shortdescription,
    image,
    path,
}: ParamsMemberDetails): Promise<void> {
    try {
        connectToDB();

        const existingUser = await Member.findOne({ email });
        if (existingUser) {
            throw new Error("User with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Member.findOneAndUpdate(
            { user: userId },
            {
                accountname: accountname,
                email,
                password: hashedPassword,
                phone,
                shortdescription,
                image,
                onboarded: true,
            },
            { upsert: true }
        );

        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

// export async function updateUser({
//     userId,
//     bio,
//     name,
//     path,
//     username,
//     image,
// }: Params): Promise<void> {
//     try {
//         connectToDB();

//         await User.findOneAndUpdate(
//             { id: userId },
//             {
//                 username: username.toLowerCase(),
//                 name,
//                 bio,
//                 image,
//                 onboarded: true,
//             },
//             { upsert: true }
//         );

//         if (path === "/profile/edit") {
//             revalidatePath(path);
//         }
//     } catch (error: any) {
//         throw new Error(`Failed to create/update user: ${error.message}`);
//     }
// }

export async function fetchPersonalCards(userId: string) {
    try {
        connectToDB();

        const user = await Member.findOne({ user: userId }).populate({
            path: "cards",
            model: Card,
            populate: [
                {
                    path: "creator",
                    model: Member,
                    select: "accountname user",
                    populate: {
                        path: "user",
                        model: Member,
                        select: "image",
                    },
                },
                {
                    path: "likes",
                    model: Member,
                    select: "accountname user",
                    populate: {
                        path: "user",
                        model: Member,
                        select: "image",
                    },
                },
                {
                    path: "followers",
                    model: Member,
                    select: "accountname user",
                    populate: {
                        path: "user",
                        model: Member,
                        select: "image",
                    },
                },
            ],
        });

        if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        console.log("db User: " + user);
        console.log("db cards: " + user.cards);

        return user;
    } catch (error) {
        console.error("Error fetching user cards:", error);
        throw error;
    }
}

// // Almost similar to Thead (search + pagination) and Community (search + pagination)
// export async function fetchUsers({
//   userId,
//   searchString = "",
//   pageNumber = 1,
//   pageSize = 20,
//   sortBy = "desc",
// }: {
//   userId: string;
//   searchString?: string;
//   pageNumber?: number;
//   pageSize?: number;
//   sortBy?: SortOrder;
// }) {
//   try {
//     connectToDB();

//     // Calculate the number of users to skip based on the page number and page size.
//     const skipAmount = (pageNumber - 1) * pageSize;

//     // Create a case-insensitive regular expression for the provided search string.
//     const regex = new RegExp(searchString, "i");

//     // Create an initial query object to filter users.
//     const query: FilterQuery<typeof User> = {
//       id: { $ne: userId }, // Exclude the current user from the results.
//     };

//     // If the search string is not empty, add the $or operator to match either username or name fields.
//     if (searchString.trim() !== "") {
//       query.$or = [
//         { username: { $regex: regex } },
//         { name: { $regex: regex } },
//       ];
//     }

//     // Define the sort options for the fetched users based on createdAt field and provided sort order.
//     const sortOptions = { createdAt: sortBy };

//     const usersQuery = User.find(query)
//       .sort(sortOptions)
//       .skip(skipAmount)
//       .limit(pageSize);

//     // Count the total number of users that match the search criteria (without pagination).
//     const totalUsersCount = await User.countDocuments(query);

//     const users = await usersQuery.exec();

//     // Check if there are more users beyond the current page.
//     const isNext = totalUsersCount > skipAmount + users.length;

//     return { users, isNext };
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     throw error;
//   }
// }

// export async function getActivity(userId: string) {
//   try {
//     connectToDB();

//     // Find all threads created by the user
//     const userThreads = await Thread.find({ author: userId });

//     // Collect all the child thread ids (replies) from the 'children' field of each user thread
//     const childThreadIds = userThreads.reduce((acc, userThread) => {
//       return acc.concat(userThread.children);
//     }, []);

//     // Find and return the child threads (replies) excluding the ones created by the same user
//     const replies = await Thread.find({
//       _id: { $in: childThreadIds },
//       author: { $ne: userId }, // Exclude threads authored by the same user
//     }).populate({
//       path: "author",
//       model: User,
//       select: "name image _id",
//     });

//     return replies;
//   } catch (error) {
//     console.error("Error fetching replies: ", error);
//     throw error;
//   }
// }
