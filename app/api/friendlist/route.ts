import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import MemberModel from "@/lib/models/member";
import Card from "@/lib/models/card";
import Image from "@/lib/models/image";
import mongoose from "mongoose";
import { updateCardLikes } from "@/lib/actions/user.actions";

export async function POST(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  const { cardId } = params;
  const url = new URL(req.url);
  const authUserId = url.searchParams.get("authUserId");

  console.log("update trigger with the cardId:", cardId);

  if (!cardId || !authUserId) {
    return NextResponse.json(
      { status: "fail", message: "Missing cardId or authUserId" },
      { status: 400 }
    );
  }

  try {
    const updatedCard = await updateCardLikes({
      authActiveProfileId: authUserId,
      cardId: cardId,
    });
    if (updatedCard.success === false) {
      return NextResponse.json(
        { status: "fail", message: updatedCard.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: "success", data: updatedCard.data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating card likes:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: `Failed to update card likes: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
