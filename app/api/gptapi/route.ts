import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { base64Image } = await req.json();

    // text extraction and text recognition
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
                You are given an image in base64 format. Please retrieve all text within the image and label the following categories:
                  phone number
                  - address
                  - email address
                  - company name
                  - company website
                  - name of the person on this business card
                  - job title
                  
                  1. Determine Layout: Identify whether the business card layout is "horizontal" or "vertical":

                    A "horizontal" layout means the elements are primarily distributed left to right across the card.
                    A "vertical" layout means the elements are primarily stacked from top to bottom.
                  
                  2. Extract Text with Tighter Bounding Boxes:

                    For each text label, detect only the specific text associated with each category.
                    Ensure that the bounding box tightly fits around the detected text, only covering the specific label without including any empty space or additional text.
                    Do not include the entire row or any nearby text. The bounding box should be limited to the exact width and height of the relevant text.
                    For each bounding box, the x-coordinates should not extend beyond the detected text’s length.

                    Use the following format for each label:

                    "vertices": [
                        { "x": x1, "y": y1 },
                        { "x": x2, "y": y2 },
                        { "x": x3, "y": y3 },
                        { "x": x4, "y": y4 }
                    ]

                  3. Specify Quadrant Location: After identifying each label's bounding box, generate a summary with each detected label organized by quadrant:

                    "Top-left" refers to the upper left of the entire card.
                    "Top-right" refers to the upper right of the entire card.
                    "Bottom-left" refers to the lower left of the entire card.
                    "Bottom-right" refers to the lower right of the entire card.
                    Use the following format:

                    Summary by Quadrants: After identifying each label's exact corner location, generate an additional summary with each detected label organized by quadrant. Use the following format:

                    {
                      "top-left": ["address"],
                      "top-right": ["phone number", "name"],
                      "bottom-left": ["company name"],
                      "bottom-right": ["email address", "job title"]
                    }
                    where each quadrant contains an array of labels detected within that region. Only include quadrants that have detected labels.

                  Final Output Format
                  Return the result in the following JSON format:
                  {
                    "layout": "detected layout (horizontal OR vertical)",
                    "labels": {
                      "company_name": { "text": "detected company name", "vertices": [ ... ] },
                      "address": { "text": "detected address", "vertices": [ ... ] },
                      "phone_number": { "text": "detected phone number", "vertices": [ ... ] },
                      "email_address": { "text": "detected email address", "vertices": [ ... ] },
                      "company_website": { "text": "detected company website", "vertices": [ ... ] },
                      "name": { "text": "detected name", "vertices": [ ... ] },
                      "job_title": { "text": "detected job title", "vertices": [ ... ] }
                    },
                    "quadrants": {
                      "top-left": ["company_website", "name", "job_title"],
                      "top-right": ["company_name"],
                      "bottom-left": ["address"],
                      "bottom-right": ["phone_number", "email_address"]
                  }
                }
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });
    return NextResponse.json(response.choices[0]);
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
