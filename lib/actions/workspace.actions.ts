"use server";

import { revalidatePath } from "next/cache";
import CardMongodb from "../models/card";
import Member from "../models/member";
import { connectToDB } from "../mongodb";
import { Card } from "@/types";
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

export async function fetchComponent(componentId: string) {
  try {
      connectToDB();

      const component = await ComponentModel.findOne({ _id: componentId });

      return component;
  } catch (error: any) {
      throw new Error(`Error getting component: ${error.message}`);
  }
}

function generateCustomID() {
  return uuidv4();
}

export async function upsertCardContent(authaccountId: string, cardDetails: Card, cardContent: string, lineFormatCard: string, flexFormatHtml: string, cardId: string) {
    if (!authaccountId) return;
    
    try {
      connectToDB();

      if (cardId === "") {
        const cardComponent = {
          componentID: generateCustomID(),
          componentType: "flexCard",
          content: cardContent,
        };

        const newCardComponent = new ComponentModel(cardComponent);
        await newCardComponent.save();

        const lineFormatCardComponent = {
          componentID: generateCustomID(),
          componentType: "line",
          content: lineFormatCard,
        };

        const newLineFormatCard = new ComponentModel(lineFormatCardComponent);
        await newLineFormatCard.save();

        const newFlexHtml = {
          componentID: generateCustomID(),
          componentType: "html",
          content: flexFormatHtml,
        };

        const newFlexHtmlComponent = new ComponentModel(newFlexHtml);
        await newFlexHtmlComponent.save();

        const newCardContent = {
          cardID: generateCustomID(),
          creator: authaccountId,
          title: cardDetails.title,
          status: cardDetails.status,
          description: cardDetails.description,
          components: newCardComponent._id,
          lineFormatComponent: newLineFormatCard._id,
          flexFormatHtml: newFlexHtmlComponent._id,
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
      else 
      {
        const existingCard = await CardMongodb.findOne({ cardID: cardId });
        if (!existingCard) {
            throw new Error("Card not found.");
        }

        const title = cardDetails.title;
        const description = cardDetails.description;

        const componentID = existingCard.components;
        const lineFormatComponentID = existingCard.lineFormatComponent;
        const flexFormatHtmlID = existingCard.flexFormatHtml;

        const existingComponent = await ComponentModel.findOne({ _id: componentID });
        if (!existingComponent) {
            throw new Error("Component not found.");
        }

        existingComponent.content = cardContent;
        await existingComponent.save();

        const existingLineFormatComponent = await ComponentModel.findOne({ _id: lineFormatComponentID });
        if (!existingLineFormatComponent) {
            throw new Error("Line format component not found.");
        }

        existingLineFormatComponent.content = lineFormatCard;
        await existingLineFormatComponent.save();

        const existingFlexFormatHTML = await ComponentModel.findOne({ _id: flexFormatHtmlID });
        if (!existingFlexFormatHTML) {
            throw new Error("Flex format Html not found.");
        }

        existingFlexFormatHTML.content = flexFormatHtml;
        await existingFlexFormatHTML.save();

        const response = await CardMongodb.updateOne(
          { cardID: cardId }, 
          { $set: { title: title, description: description } 
        });

        return response;
    }
  
      // revalidatePath(`/${authaccountId}/card/${cardId}`, 'page');
      
    } catch (error: any) {
      throw new Error(`Error upserting card content: ${error.message}`);
    }
}

export async function updateCardTitle(authaccountId: string, cardId: string, newTitle: string) {
  try {
    connectToDB();

    const existingCard = await CardMongodb.findOne({ cardID: cardId });
    if (!existingCard) {
        throw new Error("Card not found.");
    }

    if(authaccountId !== existingCard.creator) {
      return new Error("Unauthorized to update card title.");
    }

    const updatedCard = await CardMongodb.updateOne(
      { cardID: cardId }, 
      { $set: { title: newTitle} 
    });

    return updatedCard;
  } catch (error: any) {
      throw new Error(`Error updating title of card: ${error.message}`);
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