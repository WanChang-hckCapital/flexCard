import { connectToDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        await connectToDB();

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file || !file.type.startsWith("video/")) {
            return NextResponse.json({ message: "No video file uploaded or invalid format", status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const db = mongoose.connection.getClient().db();
        const bucket = new GridFSBucket(db, { bucketName: "videos" });

        const readableVideoStream = new Readable();
        readableVideoStream.push(buffer);
        readableVideoStream.push(null);

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

        readableVideoStream.pipe(uploadStream);

        const fileId = await uploadPromise;

        revalidatePath("/workspace/create-card");
        return NextResponse.json({ message: "Video uploaded successfully", fileId });
    } catch (err: any) {
        return NextResponse.json({ message: err.message, status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectToDB();

        const url = new URL(req.url);
        const fileId = url.searchParams.get("fileId");

        if (!fileId) {
            return NextResponse.json({ message: "No fileId provided", status: 400 });
        }

        const db = mongoose.connection.getClient().db();
        const bucket = new GridFSBucket(db, { bucketName: "videos" });

        const downloadStream = bucket.openDownloadStreamByName(fileId);

        const stream = new ReadableStream({
            start(controller) {
                downloadStream.on("data", (chunk) => controller.enqueue(chunk));
                downloadStream.on("end", () => controller.close());
                downloadStream.on("error", (err) => controller.error(err));
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `inline; filename="${fileId}"`,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ message: err.message, status: 500 });
    }
}
