import LogoMark from "@/components/Logo";

/* ── Shared primitives ───────────────────────────── */

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono-ibm text-[0.68rem] tracking-[0.18em] uppercase font-medium text-ibm-blue flex items-center gap-2.5 mb-4 ${className}`}>
      <span className="inline-block w-0.5 h-3.5 bg-ibm-blue shrink-0" />
      {children}
    </p>
  );
}

function PrimaryBtn({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={`inline-block px-6 py-3.5 bg-ibm-blue text-white text-sm font-semibold leading-none hover:bg-ibm-blueh transition-colors ${className}`}>
      {children}
    </a>
  );
}

function SecondaryBtn({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={`inline-block px-6 py-3.5 border border-ibm-g30 text-ibm-black text-sm font-semibold leading-none hover:bg-ibm-g10 hover:border-ibm-black transition-colors ${className}`}>
      {children}
    </a>
  );
}

/* ── Bento Card Tag ── */
function BcTag({ children, variant = "light" }: { children: React.ReactNode; variant?: "light" | "dark" | "blue" }) {
  const styles = {
    light: "bg-ibm-g10 text-ibm-g70 border border-ibm-g20",
    dark:  "bg-white/[0.06] text-white/40",
    blue:  "bg-white/15 text-white/80",
  };
  return (
    <span className={`font-mono-ibm text-[0.62rem] tracking-[0.14em] uppercase px-2 py-1 inline-block mb-4 ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <>
      {/* ══════════════════════════════════════
          NAVIGATION
          ══════════════════════════════════════ */}
      <nav id="nav" className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-ibm-g20">
        <div className="h-14 flex items-center justify-center">
          <div className="w-full max-w-[1120px] px-6 flex items-center justify-between">
            <div className="flex items-center gap-0">
              <a href="https://spendtab.com" className="flex items-center gap-2 font-semibold text-[1rem] tracking-tight text-ibm-black mr-8">
                <LogoMark size={22} /> SpendTab
              </a>
              <div className="hidden md:flex items-center">
                {["#features", "#how", "#pricing", "#faq", "/blog"].map((href, i) => (
                  <a key={i} href={href} className="text-sm text-ibm-g70 px-4 py-2 hover:text-ibm-black transition-colors">
                    {["Features", "How it works", "Pricing", "FAQ", "Blog"][i]}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://app.spendtab.com/login" className="text-sm text-ibm-black px-4 py-2 hover:bg-ibm-g10 transition-colors hidden sm:block">
                Sign in
              </a>
              <a href="https://app.spendtab.com/signup" className="bg-ibm-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-ibm-blueh transition-colors hidden sm:block">
                Get started
              </a>
              <button id="nav-hamburger" aria-label="Open menu" className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5">
                <span className="block w-5 h-px bg-ibm-black transition-all" />
                <span className="block w-5 h-px bg-ibm-black transition-all" />
                <span className="block w-5 h-px bg-ibm-black transition-all" />
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <div id="nav-mobile-menu" className="hidden border-t border-ibm-g20 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            {(["#features", "#how", "#pricing", "#faq", "/blog"] as const).map((href, i) => (
              <a key={i} href={href} className="nav-mobile-link text-[0.9375rem] text-ibm-g70 py-2.5 border-b border-ibm-g20 hover:text-ibm-black transition-colors">
                {["Features", "How it works", "Pricing", "FAQ", "Blog"][i]}
              </a>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <a href="https://app.spendtab.com/login" className="flex-1 text-center text-sm text-ibm-black py-2.5 border border-ibm-g20 hover:bg-ibm-g10 transition-colors">
              Sign in
            </a>
            <a href="https://app.spendtab.com/signup" className="flex-1 text-center bg-ibm-blue text-white py-2.5 text-sm font-semibold hover:bg-ibm-blueh transition-colors">
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-end pt-[80px] md:pt-[120px] pb-0 px-6 border-b border-ibm-g20">
        <div className="max-w-[1120px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start lg:items-end">
            {/* Left: headline */}
            <div>
              <span className="font-mono-ibm text-[0.68rem] tracking-[0.18em] uppercase font-medium text-ibm-blue flex items-center gap-2.5 mb-6">
                <span className="w-0.5 h-3.5 bg-ibm-blue" />
                Financial Management for Nigerian SMEs
              </span>
              <h1 className="text-[clamp(3rem,6.5vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.022em] text-ibm-black">
                Track every naira.<br />
                Grow every<br />
                <span className="text-ibm-blue">business.</span>
              </h1>
            </div>

            {/* Right: copy + CTAs */}
            <div className="pb-2">
              <p className="text-[1.0625rem] text-ibm-g70 leading-[1.7] max-w-[440px]">
                The simplest way for Nigerian business owners to manage expenses, track income, create budgets, and generate tax-ready financial reports — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <PrimaryBtn href="https://app.spendtab.com/signup">Get started free</PrimaryBtn>
                <SecondaryBtn href="#features">Explore features</SecondaryBtn>
              </div>
              <p className="text-xs text-ibm-g50 mt-3.5">
                From <strong className="text-ibm-g60">₦3,500/month</strong> · Cancel anytime
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 border-t border-ibm-g20 mt-10 md:mt-14 w-full">
            {[
              { v: "₦3,500", l: "Per month, flat" },
              { v: "1-Click", l: "Tax report exports" },
              { v: "∞", l: "Accounts & transactions" },
            ].map((s, i) => (
              <div key={i} className={`py-4 md:py-6 ${i > 0 ? "pl-4 md:pl-8 border-l border-ibm-g20" : ""}`}>
                <div className="text-[1.5rem] md:text-[2.25rem] font-semibold tracking-[-0.03em] text-ibm-black">{s.v}</div>
                <div className="text-[0.7rem] md:text-[0.8rem] text-ibm-g60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard image */}
        <div className="max-w-[1120px] mx-auto w-full mt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/spendtab-dashboard.webp"
            alt="SpendTab dashboard showing expense tracking, income reports, and budget management"
            className="w-full block"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST BAR
          ══════════════════════════════════════ */}
      <div className="bg-ibm-g10 border-b border-ibm-g20 py-4 px-6">
        <div className="flex items-center justify-center gap-5 md:gap-10 flex-wrap max-w-[1120px] mx-auto">
          {[
            ["🔒", "Bank-level security"],
            ["⚡", "Real-time tracking"],
            ["📊", "One-click reports"],
            ["🇳🇬", "Built for Nigeria"],
            ["₦", "Naira-first pricing"],
          ].map(([icon, label], i) => (
            <span key={i} className="flex items-center gap-2 text-[0.78rem] font-medium text-ibm-g60">
              <em className="not-italic">{icon}</em> {label}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          PROBLEM
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow>The Problem</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] reveal">
            You didn&apos;t start a business<br />to struggle with spreadsheets.
          </h2>
          <p className="text-base text-ibm-g60 leading-[1.7] max-w-[520px] mt-3.5 reveal">
            Most Nigerian SMEs still track finances in Excel, notebooks, or not at all. That leads to real problems.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start mt-10 md:mt-14">
            {/* Problems list */}
            <div className="flex flex-col">
              {[
                ["😩", "No clear picture of cash flow", "You don't know exactly how much money is coming in or going out until it's too late."],
                ["📒", "Messy spreadsheets everywhere", "Multiple Excel files, handwritten notes, bank statement screenshots. Nothing connects."],
                ["😰", "Tax season panic every year", "You spend days gathering numbers that should take minutes."],
                ["🤷", "Business and personal finances mixed", "You can't tell which business is actually profitable."],
                ["💸", "Missed savings and overspending", "Without clear categories, you can't see where to cut costs to improve margins."],
              ].map(([icon, title, desc], i) => (
                <div key={i} className={`reveal flex gap-4 items-start py-5 border-b border-ibm-g20 ${i === 0 ? "border-t" : ""}`}>
                  <div className="w-8 h-8 min-w-[2rem] bg-ibm-g10 border border-ibm-g20 flex items-center justify-center text-sm">{icon}</div>
                  <div>
                    <h4 className="text-[0.9rem] font-semibold mb-1">{title}</h4>
                    <p className="text-[0.84rem] text-ibm-g60 leading-[1.6]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Solution box */}
            <div className="reveal bg-ibm-g10 border border-ibm-g20 p-7 md:p-12 md:sticky md:top-20">
              <h3 className="text-2xl font-semibold tracking-[-0.02em] mb-3.5">SpendTab fixes all of this.</h3>
              <p className="text-[0.9375rem] text-ibm-g70 leading-[1.7]">
                One dashboard. Every business. Every transaction. Every report. Clear, organized, and ready in seconds. No accounting jargon, no complex setup, no steep learning curve.
              </p>
              <div className="mt-7">
                <PrimaryBtn href="https://app.spendtab.com/signup">Get started</PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BENTO FEATURES GRID
          ══════════════════════════════════════ */}
      <section className="bg-ibm-g10 py-12 md:py-20 px-6" id="features">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow>Features</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] reveal">
            Everything your business<br />finances need. Nothing more.
          </h2>
          <p className="text-base text-ibm-g60 leading-[1.7] max-w-[520px] mt-3.5 mb-10 reveal">
            Built for how Nigerian entrepreneurs actually run their businesses — multiple income streams, multiple clients, multiple projects.
          </p>

          {/* Bento grid — 1px gap on bg-ibm-g20 creates the "grid line" border effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ibm-g20">

            {/* ── Expense Tracking (2-col wide, dark) ── */}
            <div className="reveal lg:col-span-2 bg-ibm-black text-white p-6 md:p-10 flex flex-col justify-between md:min-h-[270px]">
              <div>
                <BcTag variant="dark">Expense Tracking</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  Every naira, perfectly organised.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-ibm-g50 max-w-md">
                  Categorise income and expenses, search your full financial history, and export records in seconds. Real-time, across all your businesses.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {["Office Rent", "Software", "Travel", "Marketing", "Payroll", "Utilities"].map((cat) => (
                  <span key={cat} className="font-mono-ibm text-[0.68rem] px-2.5 py-1.5 border border-ibm-g80 text-ibm-g50">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Tax-Ready Reports ── */}
            <div className="reveal bg-white p-6 md:p-10 flex flex-col justify-between md:min-h-[270px]">
              <div>
                <BcTag>Financial Reports</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  One-click reports.<br />Tax season solved.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-ibm-g70">
                  Generate income statements, expense summaries, and tax-ready reports. Export as PDF anytime.
                </p>
              </div>
              <div className="mt-6">
                <div className="bg-ibm-g10 border border-ibm-g20">
                  <div className="font-mono-ibm text-[0.68rem] text-ibm-g60 uppercase tracking-wider px-4 py-3 border-b border-ibm-g20">
                    Income Statement — Q1 2026
                  </div>
                  {[["Total Revenue", "₦4,200,000", false], ["Total Expenses", "₦1,800,000", true], ["Net Profit", "₦2,400,000", false]].map(([l, v, neg]) => (
                    <div key={l as string} className="flex justify-between px-4 py-2.5 border-b border-ibm-g20 last:border-none">
                      <span className="text-[0.8rem] text-ibm-g60">{l}</span>
                      <span className={`font-mono-ibm text-[0.8rem] font-semibold ${neg ? "text-ibm-red opacity-70" : "text-ibm-blue"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Invoices ── */}
            <div className="reveal bg-white p-6 md:p-10 flex flex-col justify-between md:min-h-[240px]">
              <div>
                <BcTag>Invoices</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  Send invoices.<br />Get paid faster.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-ibm-g70">
                  Generate professional PDF invoices in seconds and share them with clients through a secure link.
                </p>
              </div>
              <div className="mt-6 bg-ibm-g10 border border-ibm-g20 p-3">
                <div className="flex justify-between items-start mb-2 pb-2 border-b border-ibm-g20">
                  <div>
                    <div className="font-mono-ibm text-[0.62rem] text-ibm-g50 uppercase tracking-wider mb-0.5">Invoice</div>
                    <div className="font-mono-ibm text-base font-bold">#INV-0042</div>
                  </div>
                  <span className="bg-ibm-green text-white text-[0.6rem] font-bold px-2 py-1 uppercase tracking-wider">Paid</span>
                </div>
                {[["Website Redesign", "₦450,000"], ["Monthly Retainer", "₦200,000"]].map(([l, v]) => (
                  <div key={l} className="flex justify-between font-mono-ibm text-[0.72rem] py-1.5 border-b border-ibm-g20 text-ibm-g70">{l}<span>{v}</span></div>
                ))}
                <div className="flex justify-between font-mono-ibm text-[0.78rem] font-bold py-1.5 text-ibm-blue"><span>Total</span><span>₦650,000</span></div>
              </div>
            </div>

            {/* ── Budget Management (blue) ── */}
            <div className="reveal bg-ibm-blue text-white p-6 md:p-10 flex flex-col justify-between md:min-h-[240px]">
              <div>
                <BcTag variant="blue">Budget Management</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  Know before you overspend.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-white/75">
                  Set budgets for every category and track spending against limits in real time.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3.5">
                {[["Marketing", "78%", "78%"], ["Operations", "92%", "92%"], ["Software", "40%", "40%"]].map(([l, val, w]) => (
                  <div key={l}>
                    <div className="flex justify-between text-[0.7rem] font-medium text-white/85 mb-1.5">
                      <span>{l}</span><span>{val}</span>
                    </div>
                    <div className="h-0.5 bg-white/20">
                      <div className="h-full bg-white" style={{ width: w }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Multi-Business Dashboard ── */}
            <div className="reveal bg-ibm-g10 p-6 md:p-10 flex flex-col justify-between md:min-h-[240px]">
              <div>
                <BcTag>Multi-Business</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  One login.<br />Multiple businesses.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-ibm-g70">
                  Manage separate accounts for each business entity with fully isolated data and reporting.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                {[["Consulting Ltd", "₦2.1M", true], ["E-commerce Store", "₦890K", false], ["Event Planning", "₦215K", false]].map(([name, rev, active]) => (
                  <div key={name as string} className={`flex justify-between px-3 py-2 text-[0.78rem] border ${active ? "bg-ibm-black text-white border-ibm-black" : "bg-white border-ibm-g20 text-ibm-g70"}`}>
                    <span className="font-medium">{name}</span>
                    <span className={`font-mono-ibm font-semibold ${active ? "text-white" : "text-ibm-blue"}`}>{rev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bank Reconciliation (2-col wide) ── */}
            <div className="reveal lg:col-span-2 bg-white p-6 md:p-10 flex flex-col lg:flex-row gap-6 lg:gap-10 justify-between items-start lg:items-center md:min-h-[220px]">
              <div>
                <BcTag>Bank Reconciliation</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  Your books match your bank.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-ibm-g70 max-w-sm">
                  Reconcile bank imports against recorded entries to catch discrepancies and keep your books clean.
                </p>
              </div>
              <div className="flex items-center gap-10 shrink-0">
                <div className="text-center">
                  <div className="font-mono-ibm text-[2.25rem] font-semibold tracking-[-0.02em] text-ibm-black">₦0</div>
                  <div className="font-mono-ibm text-[0.68rem] text-ibm-g50 mt-1">Unreconciled</div>
                </div>
                <span className="text-ibm-blue text-2xl font-light">→</span>
                <div className="text-center">
                  <div className="font-mono-ibm text-[2.25rem] font-semibold tracking-[-0.02em] text-ibm-blue">✓</div>
                  <div className="font-mono-ibm text-[0.68rem] text-ibm-g50 mt-1">Balanced</div>
                </div>
              </div>
            </div>

            {/* ── Tax Centre ── */}
            <div className="reveal bg-ibm-black text-white p-6 md:p-10 flex flex-col justify-between md:min-h-[220px]">
              <div>
                <BcTag variant="dark">Tax Centre</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  Tax season, simplified.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-ibm-g50">
                  Track VAT, categorise deductible expenses, and generate tax-ready reports year-round.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {["VAT", "PAYE", "Deductions", "Tax Reports"].map((t) => (
                  <span key={t} className="font-mono-ibm text-[0.65rem] text-ibm-blue border border-ibm-g80 px-2 py-1">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Analytics & Insights ── */}
            <div className="reveal bg-white p-6 md:p-10 flex flex-col justify-between md:min-h-[220px]">
              <div>
                <BcTag>Analytics</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  Profit &amp; loss at a glance.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-ibm-g70">
                  Visual dashboards, trend analysis, revenue vs expenses — updated in real time.
                </p>
              </div>
              {/* Mini bar chart */}
              <div className="flex gap-1 items-end h-12 mt-6">
                {[35, 60, 45, 75, 55, 90, 65, 80, 70, 88].map((h, i) => (
                  <div key={i} className="flex-1 bg-ibm-blue" style={{ height: `${h}%`, opacity: 0.2 + (i / 10) * 0.8 }} />
                ))}
              </div>
            </div>

            {/* ── Assets & Liabilities ── */}
            <div className="reveal bg-ibm-g10 p-6 md:p-10 flex flex-col justify-between md:min-h-[220px]">
              <div>
                <BcTag>Assets &amp; Liabilities</BcTag>
                <h3 className="text-xl font-semibold leading-[1.3] tracking-[-0.01em] mb-2.5">
                  Know your net worth.
                </h3>
                <p className="text-[0.875rem] leading-[1.65] text-ibm-g70">
                  Track business assets and liabilities to understand your true financial position at a glance.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-5">
                <div>
                  <div className="font-mono-ibm text-[0.68rem] text-ibm-g50 mb-1">Total Assets</div>
                  <div className="font-mono-ibm text-[1.375rem] font-semibold tracking-[-0.02em] text-ibm-black">↑ ₦2.4M</div>
                </div>
                <div>
                  <div className="font-mono-ibm text-[0.68rem] text-ibm-g50 mb-1">Liabilities</div>
                  <div className="font-mono-ibm text-[1.375rem] font-semibold tracking-[-0.02em] text-ibm-red">↓ ₦0.9M</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MID CTA 1
          ══════════════════════════════════════ */}
      <section className="bg-ibm-black text-center py-12 md:py-20 px-6">
        <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-white max-w-[620px] mx-auto reveal">
          Stop guessing.<br />Start tracking.
        </h2>
        <p className="text-base text-white/35 max-w-[440px] mx-auto mt-3.5 leading-[1.7] reveal">
          Join hundreds of Nigerian business owners who finally have clarity over their finances.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-7 reveal">
          <a href="https://app.spendtab.com/signup" className="bg-white text-ibm-black px-6 py-3.5 text-sm font-semibold hover:bg-ibm-g10 transition-colors">
            Get started
          </a>
          <a href="#pricing" className="border border-white/15 text-white/60 px-6 py-3.5 text-sm font-semibold hover:border-white/40 transition-colors">
            View pricing
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DETAIL: EXPENSE TRACKING
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center reveal">
            <div>
              <Eyebrow>Expense Tracking</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3vw,2.375rem)] font-semibold leading-[1.15] tracking-[-0.02em] mt-2.5 mb-4">
                Know exactly where<br />every naira goes.
              </h2>
              <p className="text-[0.9375rem] text-ibm-g60 leading-[1.7] mb-6">
                SpendTab makes it effortless to log, review, and categorize every business transaction.
              </p>
              <ul className="flex flex-col gap-0 mb-7 border-t border-ibm-g20">
                {["Log expenses in seconds with a simple, intuitive interface", "Categorize by project, client, department, or custom tags", "Search and filter transactions instantly", "Separate business expenses from personal spending", "View real-time expense feeds across all your accounts"].map((item) => (
                  <li key={item} className="text-[0.875rem] text-ibm-g60 py-2.5 pl-5 border-b border-ibm-g20 relative">
                    <span className="absolute left-0 text-ibm-blue font-bold">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="https://app.spendtab.com/signup" className="text-ibm-blue font-medium text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Start tracking expenses <span>→</span>
              </a>
            </div>
            <div className="bg-ibm-g10 border border-ibm-g20 p-7 flex flex-col gap-2">
              {[["Office Rent", "₦350,000"], ["Google Ads", "₦180,000"], ["Staff Salary", "₦420,000"], ["Software Tools", "₦45,000"], ["Travel & Transport", "₦92,000"]].map(([l, v]) => (
                <div key={l} className="flex justify-between px-3.5 py-2.5 bg-white border border-ibm-g20">
                  <span className="text-[0.84rem] font-medium text-ibm-g80">{l}</span>
                  <span className="font-mono-ibm text-[0.84rem] font-semibold text-ibm-blue">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DETAIL: INCOME TRACKING (alt)
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-ibm-g10">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center reveal">
            {/* Vis first on desktop */}
            <div className="order-2 lg:order-1 bg-white border border-ibm-g20 p-7">
              <div className="font-mono-ibm text-[0.68rem] text-ibm-g60 uppercase tracking-wider mb-4">Revenue vs Expenses — Q1 2026</div>
              <div className="flex items-end gap-5 h-[120px]">
                {[["Revenue", "80%", "bg-ibm-blue opacity-30", "₦4.2M"], ["Expenses", "35%", "bg-ibm-red opacity-30", "₦1.8M"], ["Profit", "50%", "bg-ibm-blue", "₦2.4M"]].map(([l, h, cls, v]) => (
                  <div key={l as string} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className={`w-full ${cls}`} style={{ height: h }} />
                    <div className="text-[0.68rem] text-ibm-g50">{l}</div>
                    <div className={`font-mono-ibm text-[0.84rem] font-semibold ${l === "Profit" ? "text-ibm-blue" : "text-ibm-g80"}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Eyebrow>Income Tracking</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3vw,2.375rem)] font-semibold leading-[1.15] tracking-[-0.02em] mt-2.5 mb-4">
                See your real profit.<br />Not just revenue.
              </h2>
              <p className="text-[0.9375rem] text-ibm-g60 leading-[1.7] mb-6">
                Track every payment from every client in one place. See which revenue stream is driving your business forward.
              </p>
              <ul className="flex flex-col gap-0 mb-7 border-t border-ibm-g20">
                {["Record income from clients, retainers, and project fees", "Track recurring revenue and one-time payments", "See income by source, client, or time period", "Compare income vs expenses for true profit visibility"].map((item) => (
                  <li key={item} className="text-[0.875rem] text-ibm-g60 py-2.5 pl-5 border-b border-ibm-g20 relative">
                    <span className="absolute left-0 text-ibm-blue font-bold">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="https://app.spendtab.com/signup" className="text-ibm-blue font-medium text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Start tracking income <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DETAIL: BUDGETS
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center reveal">
            <div>
              <Eyebrow>Budget Management</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3vw,2.375rem)] font-semibold leading-[1.15] tracking-[-0.02em] mt-2.5 mb-4">
                Set it. Track it.<br />Stay on budget.
              </h2>
              <p className="text-[0.9375rem] text-ibm-g60 leading-[1.7] mb-6">
                Create custom budgets for every project, department, or business area. Catch overruns before they become problems.
              </p>
              <ul className="flex flex-col gap-0 mb-7 border-t border-ibm-g20">
                {["Create unlimited budgets for any category", "Real-time spend tracking against budget limits", "Visual progress indicators for at-a-glance monitoring", "Historical budget performance to improve future planning"].map((item) => (
                  <li key={item} className="text-[0.875rem] text-ibm-g60 py-2.5 pl-5 border-b border-ibm-g20 relative">
                    <span className="absolute left-0 text-ibm-blue font-bold">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="https://app.spendtab.com/signup" className="text-ibm-blue font-medium text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Start budgeting smarter <span>→</span>
              </a>
            </div>
            <div className="bg-ibm-g10 border border-ibm-g20 p-7 flex flex-col gap-4">
              {[["Marketing Budget", "₦720K / ₦1M", "72%", false], ["Office Operations", "₦440K / ₦500K", "88%", true], ["Product Development", "₦290K / ₦800K", "36%", false], ["Client Project: Zenith", "₦150K / ₦200K", "75%", false]].map(([name, vals, pct, warn]) => (
                <div key={name as string}>
                  <div className="flex justify-between text-[0.84rem] font-medium mb-1.5">
                    <span>{name}</span>
                    <span className="font-mono-ibm text-[0.78rem] text-ibm-g50">{vals}</span>
                  </div>
                  <div className="h-[3px] bg-ibm-g20">
                    <div className={`h-full ${warn ? "bg-ibm-red opacity-70" : "bg-ibm-blue"}`} style={{ width: pct as string }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DETAIL: INVOICES (alt)
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-ibm-g10">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center reveal">
            <div className="order-2 lg:order-1 bg-white border border-ibm-g20">
              <div className="flex justify-between items-start p-5 border-b border-ibm-g20">
                <div>
                  <div className="font-mono-ibm text-[0.62rem] text-ibm-g50 uppercase tracking-wider mb-1">Invoice</div>
                  <div className="font-mono-ibm text-xl font-bold">#INV-0042</div>
                </div>
                <span className="bg-ibm-green text-white text-[0.62rem] font-bold px-2.5 py-1 uppercase tracking-wider">Paid</span>
              </div>
              {[["Website Redesign", "₦450,000"], ["SEO Audit", "₦120,000"], ["Monthly Retainer", "₦200,000"]].map(([l, v]) => (
                <div key={l} className="flex justify-between px-5 py-2.5 border-b border-ibm-g20 text-[0.875rem]">
                  <span className="text-ibm-g70">{l}</span>
                  <span className="font-mono-ibm text-ibm-g80 font-medium">{v}</span>
                </div>
              ))}
              <div className="flex justify-between px-5 py-3 font-bold text-[0.9375rem]">
                <span>Total</span>
                <span className="font-mono-ibm text-ibm-blue text-lg">₦770,000</span>
              </div>
              <div className="flex border-t border-ibm-g20">
                {["📄 Download PDF", "📧 Send to Client"].map((label, i) => (
                  <div key={i} className={`flex-1 py-2.5 text-center text-[0.78rem] font-medium text-ibm-g70 cursor-pointer hover:bg-ibm-g10 transition-colors ${i === 0 ? "border-r border-ibm-g20" : ""}`}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Eyebrow>Invoice Generation</Eyebrow>
              <h2 className="text-[clamp(1.75rem,3vw,2.375rem)] font-semibold leading-[1.15] tracking-[-0.02em] mt-2.5 mb-4">
                Send professional invoices.<br />Get paid faster.
              </h2>
              <p className="text-[0.9375rem] text-ibm-g60 leading-[1.7] mb-6">
                Stop creating invoices in Word or Google Docs. Generate clean, branded invoices in seconds and track payment status — all from your dashboard.
              </p>
              <ul className="flex flex-col gap-0 mb-7 border-t border-ibm-g20">
                {["Create and send professional invoices in under a minute", "Include line items, quantities, rates, taxes, and discounts", "Track invoice status: sent, viewed, paid, or overdue", "Download as PDF to share via email or WhatsApp"].map((item) => (
                  <li key={item} className="text-[0.875rem] text-ibm-g60 py-2.5 pl-5 border-b border-ibm-g20 relative">
                    <span className="absolute left-0 text-ibm-blue font-bold">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="https://app.spendtab.com/signup" className="text-ibm-blue font-medium text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Start sending invoices <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
          ══════════════════════════════════════ */}
      <div className="bg-ibm-black py-12 md:py-16 px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 max-w-[1120px] mx-auto">
          {[
            ["₦3,500", "Per month, flat"],
            ["1-Click", "Tax report exports"],
            ["∞", "Accounts & transactions"],
            ["14", "Day free trial"],
          ].map(([n, d], i) => (
            <div key={i} className={`reveal px-5 md:px-10 py-4 lg:py-0 ${i > 0 ? "border-l border-ibm-g80" : "pl-0"} ${i >= 2 ? "mt-6 lg:mt-0" : ""}`}>
              <div className="text-[2.75rem] font-semibold text-white tracking-[-0.03em] leading-none">
                <span className="text-ibm-blue">{n}</span>
              </div>
              <div className="text-[0.84rem] text-ibm-g50 mt-2">{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-white" id="how">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] reveal">
            Up and running in minutes.
          </h2>
          <p className="text-base text-ibm-g60 leading-[1.7] max-w-[520px] mt-3.5 reveal">
            No complicated setup. No training. No accounting background needed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-ibm-g20 mt-10 md:mt-14">
            {[
              ["01", "Sign up free", "Create your account in 30 seconds. No credit card, no commitment. Get started immediately."],
              ["02", "Add your businesses", "Set up each business, side project, or income stream as a separate account. SpendTab keeps them organized."],
              ["03", "Log transactions", "Record income and expenses as they happen. Categorize by project, client, or custom tags. It takes seconds."],
              ["04", "Get reports & insights", "Generate financial reports, monitor budgets, and see analytics. Share with your accountant or use for tax filings."],
            ].map(([num, title, desc], i) => (
              <div key={i} className={`reveal py-6 md:py-9 border-b md:border-b-0 border-ibm-g20 ${i > 0 ? "lg:pl-9 lg:border-l" : ""} ${i === 1 ? "lg:px-9" : ""}`}>
                <div className="font-mono-ibm text-[0.68rem] text-ibm-blue font-medium mb-5 tracking-wider">{num}</div>
                <h3 className="text-[1rem] font-semibold mb-2.5">{title}</h3>
                <p className="text-[0.875rem] text-ibm-g60 leading-[1.65]">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 reveal">
            <PrimaryBtn href="https://app.spendtab.com/signup">Get started</PrimaryBtn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BENEFITS
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-ibm-g10">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow>Why SpendTab</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] reveal">
            Why Nigerian business owners<br />choose SpendTab.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ibm-g20 mt-10 md:mt-14">
            {[
              ["01", "Replace messy spreadsheets", "Stop juggling multiple Excel files, notebooks, and bank statement screenshots. Everything in one searchable, organized place."],
              ["02", "Separate business & personal", "Know exactly how each business performs. Keep consulting income separate from e-commerce revenue. See true profit per venture."],
              ["03", "Tax season in one click", "No more spending days gathering numbers for your accountant. Export clean, categorized tax reports in seconds, any time of year."],
              ["04", "Make smarter decisions", "Clear financial data means better business decisions. See where you're overspending, which clients are most profitable."],
              ["05", "No learning curve", "SpendTab is designed for entrepreneurs, not accountants. Simple, intuitive, and fast. If you can use WhatsApp, you can use SpendTab."],
              ["06", "Affordable naira pricing", "No dollar-denominated pricing that fluctuates with exchange rates. Just ₦3,500/month for unlimited everything."],
            ].map(([num, title, desc]) => (
              <div key={num} className="reveal bg-white p-6 md:p-10">
                <div className="font-mono-ibm text-[0.68rem] text-ibm-blue mb-4 tracking-wider">{num}</div>
                <h3 className="text-[1rem] font-semibold mb-2.5 tracking-[-0.01em]">{title}</h3>
                <p className="text-[0.875rem] text-ibm-g60 leading-[1.65]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          AUDIENCE
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow>Who uses SpendTab</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] reveal">
            Built for every kind of<br />Nigerian business owner.
          </h2>
          <p className="text-base text-ibm-g60 leading-[1.7] max-w-[520px] mt-3.5 reveal">
            Whether you&apos;re just starting out or scaling up, SpendTab adapts to your business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ibm-g20 mt-8 md:mt-12">
            {[
              ["💼", "Consultants & Advisors", "Organize income from multiple clients. Monitor ongoing project expenses and track retainer payments."],
              ["🛒", "E-commerce Owners", "Track profits from multiple platforms. Monitor inventory costs, shipping fees, and marketing spend."],
              ["💻", "Digital Creators & Freelancers", "Manage revenue from platforms, sponsorships, and direct clients."],
              ["🎨", "Creative Professionals", "Manage multiple revenue streams from design clients, print sales, and commissions."],
              ["🏠", "Real Estate Agents", "Track commissions, marketing costs, and client-related expenses across multiple property deals."],
              ["📚", "Coaches & Educators", "Manage course sales, one-on-one client payments, and workshop fees."],
              ["🎉", "Event Planners", "Monitor venue costs, vendor expenses, and client budgets across multiple events simultaneously."],
              ["🔧", "Contractors & Tradespeople", "Manage multiple client accounts, material costs, and labor expenses across jobs."],
              ["🚀", "Startup Founders", "Track startup costs, runway, and burn rate. Set budgets for product development and marketing."],
            ].map(([emoji, title, desc]) => (
              <div key={title as string} className="reveal bg-white p-5 md:p-8">
                <span className="text-[1.25rem] mb-3 block">{emoji}</span>
                <h3 className="text-[0.9375rem] font-semibold mb-2">{title}</h3>
                <p className="text-[0.84rem] text-ibm-g60 leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MID CTA 2
          ══════════════════════════════════════ */}
      <section className="bg-ibm-black text-center py-12 md:py-20 px-6">
        <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-white max-w-[620px] mx-auto reveal">
          Your business deserves<br />financial clarity.
        </h2>
        <p className="text-base text-white/35 max-w-[440px] mx-auto mt-3.5 leading-[1.7] reveal">
          No credit card. No accounting degree. Just sign up and start tracking.
        </p>
        <div className="flex justify-center mt-7 reveal">
          <a href="https://app.spendtab.com/signup" className="bg-white text-ibm-black px-6 py-3.5 text-sm font-semibold hover:bg-ibm-g10 transition-colors">
            Get started
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════
          COMPARISON
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-ibm-g10">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow>SpendTab vs Others</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] reveal">
            Why SpendTab wins for<br />Nigerian SMEs.
          </h2>
          <p className="text-base text-ibm-g60 leading-[1.7] max-w-[520px] mt-3.5 reveal">
            Enterprise accounting software is complex and expensive. SpendTab is purpose-built for how you actually work.
          </p>

          <div className="mt-8 md:mt-12 reveal overflow-x-auto">
            <table className="w-full text-[0.875rem] border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-5 py-3.5 text-[0.84rem] font-semibold border-b-2 border-ibm-black bg-ibm-g10">Feature</th>
                  <th className="text-left px-5 py-3.5 text-[0.84rem] font-semibold border-b-2 border-ibm-black bg-ibm-black text-white">SpendTab</th>
                  <th className="text-left px-5 py-3.5 text-[0.84rem] font-semibold border-b-2 border-ibm-black bg-ibm-g10">Generic Software</th>
                  <th className="text-left px-5 py-3.5 text-[0.84rem] font-semibold border-b-2 border-ibm-black bg-ibm-g10">Spreadsheets</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Naira-first pricing", true, false, true],
                  ["Multi-business support", true, true, false],
                  ["One-click tax reports", true, true, false],
                  ["No learning curve", true, false, true],
                  ["Budget management", true, true, false],
                  ["Built for Nigerian SMEs", true, false, false],
                  ["Under ₦5,000/month", true, false, true],
                  ["Visual analytics dashboard", true, true, false],
                ].map(([feature, st, gen, spr]) => (
                  <tr key={feature as string} className="hover:bg-ibm-g10 transition-colors">
                    <td className="px-5 py-3.5 border-b border-ibm-g20 font-medium text-ibm-black">{feature}</td>
                    <td className="px-5 py-3.5 border-b border-ibm-g20 font-bold text-ibm-green">{st ? "✓" : <span className="text-ibm-g30">✗</span>}</td>
                    <td className="px-5 py-3.5 border-b border-ibm-g20 font-bold">{gen ? <span className="text-ibm-green">✓</span> : <span className="text-ibm-g30">✗</span>}</td>
                    <td className="px-5 py-3.5 border-b border-ibm-g20 font-bold">{spr ? <span className="text-ibm-green">✓</span> : <span className="text-ibm-g30">✗</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow>What business owners say</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] reveal">
            Trusted by entrepreneurs<br />across Nigeria.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ibm-g20 mt-10 md:mt-14">
            {[
              ["AO", "Adaeze O.", "Consultant & E-commerce Owner, Lagos", "SpendTab finally gave me clarity on which of my three businesses is actually making money. I used to guess — now I know exactly."],
              ["KB", "Kunle B.", "Real Estate Agent, Abuja", "Tax time used to take me a week of digging through spreadsheets. Now I export everything in one click. My accountant loves me."],
              ["FI", "Funke I.", "Event Planner, Port Harcourt", "The simplicity is what sold me. No confusing accounting jargon. I signed up and was tracking expenses within five minutes."],
            ].map(([init, name, role, quote]) => (
              <div key={name as string} className="reveal bg-white p-6 md:p-10">
                <div className="text-ibm-blue text-[0.875rem] tracking-[3px] mb-5">★★★★★</div>
                <blockquote className="text-[0.9375rem] leading-[1.7] text-ibm-g70 mb-7">{quote}</blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-ibm-black text-white flex items-center justify-center font-mono-ibm text-[0.68rem] font-bold shrink-0">
                    {init}
                  </div>
                  <div>
                    <div className="text-[0.875rem] font-semibold">{name}</div>
                    <div className="text-[0.78rem] text-ibm-g50 mt-0.5">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-ibm-g10" id="pricing">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow className="justify-center">Pricing</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-center reveal">
            Simple pricing.<br />No surprises. No hidden fees.
          </h2>
          <p className="text-base text-ibm-g60 leading-[1.7] text-center mt-3.5 reveal mx-auto max-w-[420px]">
            Unlimited everything on every plan. Pay in Naira. Cancel anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ibm-g20 max-w-[800px] mx-auto mt-8 md:mt-12">
            {/* Monthly */}
            <div className="reveal bg-white p-7 md:p-12">
              <div className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-ibm-g60 mb-4">Monthly</div>
              <div className="text-[2.5rem] font-semibold tracking-[-0.03em] leading-none mb-2">
                ₦3,500 <small className="text-[1rem] font-normal text-ibm-g50">/mo</small>
              </div>
              <ul className="my-8 flex flex-col gap-0">
                {["Unlimited business accounts", "Unlimited transactions", "Unlimited budgets", "Detailed analytics dashboard", "Export financial reports", "Expense categorization"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[0.875rem] text-ibm-g70 py-2.5 border-b border-ibm-g20">
                    <span className="text-ibm-blue font-bold text-sm">—</span> {f}
                  </li>
                ))}
              </ul>
              <PrimaryBtn href="https://app.spendtab.com/signup" className="w-full text-center block">Get started</PrimaryBtn>
            </div>

            {/* Yearly */}
            <div className="reveal bg-ibm-black text-white p-7 md:p-12 relative">
              <span className="absolute top-5 right-5 bg-ibm-blue text-white text-[0.65rem] font-bold px-2.5 py-1 uppercase tracking-wider">Save 14%</span>
              <div className="text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-ibm-g50 mb-4">Yearly</div>
              <div className="text-[2.5rem] font-semibold tracking-[-0.03em] leading-none mb-2 text-white">
                ₦35,999 <small className="text-[1rem] font-normal text-ibm-g50">/yr</small>
              </div>
              <ul className="my-8 flex flex-col gap-0">
                {["Everything in Monthly", "Early access to new features", "Build SpendTab with the team", "Priority support", "Limited spots available"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[0.875rem] text-ibm-g50 py-2.5 border-b border-ibm-g80">
                    <span className="text-ibm-blue font-bold text-sm">—</span> {f}
                  </li>
                ))}
              </ul>
              <PrimaryBtn href="https://app.spendtab.com/signup" className="w-full text-center block">Get started</PrimaryBtn>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
          ══════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 bg-white" id="faq">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow className="justify-center">FAQ</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-center reveal">
            Frequently asked questions.
          </h2>

          <div className="max-w-[720px] mx-auto mt-8 md:mt-12">
            {[
              ["Do I need accounting experience to use SpendTab?", "Not at all. SpendTab is designed for business owners, not accountants. If you can use a banking app, you can use SpendTab."],
              ["Can I manage multiple businesses on one account?", "Yes. SpendTab lets you create unlimited separate business accounts within one dashboard. Each business has its own transactions, budgets, and reports."],
              ["Is my financial data secure?", "Absolutely. SpendTab uses bank-level encryption to protect your data. Your financial information is stored securely and is only accessible to you."],
              ["Can I export reports for my accountant?", "Yes. You can generate and export financial reports — including income statements, expense summaries, and category breakdowns — with one click."],
              ["How does billing work?", "You can subscribe at ₦3,500/month or ₦35,999/year. If you choose not to continue, your account remains accessible in read-only mode."],
              ["Why is SpendTab priced in Naira?", "Because SpendTab is built for Nigerian business owners. We price in Naira so you never have to worry about exchange rate fluctuations."],
              ["Can I track both income and expenses?", "Yes. SpendTab lets you track all income sources alongside all your expenses. You get a complete picture of your business profitability."],
              ["Is there a mobile app?", "SpendTab is a web application optimized for both desktop and mobile browsers. You can access it from any device — no downloads required."],
            ].map(([q, a]) => (
              <details key={q as string} className="group border-b border-ibm-g20">
                <summary className="flex justify-between items-center py-5 text-[0.9375rem] font-medium cursor-pointer list-none hover:text-ibm-blue transition-colors select-none gap-4">
                  {q}
                  <span className="text-xl font-light text-ibm-g50 shrink-0 transition-transform duration-200 group-open:rotate-45 group-open:text-ibm-blue">+</span>
                </summary>
                <p className="pb-5 text-[0.9rem] text-ibm-g60 leading-[1.7]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════ */}
      <section className="bg-ibm-black py-14 md:py-24 px-6 text-center">
        <div className="max-w-[1120px] mx-auto">
          <Eyebrow className="justify-center [&>span]:bg-ibm-g80">Get started</Eyebrow>
          <h2 className="text-[clamp(1.875rem,3.5vw,2.875rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-white max-w-[620px] mx-auto reveal">
            No complicated setup.<br />No accounting jargon.<br />Just clarity.
          </h2>
          <p className="text-base text-ibm-g50 max-w-[480px] mx-auto mt-5 leading-[1.7] reveal">
            Track your spending, manage multiple businesses, and generate tax-ready reports — all for less than the cost of one business lunch.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8 reveal">
            <a href="https://app.spendtab.com/signup" className="bg-ibm-blue text-white px-6 py-3.5 text-sm font-semibold hover:bg-ibm-blueh transition-colors">
              Get started
            </a>
            <a href="#features" className="border border-ibm-g80 text-white/60 px-6 py-3.5 text-sm font-semibold hover:border-white/40 transition-colors">
              Explore all features
            </a>
          </div>
          <p className="reveal text-[0.8rem] text-ibm-g60 mt-5">₦3,500/month · Cancel anytime</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer className="border-t border-ibm-g20 pt-10 md:pt-14 pb-8 px-6 bg-white">
        <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <a href="https://spendtab.com" className="flex items-center gap-2 font-semibold text-[1rem] text-ibm-black mb-4">
              <LogoMark size={22} /> SpendTab
            </a>
            <p className="text-[0.875rem] text-ibm-g60 leading-[1.65] max-w-[280px]">
              The simplest accounting software for Nigerian business owners and SMEs. Track expenses, manage budgets, generate tax-ready reports.
            </p>
          </div>
          <div>
            <h4 className="font-mono-ibm text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ibm-black mb-5">Product</h4>
            {[["#features", "Features"], ["#pricing", "Pricing"], ["#how", "How it works"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={label} href={href} className="block text-[0.875rem] text-ibm-g60 mb-2.5 hover:text-ibm-black transition-colors">{label}</a>
            ))}
          </div>
          <div>
            <h4 className="font-mono-ibm text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ibm-black mb-5">Get started</h4>
            {[["https://app.spendtab.com/signup", "Get started"], ["https://app.spendtab.com/login", "Sign in"], ["mailto:hello@spendtab.com", "Contact"]].map(([href, label]) => (
              <a key={label} href={href} className="block text-[0.875rem] text-ibm-g60 mb-2.5 hover:text-ibm-black transition-colors">{label}</a>
            ))}
          </div>
        </div>
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 mt-12 pt-6 border-t border-ibm-g20 text-[0.8rem] text-ibm-g50">
          <p>© 2026 SpendTab. Built in Nigeria, for Nigeria.</p>
          <p>
            <a href="/privacy-policy" className="hover:text-ibm-black transition-colors">Privacy Policy</a>
            <span className="mx-2">·</span>
            <a href="/terms-of-service" className="hover:text-ibm-black transition-colors">Terms of Service</a>
          </p>
        </div>
      </footer>
    </>
  );
}
