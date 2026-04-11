import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/Logo";

export const metadata: Metadata = {
  title: "Terms of Service | SpendTab",
  description:
    "SpendTab's Terms of Service. Read the terms and conditions governing your use of SpendTab.",
  alternates: { canonical: "https://spendtab.com/terms-of-service" },
};

export default function TermsOfService() {
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
          <h1>Terms of Service</h1>
          <p className="legal-meta">Last updated: April 10, 2026</p>
        </div>

        <div className="legal-body">

          <section className="legal-section">
            <h2>1. Agreement to Terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
              and SpendTab (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) governing your access to and use of our
              web application and services available at{" "}
              <a href="https://spendtab.com">spendtab.com</a> and{" "}
              <a href="https://app.spendtab.com">app.spendtab.com</a>.
            </p>
            <p>
              By creating an account or using SpendTab, you confirm that you are at least 18 years
              old, have read and understood these Terms, and agree to be bound by them. If you do
              not agree, you must not use SpendTab.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              SpendTab is a web-based financial management platform designed for Nigerian small and
              medium businesses. It provides tools for:
            </p>
            <ul>
              <li>Tracking income and expenses across multiple business accounts</li>
              <li>Creating and managing budgets</li>
              <li>Generating financial reports</li>
              <li>Creating and sending invoices</li>
              <li>Bank reconciliation</li>
              <li>Tracking assets and liabilities</li>
            </ul>
            <p>
              SpendTab is a bookkeeping and record-keeping tool. It is not a licensed financial
              advisor, accountant, or tax authority. Any financial decisions you make based on
              data in SpendTab are your own responsibility.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Account Registration</h2>
            <p>To use SpendTab, you must:</p>
            <ul>
              <li>Provide accurate, current, and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorised access to your account</li>
              <li>Not share your account with any other person or entity</li>
              <li>Not create multiple accounts to circumvent subscription requirements</li>
            </ul>
            <p>
              You are responsible for all activity that occurs under your account. SpendTab is
              not liable for any loss resulting from unauthorised use of your account where you
              failed to maintain the security of your credentials.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Subscription and Billing</h2>
            <h3>4.1 Plans</h3>
            <p>
              SpendTab offers paid subscription plans billed in Nigerian Naira (₦). Current pricing
              is displayed on our{" "}
              <Link href="/#pricing">pricing page</Link>. Prices are subject to change with
              30 days&apos; notice.
            </p>
            <h3>4.2 Billing</h3>
            <p>
              Subscriptions are billed in advance on a monthly or annual basis. Payment is processed
              securely through Paystack. By subscribing, you authorise SpendTab to charge your
              selected payment method on each renewal date.
            </p>
            <h3>4.3 Cancellation</h3>
            <p>
              You may cancel your subscription at any time from your account settings. Cancellation
              takes effect at the end of your current billing period. We do not provide refunds for
              partial billing periods.
            </p>
            <h3>4.4 Failed Payments</h3>
            <p>
              If a payment fails, we will notify you by email. Your account will be downgraded to
              read-only access if payment is not received within 7 days of the failure notice.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Acceptable Use</h2>
            <p>You agree to use SpendTab only for lawful purposes. You must not:</p>
            <ul>
              <li>Use SpendTab to record or facilitate illegal financial activity, fraud, or money laundering</li>
              <li>Attempt to gain unauthorised access to any part of the platform or another user&apos;s data</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of SpendTab</li>
              <li>Use automated tools (bots, scrapers) to access or extract data from the platform</li>
              <li>Transmit viruses, malware, or any other malicious code</li>
              <li>Impersonate SpendTab, our team, or any other person or entity</li>
              <li>Resell or sublicense access to SpendTab without our written consent</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms
              without notice or refund.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Data</h2>
            <p>
              You retain full ownership of all financial data, business records, and content you
              input into SpendTab. By using the platform, you grant SpendTab a limited licence to
              store, process, and display your data solely for the purpose of providing the service
              to you.
            </p>
            <p>
              We do not claim any ownership over your financial records. We will not use your
              specific business data for any purpose other than operating the service. See our{" "}
              <Link href="/privacy-policy">Privacy Policy</Link> for full details on how we
              handle your data.
            </p>
            <p>
              You are responsible for the accuracy of the data you enter. SpendTab is not
              responsible for errors in your financial records caused by incorrect data entry.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Intellectual Property</h2>
            <p>
              SpendTab, including its name, logo, design, software, and all content created by us,
              is owned by SpendTab and protected by applicable intellectual property laws. Nothing
              in these Terms grants you any right to use our trademarks, logos, or proprietary
              content without our prior written consent.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Disclaimers</h2>
            <p>
              SpendTab is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              express or implied, including but not limited to warranties of merchantability,
              fitness for a particular purpose, or non-infringement.
            </p>
            <p>We do not warrant that:</p>
            <ul>
              <li>The service will be uninterrupted, error-free, or completely secure</li>
              <li>The results obtained from the service will be accurate or reliable</li>
              <li>Any errors in the software will be corrected</li>
            </ul>
            <p>
              SpendTab is a record-keeping tool and does not constitute professional financial,
              tax, legal, or accounting advice. You should consult a qualified professional for
              such guidance.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, SpendTab and its officers,
              directors, employees, and agents shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages — including loss of profits, data, or
              business opportunities — arising from your use of or inability to use the service.
            </p>
            <p>
              Our total liability to you for any claim arising from use of SpendTab shall not
              exceed the total amount you paid us in the 3 months immediately preceding the claim.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless SpendTab, its officers, employees, and
              agents from any claims, damages, losses, liabilities, and expenses (including legal
              fees) arising from: (a) your use of SpendTab; (b) your violation of these Terms;
              (c) your violation of any third-party rights; or (d) inaccurate financial data you
              input into the platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Service Availability and Changes</h2>
            <p>
              We aim to maintain high availability but do not guarantee uninterrupted access.
              We may perform maintenance, updates, or emergency fixes that temporarily affect
              availability. We will endeavour to provide advance notice of planned downtime.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue any feature or the service
              as a whole, with reasonable notice where practicable.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Termination</h2>
            <p>
              Either party may terminate these Terms at any time. You may do so by deleting your
              account. We may suspend or terminate your access immediately if you violate these
              Terms, fail to pay your subscription, or engage in conduct that we determine to be
              harmful to SpendTab or other users.
            </p>
            <p>
              Upon termination, your right to access the service ceases. We will retain your data
              for 30 days after termination, during which you may request an export. After 30 days,
              your data may be permanently deleted.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federal
              Republic of Nigeria. Any disputes arising from or relating to these Terms or your
              use of SpendTab shall be subject to the exclusive jurisdiction of the courts of
              Lagos State, Nigeria.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes
              by email and by updating the &quot;Last updated&quot; date at the top of this page. Your
              continued use of SpendTab after changes take effect constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us:
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
