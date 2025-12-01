import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { question, liked } = await req.json();

    if (!question || typeof liked !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const key = `question:${Buffer.from(question).toString("base64")}`;

    await redis.hincrby(key, liked ? "like" : "dislike", 1);

    await redis.hsetnx(key, "text", question);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
