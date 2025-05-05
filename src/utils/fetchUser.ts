import { getSessionCookie } from "./getCookie";

export async function fetchDataFromFastAPI(endpoint: string) {
  const sessionCookie = getSessionCookie();
  if (!sessionCookie) {
    return {ok: false, data: {detail: "No session"}};
  }

  try {
    const response = await fetch(
      `${process.env.FAST_URL}${"/user/me"}`,
      {
        headers: {
          Cookie: `session=${sessionCookie}`,
        },
        next: { revalidate: 60 },
      }
    );
    const data = await response.json()
    return {ok: response.ok, data};
  } catch (error) {
    console.error("Error fetching data from backend:", error);
    return {ok: false, data: {detail: "Internal Error"}};
  }
}
