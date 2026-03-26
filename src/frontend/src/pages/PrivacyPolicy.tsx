import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="text-4xl font-bold text-navy mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Effective date: March 2026
        </p>

        <section className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              1. Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ScanLink (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a
              decentralized application built on the Internet Computer Protocol
              (ICP). We are committed to protecting your privacy. This Privacy
              Policy describes what data we collect, how it is stored, how it is
              used, and your rights as a user. By using ScanLink, you agree to
              the practices described in this policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              2. Data We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect only the data necessary to operate the ScanLink
              service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Account information:</strong> Your name and email
                address, provided when setting up your profile.
              </li>
              <li>
                <strong>Optional contact details:</strong> Phone number and
                mailing address, if you choose to provide them. Your phone
                number is only visible to message senders if you explicitly
                enable &quot;Make contact info public&quot; on a Digital
                Identity.
              </li>
              <li>
                <strong>Object information:</strong> Name, category,
                description, license plate or serial number, and any custom
                fields you enter for each Digital Identity.
              </li>
              <li>
                <strong>Messages:</strong> Text messages left by visitors who
                scan your object&apos;s QR code. Senders are not required to
                create an account or provide personal information.
              </li>
              <li>
                <strong>Scan location:</strong> If a message sender chooses to
                share their location, the GPS coordinates are attached to their
                message. Location sharing is always optional and requires
                explicit consent from the sender.
              </li>
              <li>
                <strong>Shipping address:</strong> If you request a physical QR
                sticker, we collect a mailing address solely for fulfillment
                purposes.
              </li>
              <li>
                <strong>Internet Identity principal:</strong> Used as your
                unique account identifier. No passwords are stored by ScanLink.
              </li>
              <li>
                <strong>Payment information:</strong> Payment details are
                processed entirely by Stripe and are never stored on ScanLink
                systems.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              3. How Your Data Is Stored
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All application data is stored on-chain on the Internet Computer
              Protocol — a decentralized, censorship-resistant blockchain
              network. Data is secured by advanced cryptography and distributed
              across independent node providers worldwide. ScanLink does not
              operate any centralized servers or databases. Your data is not
              stored in traditional cloud services such as AWS, Google Cloud, or
              Azure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              4. How We Use Your Data
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                To create and manage your Digital Identity profiles and QR
                codes.
              </li>
              <li>
                To deliver messages from QR code scanners to the registered
                object owner.
              </li>
              <li>
                To display optional public contact information to message
                senders, when you have opted in.
              </li>
              <li>To ship physical QR stickers to your mailing address.</li>
              <li>
                To process subscription and sticker order payments via Stripe.
              </li>
              <li>
                To improve platform reliability and troubleshoot technical
                issues.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              5. Data Sharing &amp; Third Parties
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>
                We never sell your personal data to third parties.
              </strong>{" "}
              We share data only in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Stripe:</strong> Payment processing. Your payment data
                is governed by{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Stripe&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>DFINITY / Internet Identity:</strong> Authentication is
                provided by the DFINITY Foundation&apos;s Internet Identity
                service.
              </li>
              <li>
                <strong>Public contact info:</strong> If you choose to make your
                phone number or name public on a Digital Identity, that
                information is displayed to anyone who scans the associated QR
                code. You can disable this at any time from your dashboard.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              6. Message Sender Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Message senders do not need to create an account, provide an email
              address, or share a phone number. They may optionally provide a
              display name and share their GPS location with their message.
              ScanLink does not collect IP addresses, device identifiers, or
              tracking cookies from message senders.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              7. Contact Info Visibility
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By default, your phone number and name are kept private. If you
              choose to make this information public on a specific Digital
              Identity, it will be displayed to anyone who scans that
              object&apos;s QR code. You can toggle visibility at any time from
              the Digital Identity settings in your dashboard. ScanLink does not
              reveal your direct contact details unless you explicitly opt in.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              8. Deleting Your Data
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You may delete any Digital Identity at any time from your
              dashboard. Deleting a Digital Identity permanently removes the
              associated QR code and all linked messages — this action cannot be
              undone. To request full deletion of your account and all
              associated data, contact us at{" "}
              <a
                href="mailto:privacy@scanlink.app"
                className="text-primary hover:underline"
              >
                privacy@scanlink.app
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              9. GDPR &amp; CCPA Compliance
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you are located in the European Economic Area (EEA) or
              California, you have additional rights under GDPR and CCPA
              respectively:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Right to access:</strong> You may request a copy of the
                personal data we hold about you.
              </li>
              <li>
                <strong>Right to rectification:</strong> You may correct
                inaccurate data from your dashboard at any time.
              </li>
              <li>
                <strong>Right to erasure:</strong> You may request deletion of
                your personal data.
              </li>
              <li>
                <strong>Right to opt out:</strong> California residents may opt
                out of any sale of personal data. We do not sell personal data.
              </li>
              <li>
                <strong>Right to data portability:</strong> You may request your
                data in a portable format.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise any of these rights, contact{" "}
              <a
                href="mailto:privacy@scanlink.app"
                className="text-primary hover:underline"
              >
                privacy@scanlink.app
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              10. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. When we make
              material changes, we will update the effective date at the top of
              this page. Continued use of ScanLink after changes are posted
              constitutes your acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              11. Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions or requests, email us at{" "}
              <a
                href="mailto:privacy@scanlink.app"
                className="text-primary hover:underline"
              >
                privacy@scanlink.app
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
