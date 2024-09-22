import { connectToDB } from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const db = mongoose.connection.getClient().db();

    const filesCollection = db.collection("groupchat.files.files");
    const chunksCollection = db.collection("groupchat.files.chunks");

    const fileId = new ObjectId(params.id);

    const file = await filesCollection.findOne({ _id: fileId });

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const fileChunks = await chunksCollection
      .find({ files_id: fileId })
      .sort({ n: 1 })
      .toArray();

    if (fileChunks.length === 0) {
      return NextResponse.json(
        { message: "No file chunks found" },
        { status: 404 }
      );
    }

    const buffers = fileChunks.map((chunk: any) => chunk.data.buffer);
    const fileBinaryData = Buffer.concat(buffers);

    const base64File = fileBinaryData.toString("base64");
    const mimeType = file.contentType || "image/png";
    const fileDataUrl = `data:${mimeType};base64,${base64File}`;

    return NextResponse.json({
      fileDataUrl,
      fileName: file.filename,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
