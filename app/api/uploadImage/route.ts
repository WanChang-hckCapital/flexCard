
import { connectToDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

// export async function POST(req: NextApiRequestWithFile, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         return new NextResponse("Method Not Allowed", { status: 405 });
//     }

//     try {
//         await connectToDB();
//         const bucket = getBucket();
//         if (!bucket) {
//             return new NextResponse("GridFS bucket not initialise", { status: 500 });
//         }

//         await runUploadMiddleware(req, res);

//         const file = req.file;
//         if (!file) {
//             return new NextResponse("No file uploaded", { status: 400 });
//         }

//         const uploadStream = bucket.openUploadStream(file.originalname, {
//             contentType: file.mimetype,
//         });

//         const fileBuffer = Buffer.from(file.buffer);
//         const readablePhotoStream = new Readable();
//         readablePhotoStream.push(fileBuffer);
//         readablePhotoStream.push(null);
//         readablePhotoStream.pipe(uploadStream);

//         uploadStream.on('finish', () => {
//             return NextResponse.json({ message: 'File uploaded successfully', fileId: uploadStream.id });
//         });

//         uploadStream.on('error', (uploadErr) => {
//             uploadStream.destroy();
//             return new NextResponse("File upload error, " + uploadErr, { status: 500 });
//         });
//     } catch (error: any) {
//         return new NextResponse("GridFS bucket error, " + error.message, { status: 500 });
//     }
// }

export const config = {
    api: {
        bodyParser: false,
    },
};

// export async function POST(req: Request, res: NextApiResponse) {
//     try {
//         await connectToDB();

//         // await runMiddleware(req, res, uploadMiddleware);

//         const formData = await req.formData();

//         const file = formData.get("file") as File;
//         const arrayBuffer = await file.arrayBuffer();
//         const buffer = new Uint8Array(arrayBuffer);


//         console.log('formData api:', formData);

//         // const file = formData.file as File;
//         if (!file) {
//             return NextResponse.json({ message: 'No file uploaded', status: 400 });
//         }

//         const gfs = getGFS();
//         const writestream = gfs.createWriteStream({
//             filename: file.name,
//             content_type: file.type,
//         });

//         const fileBuffer = Buffer.from(await file.arrayBuffer());
//         const readablePhotoStream = new Readable();
//         readablePhotoStream.push(buffer);
//         readablePhotoStream.push(null);
//         readablePhotoStream.pipe(writestream);

//         writestream.on('finish', () => {
//             return NextResponse.json({ message: 'File uploaded successfully', fileId: writestream.id });
//         });

//         writestream.on('error', (uploadErr) => {
//             writestream.end();
//             return NextResponse.json({ message: 'File upload error: ' + uploadErr, status: 500 });
//         });
//     } catch (err: any) {
//         NextResponse.json({ message: err.message, status: 500 });
//     }

//     // try {

//     //     // uploadMiddleware(req, res, function (err) {
//     //     //     if (err instanceof multer.MulterError) {
//     //     //         return NextResponse.json({ message: err.message, status: 500 });
//     //     //     } else if (err) {
//     //     //         return NextResponse.json({ message: err.message, status: 500 });
//     //     //     }
//     //     //     // File uploaded successfully
//     //     //     return NextResponse.json({ message: "File uploaded successfully", status: 200 });
//     //     // });
//     // } catch (err: any) {
//     //     return NextResponse.json({ message: err.message, status: 500 });
//     // }
// }

export async function POST(req: Request) {
    try {
        await connectToDB();

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded', status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const db = mongoose.connection.getClient().db();
        const bucket = new GridFSBucket(db, { bucketName: 'media' });

        const readablePhotoStream = new Readable();
        readablePhotoStream.push(buffer);
        readablePhotoStream.push(null);

        const uploadStream = bucket.openUploadStream(file.name, {
            contentType: file.type,
        });

        const uploadPromise = new Promise((resolve, reject) => {
            uploadStream.on('finish', () => {
                resolve(uploadStream.id.toString());
            });

            uploadStream.on('error', (uploadErr) => {
                reject(uploadErr);
            });
        });

        readablePhotoStream.pipe(uploadStream);

        const fileId = await uploadPromise;

        revalidatePath("/workspace/create-card");
        return NextResponse.json({ message: 'File uploaded successfully', fileId });
    } catch (err: any) {
        return NextResponse.json({ message: err.message, status: 500 });
    }
}

export async function GET() {
    try {
        await connectToDB();

        const db = mongoose.connection.getClient().db();
        const bucket = new GridFSBucket(db, { bucketName: 'media' });

        const files = await bucket.find({ contentType: { $regex: '^image/' } }).toArray();

        return NextResponse.json({ status: 'success', files });
    } catch (err: any) {
        return NextResponse.json({ status: 'fail', message: err.message });
    }
}