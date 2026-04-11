import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy | SpendTab",
  description:
    "SpendTab's Privacy Policy. Learn how we collect, use, and protect your personal and financial data.",
  alternates: { canonical: "https://spendtab.com/privacy-policy" },
};

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href="/" className="nav-logo">
          <LogoMark /> SpendTab
        </Link>
      </header>

      <main className="legal-main">
        <div className="legal-hero">
          <p className="legal-label">Legal</p>
          <h1>Privacy Policy</h1>
          <p className="legal-meta">Last updated: April 10, 2026</p>
        </div>

        <div className="legal-body">

          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              SpendTab (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our web application and services at{" "}
              <a href="https://spendtab.com">spendtab.com</a> and{" "}
              <a href="https://app.spendtab.com">app.spendtab.com</a>.
            </p>
            <p>
              By accessing or using SpendTab, you agree to the terms of this Privacy Policy.
              If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account information:</strong> Your name, email address, and password when you create an account.</li>
              <li><strong>Business information:</strong> Business names, descriptions, and settings you add to your accounts.</li>
              <li><strong>Financial data:</strong> Transaction records, income entries, expenses, budgets, invoice details, and categories you enter into the platform.</li>
              <li><strong>Payment information:</strong> Billing details processed through our payment provider (Paystack). We do not store full card numbers on our servers.</li>
              <li><strong>Communications:</strong> Messages you send us via email or support channels.</li>
            </ul>
            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Usage data:</strong> Pages visited, features used, clicks, and session duration.</li>
              <li><strong>Device information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
              <li><strong>Cookies:</strong> Session tokens and preference cookies necessary for the application to function. See Section 7 for details.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and maintain the SpendTab platform</li>
              <li>Process your transactions and manage your subscription</li>
              <li>Send you account-related notifications (receipts, billing alerts, product updates)</li>
              <li>Respond to your support requests and enquiries</li>
              <li>Improve our product through aggregated, anonymised usage analytics</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Comply with applicable laws and regulations in Nigeria</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal data or financial data to third parties.
              We do not use your financial records for advertising purposes.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. How We Share Your Information</h2>
            <p>We may share your information only in the following limited circumstances:</p>
            <ul>
              <li>
                <strong>Service providers:</strong> Trusted third-party vendors who help us operate SpendTab
                (e.g. Supabase for database hosting, Paystack for payment processing, Resend for transactional email).
                These providers are contractually bound to protect your data and may only use it to provide services to us.
              </li>
              <li>
                <strong>Legal requirements:</strong> If required by law, court order, or government authority in Nigeria
                or any applicable jurisdiction.
              </li>
              <li>
                <strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets,
                your data may be transferred as part of that transaction. We will notify you before this occurs.
              </li>
              <li>
                <strong>With your consent:</strong> In any other circumstances with your explicit permission.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Security</h2>
            <p>
              We take the security of your data seriously. SpendTab uses:
            </p>
            <ul>
              <li>TLS/HTTPS encryption for all data in transit</li>
              <li>AES-256 encryption for sensitive data at rest via Supabase</li>
              <li>Row-level security policies so users can only access their own data</li>
              <li>Regular security reviews and access controls</li>
            </ul>
            <p>
              Despite these measures, no system is 100% secure. We encourage you to use a strong,
              unique password and to contact us immediately if you suspect unauthorised access to
              your account.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Data Retention</h2>
            <p>
              We retain your account and financial data for as long as your account is active.
              If you delete your account, we will delete or anonymise your personal data within
              30 days, except where we are required by law to retain certain records (e.g. financial
              transaction logs for tax compliance purposes), which may be retained for up to 7 years.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Cookies</h2>
            <p>SpendTab uses the following types of cookies:</p>
            <ul>
              <li><strong>Essential cookies:</strong> Required for authentication and session management. The application cannot function without these.</li>
              <li><strong>Preference cookies:</strong> Store your settings such as selected currency and active account.</li>
              <li><strong>Analytics cookies:</strong> Anonymised usage data collected via PostHog to help us improve the product. No personally identifiable information is included.</li>
            </ul>
            <p>
              You can disable non-essential cookies through your browser settings. Disabling essential
              cookies will prevent you from logging in.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request that we correct inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request that we delete your account and associated data.</li>
              <li><strong>Portability:</strong> Request an export of your financial data in a machine-readable format.</li>
              <li><strong>Objection:</strong> Object to certain processing of your data.</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:hello@spendtab.com">hello@spendtab.com</a>. We will respond within 30 days.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              SpendTab is not intended for use by anyone under the age of 18. We do not knowingly
              collect personal data from children. If you believe a child has provided us with
              personal information, please contact us and we will delete it promptly.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we make material changes,
              we will notify you by email and update the &quot;Last updated&quot; date at the top of this page.
              Your continued use of SpendTab after changes take effect constitutes your acceptance
              of the revised policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:
            </p>
            <div className="legal-contact">
              <p><strong>SpendTab</strong></p>
              <p>Email: <a href="mailto:hello@spendtab.com">hello@spendtab.com</a></p>
              <p>Website: <a href="https://spendtab.com">spendtab.com</a></p>
            </div>
          </section>

        </div>
      </main>

      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <Link href="/" className="nav-logo">
            <LogoMark /> SpendTab
          </Link>
          <div className="legal-footer-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <p>© 2026 SpendTab. Built in Nigeria, for Nigeria.</p>
        </div>
      </footer>
    </div>
  );
}
