import { connectToDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

interface Params {
  params: {
    imageId: string;
  };
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await connectToDB();

    const { imageId } = params;

    console.log("imageId");
    console.log(imageId);

    if (!imageId) {
      return NextResponse.json({
        message: "No image ID provided",
        status: 400,
      });
    }

    const db = mongoose.connection.getClient().db();
    const bucket = new GridFSBucket(db, {
      bucketName: "blogcomment.files",
    });

    // Convert imageId to ObjectId
    const objectId = new mongoose.Types.ObjectId(imageId);

    await bucket.find(objectId);

    // // Delete image from GridFS
    await bucket.delete(objectId);

    return NextResponse.json({
      message: "Image deleted successfully",
      status: 200,
    });
  } catch (err: any) {
    console.error("Error deleting image:", err);
    return NextResponse.json({
      message: `Error deleting image: ${err.message}`,
      status: 500,
    });
  }
}
