import Cookies from "js-cookie";

export function getSessionCookie() {
    return Cookies.get("session");
}
