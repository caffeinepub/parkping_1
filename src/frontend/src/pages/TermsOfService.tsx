import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="text-4xl font-bold text-navy mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Effective date: March 2026
        </p>

        <section className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ScanLink, you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these
              Terms, please do not use the service. These Terms constitute a
              legally binding agreement between you and ScanLink.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ScanLink is a decentralized Digital Identity platform built on the
              Internet Computer Protocol (ICP). It enables owners to register
              any physical object — including vehicles, bicycles, pets, luggage,
              electronics, keys, and more — with a unique Digital Identity
              linked to a dynamic QR code. Anyone who scans the QR code can send
              an anonymous message to the object owner without needing to create
              an account or share personal contact information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              3. Eligibility
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years old to create an account and
              register objects as an owner. Anyone may scan a QR code and send a
              message without creating an account. By creating an account, you
              represent that you meet the eligibility requirements.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              4. User Accounts
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                You are responsible for maintaining the security of your
                Internet Identity credentials.
              </li>
              <li>
                You must provide accurate name and email information in your
                profile.
              </li>
              <li>
                You are responsible for all activity that occurs under your
                account.
              </li>
              <li>You may not transfer your account to another person.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              5. Subscriptions &amp; Payments
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Subscription:</strong> ScanLink requires a subscription
                of <strong>$9.99/year per user account</strong>, which allows
                you to create up to <strong>10 unique Digital IDs</strong> for
                your objects.
              </li>
              <li>
                <strong>Self-printed QR codes:</strong> You may generate and
                print your own QR codes at no additional charge. Printable QR
                codes are always free.
              </li>
              <li>
                <strong>Physical stickers:</strong> Official weatherproof QR
                stickers can be ordered for <strong>$19.99 per sticker</strong>{" "}
                plus applicable shipping costs and taxes. There are no free
                physical stickers.
              </li>
              <li>
                All payments are processed securely through Stripe. ScanLink
                does not store your payment card details.
              </li>
              <li>
                Subscriptions renew annually. You may cancel at any time from
                your dashboard. Cancellations take effect at the end of the
                current billing period.
              </li>
              <li>
                Refunds are handled on a case-by-case basis. Contact{" "}
                <a
                  href="mailto:legal@scanlink.app"
                  className="text-primary hover:underline"
                >
                  legal@scanlink.app
                </a>{" "}
                for assistance.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              6. QR Codes &amp; Digital Identities
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                Each Digital Identity is assigned a unique, permanent QR code
                that links to the latest object information you have provided.
              </li>
              <li>
                QR codes are dynamic — you may update the linked information at
                any time without reprinting the sticker.
              </li>
              <li>
                If you delete a Digital Identity, the associated QR code will
                stop working permanently. You will need to create a new Digital
                Identity and generate a new QR code.
              </li>
              <li>
                ScanLink reserves the right to deactivate a QR code if it is
                associated with a violation of these Terms.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              7. Acceptable Use
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree not to use ScanLink to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                Send harassing, threatening, abusive, defamatory, or otherwise
                illegal messages.
              </li>
              <li>Impersonate any person, organization, or entity.</li>
              <li>
                Register objects you do not own or have authorization to manage.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the platform
                or its infrastructure.
              </li>
              <li>
                Use automated tools to scrape, spam, or abuse the messaging
                system.
              </li>
              <li>
                Violate any applicable local, national, or international law or
                regulation.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">8. Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit to ScanLink
              (including object descriptions, photos, and messages). By
              submitting content, you grant ScanLink a limited, non-exclusive
              license to store and display it as necessary to operate the
              service. ScanLink reserves the right to remove content that
              violates these Terms or applicable law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              9. Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ScanLink is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, express or
              implied, including but not limited to warranties of
              merchantability, fitness for a particular purpose, or
              non-infringement. We do not guarantee uninterrupted, error-free
              service. The decentralized nature of the Internet Computer
              Protocol means certain platform behaviors are outside our direct
              control.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              10. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, ScanLink and
              its operators shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use
              of or inability to use the service, including but not limited to
              loss of data, unauthorized access to your account, or missed
              messages. Our total liability for any claim arising from your use
              of ScanLink shall not exceed the amount you paid to ScanLink in
              the twelve months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              11. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms of Service from time to time. When we
              make material changes, we will update the effective date at the
              top of this page. Continued use of ScanLink after changes are
              posted constitutes your acceptance of the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              12. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of the jurisdiction in which
              you reside or operate. Any disputes arising from these Terms or
              your use of ScanLink shall be resolved through good-faith
              negotiation or, if necessary, in a court of competent jurisdiction
              in your local area.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              13. Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, email us at{" "}
              <a
                href="mailto:legal@scanlink.app"
                className="text-primary hover:underline"
              >
                legal@scanlink.app
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
