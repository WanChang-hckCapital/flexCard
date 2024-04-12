"use server";

import { revalidatePath } from "next/cache";
import Card from "../models/card";
import Member from "../models/member";
import { connectToDB } from "../mongodb";


export async function fetchCardsByAccountId(accountId: string) {
    try {
        connectToDB();

        const Cards = await Member.find({ user: accountId }).populate('cards').exec();

        return Cards;
    } catch (error:any) {
        throw new Error(`Error getting Cards: ${error.message}`);
    }
}

// export const getFunnels = async (subacountId: string) => {
//     const funnels = await db.funnel.findMany({
//       where: { subAccountId: subacountId },
//       include: { FunnelPages: true },
//     })
  
//     return funnels
//   }
  
export async function fetchCardDetails(cardId: string) {
    try {
        connectToDB();

        const card = await Card.findOne({ _id: cardId });

        return card;
    } catch (error: any) {
        throw new Error(`Error getting card: ${error.message}`);
    }
}

export async function upsertCardContent(authaccountId: string, cardContent: object, cardId: string) {
    if (!authaccountId || !cardId) return;
    
    try {
      const response = await Card.findOneAndUpdate(
        { _id: cardId },
        { $set: { ...cardContent } },
        { upsert: true, new: true }
      );
  
      if (!response) {
        const newCardContent = {
          ...cardContent,
          content: cardContent
            ? cardContent
            : JSON.stringify([
                {
                  content: [],
                  id: '__body',
                  name: 'Body',
                  styles: { backgroundColor: 'white' },
                  type: '__body',
                },
              ]),
          cardId,
        };
  
        const newCard = new Card(newCardContent);
        await newCard.save();
        return newCard;
      }
  
      revalidatePath(`/${authaccountId}/card/${cardId}`, 'page');
  
      return response;
    } catch (error: any) {
      throw new Error(`Error upserting card content: ${error.message}`);
    }
  }
  
//   export const updateFunnelProducts = async (
//     products: string,
//     funnelId: string
//   ) => {
//     const data = await db.funnel.update({
//       where: { id: funnelId },
//       data: { liveProducts: products },
//     })
//     return data
//   }
  
//   export const upsertFunnelPage = async (
//     subaccountId: string,
//     funnelPage: UpsertFunnelPage,
//     funnelId: string
//   ) => {
//     if (!subaccountId || !funnelId) return
//     const response = await db.funnelPage.upsert({
//       where: { id: funnelPage.id || '' },
//       update: { ...funnelPage },
//       create: {
//         ...funnelPage,
//         content: funnelPage.content
//           ? funnelPage.content
//           : JSON.stringify([
//               {
//                 content: [],
//                 id: '__body',
//                 name: 'Body',
//                 styles: { backgroundColor: 'white' },
//                 type: '__body',
//               },
//             ]),
//         funnelId,
//       },
//     })
  
//     revalidatePath(`/subaccount/${subaccountId}/funnels/${funnelId}`, 'page')
//     return response
//   }
  
//   export const deleteFunnelePage = async (funnelPageId: string) => {
//     const response = await db.funnelPage.delete({ where: { id: funnelPageId } })
  
//     return response
//   }
  
//   export const getFunnelPageDetails = async (funnelPageId: string) => {
//     const response = await db.funnelPage.findUnique({
//       where: {
//         id: funnelPageId,
//       },
//     })
  
//     return response
//   }