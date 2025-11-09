import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        const formData = await req.formData();
        const avatar = formData.get("avatar") as File | Blob;
        if (!avatar) {
            return NextResponse.json({ error: "Avatar not found" }, { status: 400 });
        }

        const avatarBuffer = await avatar.arrayBuffer();
        const avatarBase64 = Buffer.from(avatarBuffer).toString("base64");
        const avatarUrl = `data:image/png;base64,${avatarBase64}`;
        return NextResponse.json({ success: true, avatarUrl });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}