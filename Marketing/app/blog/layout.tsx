import type { Metadata } from "next";
import "../globals.css";
import "./blog.css";
import LogoMark from "@/components/Logo";

export const metadata: Metadata = {
  metadataBase: new URL("https://spendtab.com"),
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ── Nav ── */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-ibm-g20 h-14 flex items-center justify-center">
        <div className="w-full max-w-[1120px] px-6 flex items-center justify-between">
          <div className="flex items-center">
            <a
              href="https://spendtab.com"
              className="flex items-center gap-2 font-semibold text-[1rem] tracking-tight text-ibm-black mr-8"
            >
              <LogoMark size={22} /> SpendTab
            </a>
            <div className="hidden md:flex items-center">
              {[
                ["https://spendtab.com#features", "Features"],
                ["https://spendtab.com#pricing", "Pricing"],
                ["/blog", "Blog"],
                ["https://app.spendtab.com/login", "Login"],
              ].map(([href, label]) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-ibm-g70 px-4 py-2 hover:text-ibm-black transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          <a
            href="https://app.spendtab.com/signup"
            className="bg-ibm-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-ibm-blueh transition-colors"
          >
            Get started
          </a>
        </div>
      </nav>

      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-ibm-g20 py-8 px-6 bg-white">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <a
            href="https://spendtab.com"
            className="flex items-center gap-2 font-semibold text-sm text-ibm-black"
          >
            <LogoMark size={18} /> SpendTab
          </a>
          <p className="text-[0.8rem] text-ibm-g50">
            © {new Date().getFullYear()} SpendTab — Accounting software for Nigerian SMEs.
          </p>
          <div className="flex items-center gap-4 text-[0.8rem] text-ibm-g60">
            <a href="https://spendtab.com" className="hover:text-ibm-black transition-colors">Home</a>
            <span className="text-ibm-g30">·</span>
            <a href="https://spendtab.com#pricing" className="hover:text-ibm-black transition-colors">Pricing</a>
            <span className="text-ibm-g30">·</span>
            <a href="https://app.spendtab.com/signup" className="hover:text-ibm-black transition-colors">Get started</a>
          </div>
        </div>
      </footer>
    </>
  );
}
