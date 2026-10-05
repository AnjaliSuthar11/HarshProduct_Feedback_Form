import { NextResponse } from "next/server";

export const runtime = "nodejs";

const APPS_SCRIPT_URL =
  process.env.GOOGLE_APPS_SCRIPT_URL;

export async function POST(request) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        {
          success: false,
          message:
            "GOOGLE_APPS_SCRIPT_URL is missing.",
        },
        { status: 500 }
      );
    }

    const incomingData =
      await request.formData();

    const data =
      new URLSearchParams();

    for (
      const [key, value]
      of incomingData.entries()
    ) {
      data.append(
        key,
        String(value)
      );
    }

    const response =
      await fetch(
        APPS_SCRIPT_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: data.toString(),
          redirect: "follow",
          cache: "no-store",
        }
      );

    const text =
      await response.text();

    console.log(
      "Apps Script response:",
      text
    );

    let result;

    try {
      result =
        JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid response from Apps Script.",
          response: text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      result,
      {
        status: response.ok
          ? 200
          : response.status,
      }
    );

  } catch (error) {
    console.error(
      "Feedback API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}