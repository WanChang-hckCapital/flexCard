import { connectToDB } from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fileId } = req.query;

    await connectToDB();

    const db = mongoose.connection.getClient().db();
    const bucket = new GridFSBucket(db);

    const stream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId as string));

    res.setHeader('Content-Type', 'image/jpeg'); 
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    stream.pipe(res);
  } catch (error: any) {
    console.error(`Failed to get image from GridFS: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filename } = req.body;

    await connectToDB();

    const db = mongoose.connection.getClient().db();
    const bucket = new GridFSBucket(db);

    const fileId = await uploadImageMetadataToGridFS(bucket, filename);

    res.status(200).json({ fileId });
  } catch (error: any) {
    console.error(`Failed to upload image metadata: ${error.message}`);
    res.status(500).json({ error: 'Failed to upload image metadata' });
  }
}

async function uploadImageMetadataToGridFS(bucket: GridFSBucket, filename: string): Promise<string> {
  try {
    const fileId = 'test'; 
    return fileId;
  } catch (error:any) {
    throw new Error(`Failed to upload image metadata to GridFS: ${error.message}`);
  }
}
