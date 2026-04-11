import Link from "next/link";
import LogoMark from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-ibm-g20 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm text-ibm-black">
          <LogoMark size={20} /> SpendTab
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="font-mono-ibm text-[0.68rem] tracking-[0.18em] uppercase text-ibm-blue mb-6">
          404
        </p>
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[-0.02em] text-ibm-black mb-4">
          Page not found.
        </h1>
        <p className="text-base text-ibm-g60 max-w-sm leading-[1.7] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-ibm-blue text-white px-6 py-3.5 text-sm font-semibold hover:bg-ibm-blueh transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
