import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="text-4xl font-bold text-navy mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 24, 2026
        </p>

        <section className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              1. Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ParkPing is a decentralized application built on the Internet
              Computer Protocol (ICP). We are committed to protecting your
              privacy. This Privacy Policy explains what information we collect,
              how we use it, and your rights regarding your data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              2. Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Account information:</strong> Your name and email
                address, which you provide when setting up your profile.
              </li>
              <li>
                <strong>Vehicle information:</strong> License plate, vehicle
                name, and description that you register in the app.
              </li>
              <li>
                <strong>Messages:</strong> Text messages left by visitors who
                scan your vehicle's QR code.
              </li>
              <li>
                <strong>Internet Identity:</strong> We use your ICP Internet
                Identity principal as a unique identifier. No passwords are
                stored by ParkPing.
              </li>
              <li>
                <strong>Shipping address:</strong> If you request a physical QR
                sticker, we collect a mailing address solely for fulfillment
                purposes.
              </li>
              <li>
                <strong>Payment information:</strong> Payment details are
                processed securely by Stripe and are never stored on ParkPing
                systems.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>To operate and provide the ParkPing service.</li>
              <li>To deliver QR stickers to your shipping address.</li>
              <li>To process subscription payments via Stripe.</li>
              <li>
                To display messages left by vehicle passers-by to the vehicle
                owner.
              </li>
              <li>To improve the platform and troubleshoot issues.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              4. Data Storage &amp; Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All application data is stored on-chain on the Internet Computer
              Protocol — a decentralized, censorship-resistant cloud. Data is
              secured by advanced cryptography and distributed across
              independent node providers worldwide. We do not use centralized
              servers or databases.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              5. Message Sender Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              People who scan a vehicle's QR code and leave a message are not
              required to create an account or provide personal information.
              They may optionally provide a name with their message. No phone
              numbers or email addresses are collected from message senders.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              6. Third-Party Services
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Stripe:</strong> Used for payment processing. Subject to{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Stripe's Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Internet Identity:</strong> Authentication provided by
                DFINITY Foundation.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              7. Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You may update or delete your profile information at any time from
              your dashboard. To request full deletion of your account and
              associated data, please contact us at{" "}
              <a
                href="mailto:support@parkping.app"
                className="text-primary hover:underline"
              >
                support@parkping.app
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">
              8. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Continued use
              of ParkPing after changes are posted constitutes your acceptance
              of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy mb-3">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions, email us at{" "}
              <a
                href="mailto:support@parkping.app"
                className="text-primary hover:underline"
              >
                support@parkping.app
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
