import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-footer text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/generated/scanlink-logo-transparent.dim_120x120.png"
                alt="ScanLink"
                className="h-12 w-auto brightness-0 invert"
              />
              <span className="font-bold text-xl">ScanLink</span>
            </div>
            <p className="text-sm text-white/60 max-w-xs leading-relaxed">
              Give anything a Digital Identity. Scan any QR code → instantly
              message the owner. Works for vehicles, bikes, pets, luggage, and
              more.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a
                  href="/#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/#features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-white transition-colors"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center text-xs text-white/40">
            <span>
              © {year} ScanLink. All rights reserved. Powered by Internet
              Computer Protocol (ICP) - Decentralized Blockchain.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
