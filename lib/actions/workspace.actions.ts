"use server";

import CardMongodb from "../models/card";
import Member from "../models/member";
import Image from "../models/image";
import { connectToDB } from "../mongodb";
import { Card } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import ComponentModel from "../models/component";
import ProfileModel from "../models/profile";


export async function fetchCardsByAccountId(accountId: string) {
  try {
    await connectToDB();

    const Cards = await Member.find({ user: accountId }).populate('cards').exec();

    return Cards;
  } catch (error: any) {
    throw new Error(`Error getting Cards: ${error.message}`);
  }
}

//done convert to Profile Model
export async function fetchCardDetails(cardId: string) {
  try {
    await connectToDB();

    const card = await CardMongodb.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    const creator = await ProfileModel.findOne({ _id: card.creator }).select('accountname image followers');
    const creatorImage = await Image.findOne({ _id: creator?.image }).select('binaryCode');
    const creatorData = {
      accountname: creator ? creator.accountname : "Unknown",
      image: creator && creatorImage ? creatorImage.binaryCode : undefined,
      followers: creator.followers.length, 
    };

    const lineComponents = await CardMongodb.findById(cardId).select('lineFormatComponent');

    const likesDetails = await Promise.all(card.likes.map(async (likeId: any) => {
      const likeUserProfile = await ProfileModel.findOne({ _id: likeId }).select('accountname image');
      if (likeUserProfile && likeUserProfile.image) {
        const imageDoc = await Image.findById(likeUserProfile.image).select('binaryCode');
        return {
          accountname: likeUserProfile.accountname,
          binarycode: imageDoc ? imageDoc.binaryCode : undefined
        };
      }
      return {
        accountname: likeUserProfile ? likeUserProfile.accountname : "Unknown",
        binarycode: undefined
      };
    }));

    const flexFormatHTML = await CardMongodb.findById(cardId).select('flexFormatHtml');
    const followers = await Promise.all(card.followers.map((id: any) => ProfileModel.findOne({ _id: id }).select('accountname')));
    const lineFormatComponent = await ComponentModel.findById(lineComponents.lineFormatComponent).select('content');
    const flexFormatHTMLContent = await ComponentModel.findById(flexFormatHTML.flexFormatHtml).select('content');

    return {
      cardID: card._id.toString(),
      title: card.title,
      status: card.status,
      description: card.description,
      creator: creatorData,
      creatorID: card.creator,
      likes: likesDetails,
      followers: followers.map(follower => ({ accountname: follower.accountname })),
      components: card.components,
      lineComponents: {
        content: lineFormatComponent ? lineFormatComponent.content : undefined,
      },
      flexHtml: {
        content: flexFormatHTMLContent ? flexFormatHTMLContent.content : undefined,
      },
      updatedAt: card.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching card details:", error);
    throw error;
  }
}

//done convert to Profile Model
export async function fetchSuggestedCards(currentCardId: string) {
  try {
    await connectToDB();

    const topLikedCards = await CardMongodb.find({ _id: { $ne: currentCardId } })
      .sort({ likes: -1 })
      .limit(5)
      .lean()
      .exec();

    const additionalCards = await CardMongodb.find({ _id: { $ne: currentCardId } })
      .skip(5)
      .lean()
      .exec();

    const suggestedCards = [...topLikedCards, ...additionalCards];

    const processedCards = await Promise.all(suggestedCards.map(async (card: any) => {
      const creator = await ProfileModel.findOne({ _id: card.creator }).select('accountname image');
      const creatorImage = await Image.findOne({ _id: creator?.image }).select('binaryCode');
      const creatorData = {
        accountname: creator ? creator.accountname : "Unknown",
        image: creator && creatorImage ? creatorImage.binaryCode : undefined
      };

      const lineComponents = await CardMongodb.findById(card._id).select('lineFormatComponent');

      const likesDetails = await Promise.all(card.likes.map(async (likeId: any) => {
        const likeUserProfile = await ProfileModel.findOne({ _id: likeId }).select('accountname image');
        if (likeUserProfile && likeUserProfile.image) {
          const imageDoc = await Image.findById(likeUserProfile.image).select('binaryCode');
          return {
            accountname: likeUserProfile.accountname,
            binarycode: imageDoc ? imageDoc.binaryCode : undefined
          };
        }
        return {
          accountname: likeUserProfile ? likeUserProfile.accountname : "Unknown",
          binarycode: undefined
        };
      }));

      const flexFormatHTML = await CardMongodb.findById(card._id).select('flexFormatHtml');

      const followers = await Promise.all(card.followers.map((id: any) => ProfileModel.findOne({ _id: id }).select('accountname')));

      const lineFormatComponent = await ComponentModel.findById(lineComponents.lineFormatComponent).select('content');
      const flexFormatHTMLContent = await ComponentModel.findById(flexFormatHTML.flexFormatHtml).select('content');

      return {
        cardId: card._id.toString(),
        title: card.title,
        description: card.description,
        creator: creatorData,
        creatorID: card.creator,
        likes: likesDetails,
        followers: followers.map(follower => ({ accountname: follower.accountname })),
        lineComponents: {
          content: lineFormatComponent ? lineFormatComponent.content : undefined,
        },
        flexHtml: {
          content: flexFormatHTMLContent ? flexFormatHTMLContent.content : undefined,
        }
      };
    }));

    return processedCards;
  } catch (error) {
    console.error("Error fetching suggested cards:", error);
    throw error;
  }
}

export async function fetchComponent(componentId: string) {
  try {
    await connectToDB();

    const component = await ComponentModel.findOne({ _id: componentId });

    return component;
  } catch (error: any) {
    throw new Error(`Error getting component: ${error.message}`);
  }
}

function generateCustomID() {
  return uuidv4();
}

// done convert to Profile Model but still need to check
async function saveComponent(componentType: string, content: string) {
  const componentData = {
    componentID: generateCustomID(),
    componentType,
    content,
  };
  const newComponent = new ComponentModel(componentData);
  await newComponent.save();
  return newComponent._id;
}

async function updateComponent(componentId: string, content: string) {
  const existingComponent = await ComponentModel.findById(componentId);
  if (!existingComponent) throw new Error("Component not found.");

  existingComponent.content = content;
  await existingComponent.save();
  return existingComponent;
}

export async function upsertCardContent(
  authActiveProfileId: string,
  cardDetails: any,
  cardContent: string,
  lineFormatCard: string,
  flexFormatHtml: string,
  categories: string[] = []
) {
  if (!authActiveProfileId) return;

  try {
    await connectToDB();

    const cleanCardDetails = JSON.parse(
      JSON.stringify({
        cardID: cardDetails.cardID,
        title: cardDetails.title,
        status: cardDetails.status,
        description: cardDetails.description,
        categories,
      })
    );

    const existingCard = cleanCardDetails.cardID
      ? await CardMongodb.findOne({ cardID: cleanCardDetails.cardID })
      : null;
    
      console.log("Card exists:", Boolean(existingCard));

    if (!existingCard) {
      const newCard = new CardMongodb({
        ...cleanCardDetails,
        creator: authActiveProfileId,
        components: await saveComponent("flexCard", cardContent),
        lineFormatComponent: await saveComponent("line", lineFormatCard),
        flexFormatHtml: await saveComponent("html", flexFormatHtml),
      });

      console.log("newCard: ", newCard);
      await newCard.save();

      console.log("saved new card");

      await ProfileModel.updateOne(
        { _id: authActiveProfileId },
        { $push: { cards: newCard._id } }
      );

      console.log("updated profile");

      return {
        message: "success"
      };
    } else {
      await updateComponent(existingCard.components, cardContent);
      await updateComponent(existingCard.lineFormatComponent, lineFormatCard);
      await updateComponent(existingCard.flexFormatHtml, flexFormatHtml);

      const updatedCard = await CardMongodb.updateOne(
        { cardID: existingCard.cardID },
        { $set: cleanCardDetails }
      );

      console.log("updated card");

      return {
        message: "success",
        data: updatedCard
      };
    }
  } catch (error: any) {
    return {
      message: "error",
      error: (`Error upserting card content: ${error.message}`)
    }
  }
}

// done convert to Profile Model but still need to check
export async function checkDuplicateCard(
  authActiveProfileId: string,
  cardId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await connectToDB();

    const authenticatedProfile = await ProfileModel.findOne({ _id: authActiveProfileId });

    if (!authenticatedProfile) {
      return { success: false, message: "You need to login before save the card" };
    }

    const existingCard = await CardMongodb.findOne({ cardID: cardId });

    if (existingCard) {
      return { success: false, message: "Opps, Card already exists, Please try again later."  };
    } else {
      return { success: true };
    }
  }
  catch {
    return { success: false };
  }
}

export async function updateCardTitle(authaccountId: string, cardId: string, newTitle: string) {
  try {
    await connectToDB();

    const existingCard = await CardMongodb.findById(cardId);
    if (!existingCard) {
      throw new Error("Card not found.");
    }

    if (authaccountId !== existingCard.creator) {
      return new Error("Unauthorized to update card title.");
    }

    const updatedCard = await CardMongodb.updateOne(
      { cardID: existingCard.cardID },
      {
        $set: { title: newTitle }
      });

    return updatedCard;
  } catch (error: any) {
    throw new Error(`Error updating title of card: ${error.message}`);
  }
}