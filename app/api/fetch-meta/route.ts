import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { JSDOM } from "jsdom";

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
    const { data } = await axios.get(url);
    const dom = new JSDOM(data);
    const document = dom.window.document;

    const metaTags: { [key: string]: string } = {};

    document.querySelectorAll("meta").forEach((element) => {
      const property =
        element.getAttribute("property") || element.getAttribute("name");
      const content = element.getAttribute("content");
      if (property && content) {
        metaTags[property] = content;
      }
    });

    return NextResponse.json({ metaTags });
  } catch (error: any) {
    console.error("Error fetching meta tags:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch meta tags" },
      { status: 500 }
    );
  }
}
