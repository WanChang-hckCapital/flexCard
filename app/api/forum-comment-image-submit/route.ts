import { connectToDB } from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const formData = await req.formData();
    const file = formData.get("imageFile") as File;

    if (!file) {
      return NextResponse.json({
        message: "No file provided",
        status: 400,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const db = mongoose.connection.getClient().db();
    const bucket = new GridFSBucket(db, { bucketName: "forumcomment.files" });

    const readablePhotoStream = new Readable();
    readablePhotoStream.push(buffer);
    readablePhotoStream.push(null);

    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
    });

    const uploadPromise = new Promise((resolve, reject) => {
      uploadStream.on("finish", () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.on("error", (uploadErr) => {
        reject(uploadErr);
      });
    });

    readablePhotoStream.pipe(uploadStream);

    const fileId = await uploadPromise;

    console.log("file update");
    console.log(fileId);

    return NextResponse.json({
      message: "Blog Comment's image uploaded successfully",
      fileId,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message, status: 500 });
  }
}
