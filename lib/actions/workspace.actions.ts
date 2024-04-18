"use server";

import { revalidatePath } from "next/cache";
import CardMongodb from "../models/card";
import Member from "../models/member";
import { connectToDB } from "../mongodb";
import { Card } from "@/types";
import { title } from "process";
import { v4 as uuidv4 } from 'uuid';
import ComponentModel from "../models/component";


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

        const card = await CardMongodb.findOne({ _id: cardId });

        return card;
    } catch (error: any) {
        throw new Error(`Error getting card: ${error.message}`);
    }
}

export async function upsertCardContent(authaccountId: string, cardDetails: Card, cardContent: string, cardId: string) {
    // if (!authaccountId || !cardId) return;
    
    try {
      connectToDB();

      if (!cardId) {
        const cardComponent = {
          componentID: generateCustomID(),
          content: cardContent,
        };

        const newCardComponent = new ComponentModel(cardComponent);
        await newCardComponent.save();


        const newCardContent = {
            cardID: generateCustomID(),
            creator: authaccountId,
            title: cardDetails.title,
            status: cardDetails.status,
            description: cardDetails.description,
            components: newCardComponent._id,
                // ? cardContent
                // : JSON.stringify([
                //     {
                //         components: [],
                //         id: '__body',
                //         name: 'Body',
                //         styles: { backgroundColor: 'white' },
                //         type: '__body',
                //     },
                // ]), need to fix this
        };
        const newCard = new CardMongodb(newCardContent);
        await newCard.save();

        const currentMember = await Member.findOne({ user: authaccountId });

        if (currentMember) {
            currentMember.cards.push(newCard);
            await currentMember.save();
        }

        return newCard;
      }
      
      const response = await CardMongodb.findOneAndUpdate(
        { _id: cardId },
        { $set: { ...cardDetails } },
        { upsert: true, new: true }
      );
  
      // if (!response) {
      //   const newCardContent = {
      //     ...cardContent,
      //     content: cardContent
      //       ? cardContent
      //       : JSON.stringify([
      //           {
      //             content: [],
      //             id: '__body',
      //             name: 'Body',
      //             styles: { backgroundColor: 'white' },
      //             type: '__body',
      //           },
      //         ]),
      //     cardId,
      //   };
  
      //   const newCard = new Card(newCardContent);
      //   await newCard.save();
      //   return newCard;
      // }
  
      // revalidatePath(`/${authaccountId}/card/${cardId}`, 'page');
      return response;
    } catch (error: any) {
      throw new Error(`Error upserting card content: ${error.message}`);
    }
  }
  

function generateCustomID() {
  return uuidv4();
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