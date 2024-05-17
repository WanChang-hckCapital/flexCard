// // This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

import { MongoClient } from "mongodb"
import mongoose, { Mongoose } from 'mongoose'
if (!process.env.MONGODB_URL) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URL"')
}

const uri = process.env.MONGODB_URL
type MongoClientType = MongoClient | mongoose.mongo.MongoClient

let isConnected = false;
let client: MongoClientType

let globalWithMongo = global as typeof globalThis & {
    _mongooseClient?: Mongoose
}

export const clientPromise = async () => {
    await connectToDB()

    return Promise.resolve<MongoClientType>(client)
}

export const connectToDB = async () => {

    if (isConnected) {
        console.log("MongoDB connection already established");
        return;
    }

    if (process.env.NODE_ENV === 'development') {

        try {
            if (!globalWithMongo._mongooseClient) {
                globalWithMongo._mongooseClient = await mongoose.connect(uri)
            }

            client = globalWithMongo._mongooseClient.connection.getClient()
            isConnected = true;
            console.log("MongoDB connected");
        } catch (error) {
            console.log(error);
        }
    } else {
        let _client = await mongoose.connect(uri)
        client = _client.connection.getClient()
        isConnected = true;
    }
}

// import mongoose, { Mongoose } from 'mongoose';

// if (!process.env.MONGODB_URI) {
//     throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
// }

// const uri = process.env.MONGODB_URI;

// let isConnected = false;
// let mongooseClient: Mongoose;

// export const connectToDB = async () => {
//     if (isConnected) {
//         console.log("MongoDB connection already established");
//         return;
//     }

//     try {
//         mongooseClient = await mongoose.connect(uri);
//         isConnected = true;
//         console.log("MongoDB connected");
//     } catch (error) {
//         console.log(error);
//     }
// };

// export const getClient = () => {
//     if (!isConnected) {
//         throw new Error('MongoDB is not connected');
//     }
//     return mongooseClient.connection.getClient();
// };
