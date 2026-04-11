"use client";

import { useEffect } from "react";

export default function PageScripts() {
  useEffect(() => {
    // Reveal on scroll
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((x) => {
          if (x.isIntersecting) x.target.classList.add("v");
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

    // Nav scroll class
    const onScroll = () =>
      document
        .getElementById("nav")
        ?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Mobile hamburger menu
    const hamburger = document.getElementById("nav-hamburger");
    const mobileMenu = document.getElementById("nav-mobile-menu");
    const mobileLinks = document.querySelectorAll(".nav-mobile-link");
    const toggleMenu = () => mobileMenu?.classList.toggle("hidden");
    hamburger?.addEventListener("click", toggleMenu);
    mobileLinks.forEach((link) => link.addEventListener("click", toggleMenu));

    // FAQ accordion
    const faqHandler = (e: Event) => {
      const q = e.currentTarget as HTMLElement;
      q.parentElement?.classList.toggle("open");
    };
    const faqQuestions = document.querySelectorAll(".faq-q");
    faqQuestions.forEach((q) => q.addEventListener("click", faqHandler));

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
      hamburger?.removeEventListener("click", toggleMenu);
      mobileLinks.forEach((link) => link.removeEventListener("click", toggleMenu));
      faqQuestions.forEach((q) => q.removeEventListener("click", faqHandler));
    };
  }, []);

  return null;
}
