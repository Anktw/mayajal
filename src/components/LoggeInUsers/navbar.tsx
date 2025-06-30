{/*"use client"

import { useState, useEffect, useCallback } from "react"
import { SettingsButton } from "../settings-button"
import LoggedUser from "./loggeduser"

const HeaderComp = () => {
    const [prevScrollPos, setPrevScrollPos] = useState(0)
    const [visible, setVisible] = useState(true)
    const [scrolled, setScrolled] = useState(false)
    const [scrollingUp, setScrollingUp] = useState(false)
    const [lastScrollY, setLastScrollY] = useState(0)


    const handleScroll = useCallback(() => {
        const currentScrollPos = window.pageYOffset
        const currentScrollY = window.scrollY

        const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10
        const isScrolled = currentScrollY > 10
        const isScrollingUp = currentScrollY < lastScrollY

        setVisible(isVisible)
        setScrolled(isScrolled)
        setScrollingUp(isScrollingUp)

        setPrevScrollPos(currentScrollPos)
        setLastScrollY(currentScrollY)
    }, [prevScrollPos, lastScrollY])



    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [handleScroll])

    return (
        <header
            className={`fixed top-0 z-30 transition-all duration-300 ease-in-out ${visible ? "translate-y-0" : "-translate-y-full"
                } ${scrollingUp && scrolled ? "w-[90%] mx-auto left-0 right-0 rounded-b-xl shadow-lg" : "w-full shadow-md"}`}
        >
            <div
                className={`backdrop-blur-xl flex justify-between items-center px-6 py-4 md:px-12 ${scrolled ? "p-2 border-2 rounded-b-lg" : "p-4"
                    }`}
            >
                Lock-in
                <SettingsButton />
                <LoggedUser />
            </div>    
        </header>
    )
}
export default HeaderComp
*/}
import { NextResponse } from "next/server";
export default function HeaderComp() {
    return NextResponse.json({ detail: "Feature disabled for deployment" }, { status: 503 });
}