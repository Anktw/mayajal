export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
    const opts = { credentials: "include" as RequestCredentials, ...init }
  
    let res = await fetch(input, opts)
  
    if (res.status === 401) {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })
  
      if (refreshRes.ok) {
        res = await fetch(input, opts)
      } else {
        throw new Error("Session expired")
      }
    }
  
    return res
  }
  