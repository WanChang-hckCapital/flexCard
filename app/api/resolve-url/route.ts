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
    const response = await fetch(url, { redirect: "follow" });
    const resolvedUrl = response.url;

    const { data } = await axios.get(resolvedUrl);
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

    const image = metaTags["og:image"] || null;
    const siteName = metaTags["og:site_name"] || null;
    const description =
      metaTags["og:description"] || metaTags["description"] || null;

    const result = {
      resolvedUrl,
      image,
      siteName,
      description,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching the URL:", error);
    return NextResponse.json(
      { error: "Failed to resolve URL or fetch meta tags" },
      { status: 500 }
    );
  }
}
