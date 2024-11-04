import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ status: 'fail', message: 'No video ID provided' });
    }

    try {
        await connectToDB();
        const db = mongoose.connection.getClient().db();
        const bucket = new GridFSBucket(db, { bucketName: 'videos' });

        const fileDetails = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
        if (!fileDetails.length) {
            return NextResponse.json({ status: 'fail', message: 'Video not found' });
        }

        const file = fileDetails[0];
        const contentType = file.contentType;

        if (!contentType || !contentType.startsWith('video/')) {
            return NextResponse.json({ status: 'fail', message: 'Not a video file or content type missing' });
        }

        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));

        const readableStream = new ReadableStream({
            start(controller) {
                downloadStream.on('data', (chunk) => {
                    if (!controller.desiredSize) {
                        downloadStream.pause();
                    }
                    controller.enqueue(chunk);
                });
                downloadStream.on('end', () => controller.close());
                downloadStream.on('error', (err) => controller.error(err));
            },
            pull(controller) {
                if (downloadStream.isPaused()) {
                    downloadStream.resume();
                }
            },
            cancel() {
                downloadStream.destroy();
            }
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${file.filename}"`,
            }
        });

    } catch (error: any) {
        console.error('Error fetching video:', error);
        return NextResponse.json({ status: 'fail', message: error.message });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ status: 'fail', message: 'No video ID provided' });
    }

    try {
        await connectToDB();
        const db = mongoose.connection.getClient().db();
        const bucket = new GridFSBucket(db, { bucketName: 'videos' });

        await bucket.delete(new mongoose.Types.ObjectId(id));
        return NextResponse.json({ status: 'success', message: 'Video deleted successfully' });

    } catch (error: any) {
        console.error('Error deleting video:', error);
        return NextResponse.json({ status: 'fail', message: error.message });
    }
}
