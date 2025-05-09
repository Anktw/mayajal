"use client"

import { useState, useEffect, useCallback } from "react"
import { SettingsButton } from "../settings-button"


const HeaderCompGuest = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [scrollingUp, setScrollingUp] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [signupHref, setSignupHref] = useState("https://accounts.unkit.site/auth/user/signup")
  const [loginHref, setLoginHref] = useState("https://accounts.unkit.site/auth/user/login")


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
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const closeMenuOnScroll = useCallback(() => {
    if (window.innerWidth < 768 && isOpen) {
      const currentScrollPos = window.pageYOffset;
      if (currentScrollPos > 10) {
        setIsOpen(false);
      }
    }
  }, [isOpen]);

  const closeMenuOnResize = useCallback(() => {
    if (window.innerWidth >= 768 && isOpen) {
      setIsOpen(false)
    }
  }, [isOpen])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  useEffect(() => {
    window.addEventListener("scroll", closeMenuOnScroll)
    window.addEventListener("resize", closeMenuOnResize)

    return () => {
      window.removeEventListener("scroll", closeMenuOnScroll)
      window.removeEventListener("resize", closeMenuOnResize)
    }
  }, [closeMenuOnScroll, closeMenuOnResize])


  useEffect(() => {
    const currentUrl = window.location.href
    const encodedRedirect = encodeURIComponent(currentUrl)
    setSignupHref(`https://accounts.unkit.site/auth/user/signup?redirect=${encodedRedirect}`)
    setLoginHref(`https://accounts.unkit.site/auth/user/login?redirect=${encodedRedirect}`)
  }, [])

  return (
    <header
      className={`fixed top-0 z-30 transition-all duration-300 ease-in-out ${visible ? "translate-y-0" : "-translate-y-full"
        } ${scrollingUp && scrolled ? "w-[90%] mx-auto left-0 right-0 rounded-b-xl shadow-lg" : "w-full shadow-md"}`}
    >
      <div
        className={`backdrop-blur-xl flex justify-between items-center px-6 py-4 md:px-12 ${scrolled ? "p-2 border-2 rounded-b-lg" : "p-4"
          }`}
      ><div className="font-bold text-xl md:text-2xl">Lock-in</div>
        {/* Logo */}
        {/* Desktop Navigation */}
        <SettingsButton />
        <div className="hidden md:flex items-center gap-4">
          <p>Please Login to save on cloud</p>
          <a href={loginHref} className="bg-foreground text-background font-medium px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-gray-400 transition">
            Login
          </a>
          <a
            href={signupHref}
            className="bg-yellow-400 text-black font-medium px-4 py-2 rounded-full hover:bg-yellow-300 transition"
          >
            Sign Up
          </a>
        </div>
        {/* Burger Menu Button */}
        <button
          className="relative w-8 h-8 md:hidden z-50 animate-fadeInRight justify-center align-middle cursor-pointer"
          onClick={(e) => {
            e.preventDefault()
            toggleMenu()
          }}
          aria-label="Menu"
        >
          <span
            className={`absolute h-0.5 w-6 bg-foreground transform transition-all duration-300 ease-in-out ${isOpen ? "rotate-45" : "-translate-y-2"
              }`}
          ></span>
          <span
            className={`absolute h-0.5 w-6 bg-foreground transform transition-all duration-300 ease-in-out ${isOpen ? "opacity-0" : "opacity-100"
              }`}
          ></span>
          <span
            className={`absolute h-0.5 w-6 bg-foreground transform transition-all duration-300 ease-in-out ${isOpen ? "-rotate-45" : "translate-y-2"
              }`}
          ></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div
          className="fixed top right-0 h-screen w-1/2 md:w-64 backdrop-blur-3xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0"
        >
          {/* Menu Links */}
          <nav className="flex flex-col items-center mt-20 px-8 space-y-4">
            <div className="flex flex-col md:hidden items-center gap-4">
              <p>Please Login to save on cloud</p>
              <a href="https://accounts-unkit.vercel.app/auth/user/login" className="bg-foreground text-background font-medium px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-gray-400 transition">
                Login
              </a>
              <a
                href="https://accounts-unkit.vercel.app/auth/user/signup"
                className="bg-yellow-400 text-black font-medium px-4 py-2 rounded-full hover:bg-yellow-300 transition"
              >
                Sign Up
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
export default HeaderCompGuest