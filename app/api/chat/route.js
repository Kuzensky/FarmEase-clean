import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const SYSTEM_PROMPT = `You are an agricultural assistant specializing in Filipino farming.
Give simple, practical advice tailored to Philippine growing conditions. Ask for the user's
region or season when that information is needed, and avoid presenting uncertain advice as fact.`;

export async function POST(request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Sign in to use the agricultural assistant" },
            { status: 401 }
        );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { success: false, message: "Chat service is not configured" },
            { status: 503 }
        );
    }

    try {
        const { message } = await request.json();

        if (typeof message !== "string" || !message.trim() || message.length > 2000) {
            return NextResponse.json(
                { success: false, message: "Message must be between 1 and 2,000 characters" },
                { status: 400 }
            );
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
                max_tokens: 512,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: message.trim() },
                ],
            }),
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: "Chat provider request failed" },
                { status: 502 }
            );
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
            return NextResponse.json(
                { success: false, message: "Chat provider returned an empty response" },
                { status: 502 }
            );
        }

        return NextResponse.json({ success: true, reply });
    } catch {
        return NextResponse.json(
            { success: false, message: "Unable to process the chat request" },
            { status: 500 }
        );
    }
}
