import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";
import { NextResponse } from "next/server";

const FAST_URL = process.env.FAST_URL!;

export async function PUT(request: Request, { params }: { params: { taskid: string } }) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const encryptedSession = cookieStore.get("session")?.value;
    if (!encryptedSession) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    const session = await decrypt(encryptedSession);
    const res = await fetch(`${FAST_URL}/lockin/tasks/${params.taskid}`, {
      method: "PUT",
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
