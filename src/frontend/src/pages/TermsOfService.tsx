import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="text-4xl font-bold text-navy mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 24, 2026
        </p>

        <section className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ScanLink, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use the service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ScanLink is a decentralized digital identity platform built on the
              Internet Computer Protocol (ICP). It allows vehicle owners to
              register their vehicles, receive unique QR codes, and receive
              anonymous messages from anyone who scans those codes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              3. Eligibility
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years old to create an account and use
              ScanLink as an object owner. Anyone may scan a QR code and leave a
              message without creating an account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              4. User Accounts
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                You are responsible for maintaining the security of your
                Internet Identity.
              </li>
              <li>
                You must provide accurate name and email information in your
                profile.
              </li>
              <li>
                You are responsible for all activity that occurs under your
                account.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              5. Subscriptions &amp; Payments
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                Vehicle registration requires a subscription: $9.99/year for the
                first vehicle, $4.99/year for each additional vehicle.
              </li>
              <li>
                Physical QR stickers: one free per vehicle; replacements are
                $9.99 plus shipping.
              </li>
              <li>All payments are processed securely through Stripe.</li>
              <li>
                Subscriptions renew annually. You may cancel at any time from
                your dashboard.
              </li>
              <li>
                Refunds are handled on a case-by-case basis. Contact support for
                assistance.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              6. Acceptable Use
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to use ScanLink to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>Send harassing, threatening, or abusive messages.</li>
              <li>Impersonate any person or entity.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>
                Attempt to gain unauthorized access to any part of the platform.
              </li>
              <li>
                Interfere with the operation of the service or its
                infrastructure.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">7. Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit to ScanLink. By
              submitting content, you grant ScanLink a limited license to store
              and display it as necessary to operate the service. ScanLink
              reserves the right to remove content that violates these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ScanLink is provided "as is" without warranties of any kind,
              express or implied. We do not guarantee uninterrupted or
              error-free service. The decentralized nature of ICP means certain
              platform behaviors are outside our direct control.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              9. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, ScanLink shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of the service, including but not
              limited to loss of data or unauthorized access to your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              10. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms of Service from time to time. We will
              notify registered users of material changes. Continued use of
              ScanLink after changes are posted constitutes acceptance of the
              updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              11. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by applicable law. Any disputes shall be
              resolved through binding arbitration or in a court of competent
              jurisdiction.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              12. Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, email us at{" "}
              <a
                href="mailto:support@scanlink.app"
                className="text-primary hover:underline"
              >
                support@scanlink.app
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
