import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import MemberModel from '@/lib/models/member';
import Card from '@/lib/models/card';
import Image from '@/lib/models/image';
import mongoose from 'mongoose';
import { updateCardLikes } from '@/lib/actions/user.actions';

export async function POST(req: Request, { params }: { params: { cardId: string } }) {
    const { cardId } = params;
    const url = new URL(req.url);
    const authUserId = url.searchParams.get('authUserId');

    console.log('update trigger with the cardId:', cardId);

    if (!cardId || !authUserId) {
        return NextResponse.json({ status: 'fail', message: 'Missing cardId or authUserId' }, { status: 400 });
    }

    try {
        // await connectToDB();

        // const now = new Date();
        // const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

        // const card = await Card.findOne({ cardID: cardId });

        // if (!card) {
        //   return NextResponse.json({ status: 'fail', message: 'Card not found' }, { status: 404 });
        // }

        // const userUpdateTimestamps = card.updateHistory?.filter((update: any) => update.userId.toString() === authUserId) || [];
        // const recentUpdatesCount = userUpdateTimestamps.filter((update: any) => update.timestamp > threeMinutesAgo).length;

        // if (recentUpdatesCount >= 5) {
        //   const nextAvailableTime = new Date(userUpdateTimestamps[0].timestamp.getTime() + 3 * 60 * 1000).toLocaleTimeString();
        //   return NextResponse.json({ status: 'fail', message: `You have reached the like limits. Please try again at ${nextAvailableTime}.` }, { status: 429 });
        // }

        // const update = card.likes.includes(authUserId)
        //   ? { $pull: { likes: authUserId }, $push: { updateHistory: { userId: authUserId, timestamp: now } } }
        //   : { $addToSet: { likes: authUserId }, $push: { updateHistory: { userId: authUserId, timestamp: now } } };

        // const updatedCard = await Card.findByIdAndUpdate(cardId, update, { new: true });

        // if (!updatedCard) {
        //   return NextResponse.json({ status: 'fail', message: 'Update failed' }, { status: 500 });
        // }

        // const likesDetails = await Promise.all(updatedCard.likes.map(async (likeId: any) => {
        //   const likeUser = await MemberModel.findOne({ user: likeId }).select('accountname image');
        //   const imageDoc = likeUser && likeUser.image ? await Image.findById(likeUser.image).select('binaryCode') : null;
        //   return {
        //     accountname: likeUser ? likeUser.accountname : 'Unknown',
        //     binarycode: imageDoc ? imageDoc.binaryCode : undefined,
        //   };
        // }));

        const updatedCard = await updateCardLikes({ authUserId: authUserId, cardId: cardId });
        if (updatedCard.success === false) {
            return NextResponse.json({ status: 'fail', message: updatedCard.message }, { status: 500 });
        }

        return NextResponse.json({ status: 'success', data: updatedCard.data }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating card likes:', error);
        return NextResponse.json({ status: 'fail', message: `Failed to update card likes: ${error.message}` }, { status: 500 });
    }
}
