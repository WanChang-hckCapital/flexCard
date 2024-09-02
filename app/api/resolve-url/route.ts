import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "URL is required and should be a string" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, { redirect: "follow" });
    const resolvedUrl = response.url;

    return NextResponse.json({ resolvedUrl });
  } catch (error) {
    console.error("Error fetching the URL:", error);
    return NextResponse.json(
      { error: "Failed to resolve URL" },
      { status: 500 }
    );
  }
}
