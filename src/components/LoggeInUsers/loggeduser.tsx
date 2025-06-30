import { NextResponse } from "next/server";

{/*"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useState, useEffect } from "react"

type User = {
  username: string
}

export default function LoggedUser() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading && user) {
    return <span>Hello {user.username}</span>;
  }

  if (user) {
    return <span>Hello {user.username}</span>;
  }

  return <span>User not found</span>
}
  */}

  export default function LoggedUser() {
    return NextResponse.json({ detail: "Feature disabled for deployment" }, { status: 503 })
  }
