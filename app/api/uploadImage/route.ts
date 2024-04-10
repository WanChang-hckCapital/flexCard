import { connectToDB } from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import multer from 'multer';
import { NextResponse } from "next/server";

const upload = multer({ dest: 'uploads/' });

// export async function GET(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const { fileId } = req.query;

//     await connectToDB();

//     const db = mongoose.connection.getClient().db();
//     const bucket = new GridFSBucket(db);

//     const stream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId as string));

//     res.setHeader('Content-Type', 'image/jpeg'); 
//     res.setHeader('Cache-Control', 'public, max-age=31536000');

//     stream.pipe(res);
//   } catch (error: any) {
//     console.error(`Failed to get image from GridFS: ${error.message}`);
//     res.status(500).send('Internal Server Error');
//   }
// }

async function saveToGridFS(file: Express.Multer.File) {
  try {
    await connectToDB();

    console.log("I'm here saveToGridFS");

    const db = mongoose.connection.getClient().db();
    const bucket = new GridFSBucket(db);

    const uploadStream = bucket.openUploadStream(file.originalname);
    const readStream = file.stream;

    readStream.pipe(uploadStream);

    return new Promise<ObjectId>((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve(uploadStream.id as ObjectId);
      });
      uploadStream.on('error', reject);
    });
  } catch (error: any) {
    throw new Error(`Failed to upload image to GridFS: ${error.message}`);
  }
}

export async function POST(
  req: Request,
  { params }: {params: { file: Express.Multer.File}}
) {
    try {
      const file = params.file;
      if (!file) {
        return new NextResponse("Backend: No file uploaded", {status: 400});
      }
      const fileId = await saveToGridFS(file);
      return NextResponse.json({
        message: "image uploaded",
        fileId: fileId
      })
    } catch (error: any) {
      console.log(error)
      return new NextResponse("server error", { status: 500})
    }
}

export const multerMiddleware = upload.single('file');

// export async function POST(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const { filename } = req.body;

//     await connectToDB();

//     const db = mongoose.connection.getClient().db();
//     const bucket = new GridFSBucket(db);

//     const fileId = await uploadImageMetadataToGridFS(bucket, filename);

//     res.status(200).json({ fileId });
//   } catch (error: any) {
//     console.error(`Failed to upload image metadata: ${error.message}`);
//     res.status(500).json({ error: 'Failed to upload image metadata' });
//   }
// }

// async function uploadImageMetadataToGridFS(bucket: GridFSBucket, filename: string): Promise<string> {
//   try {
//     const fileId = 'test';
//     return fileId;
//   } catch (error:any) {
//     throw new Error(`Failed to upload image metadata to GridFS: ${error.message}`);
//   }
// }
