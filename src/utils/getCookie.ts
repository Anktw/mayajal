// Commented out for deployment - logged-in features disabled

export function getSessionCookie() {
    return null;
}

/*
Original implementation:
import Cookies from "js-cookie";

export function getSessionCookie() {
    return Cookies.get("session");
}
*/
