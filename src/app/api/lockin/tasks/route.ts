import { NextResponse } from "next/server";

// Commented out for deployment - logged-in features disabled

export async function GET() {
  return NextResponse.json({ detail: "Feature disabled for deployment" }, { status: 503 });
}

export async function POST(request: Request) {
  return NextResponse.json({ detail: "Feature disabled for deployment" }, { status: 503 });
}

export async function DELETE(request: Request) {
  return NextResponse.json({ detail: "Feature disabled for deployment" }, { status: 503 });
}

/*
Original implementation commented out:

import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";

const FAST_URL = process.env.FAST_URL!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const encryptedSession = cookieStore.get("session")?.value;
    if (!encryptedSession) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    const session = await decrypt(encryptedSession);
    const res = await fetch(`${FAST_URL}/lockin/tasks`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const encryptedSession = cookieStore.get("session")?.value;
    if (!encryptedSession) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    const session = await decrypt(encryptedSession);
    const res = await fetch(`${FAST_URL}/lockin/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const encryptedSession = cookieStore.get("session")?.value;
    if (!encryptedSession) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    const session = await decrypt(encryptedSession);
    const res = await fetch(`${FAST_URL}/lockin/tasks/${body.taskid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: "Internal error" }, { status: 500 });
  }
}
*/
