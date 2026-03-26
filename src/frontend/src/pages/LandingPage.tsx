import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  BellRing,
  CheckCircle2,
  MessageSquare,
  QrCode,
  Shield,
  SmartphoneNfc,
  Tag,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const steps = [
  {
    number: "01",
    icon: Tag,
    title: "Create a Digital ID",
    description:
      "Sign in and register any object — vehicle, bike, pet, luggage, keys, or anything else. Each gets a unique QR code.",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Place Your QR Sticker",
    description:
      "Print your QR code or get a weatherproof sticker. Attach it to your object — windshield, collar, bag handle, laptop lid, anywhere.",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Get Messages Instantly",
    description:
      "Anyone who scans your QR can message you — no account, no app download required.",
  },
];

const features = [
  {
    icon: SmartphoneNfc,
    title: "No App Required",
    description:
      "People just scan the QR code with their phone camera. No downloads, no account needed to leave a message.",
  },
  {
    icon: Shield,
    title: "Anonymous & Secure",
    description:
      "Your phone number and email stay private. Messages are stored on decentralized ICP infrastructure.",
  },
  {
    icon: BellRing,
    title: "Instant Notifications",
    description:
      "Check your dashboard for new messages anytime. Real-time updates keep you in the loop.",
  },
  {
    icon: CheckCircle2,
    title: "Works for Anything",
    description:
      "Vehicles, bikes, pets, luggage, electronics, keys — if it can hold a sticker, it gets a Digital Identity.",
  },
];

const scenarios = [
  {
    emoji: "🚗",
    text: "Stuck behind a car? Scan the code and message the owner.",
  },
  {
    emoji: "🚲",
    text: "Lost your bike? Someone scanned it and messaged you.",
  },
  {
    emoji: "🐕",
    text: "Your dog got out? The tag just got scanned.",
  },
  {
    emoji: "📦",
    text: "One app. Any object. Instant owner contact.",
  },
];

export default function LandingPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section
        className="pt-28 pb-20 px-4 sm:px-6 overflow-hidden"
        data-ocid="hero.section"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-teal-light text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <QrCode className="w-4 h-4" />
                Powered by Internet Computer Protocol (ICP) - Decentralized
                Blockchain
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-navy leading-tight mb-6">
                Give anything a
                <br />
                <span className="text-primary">Digital Identity.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-lg">
                Scan an QR → message the owner instantly. No app. No phone
                number. No friction.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Lost bike? Found pet? Blocking car? Just scan the code on the
                object and send a message. ScanLink gives every physical thing a
                digital voice.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="bg-primary text-white hover:bg-primary/90 px-8 rounded-full font-semibold"
                      data-ocid="hero.primary_button"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    onClick={login}
                    disabled={isLoggingIn}
                    className="bg-primary text-white hover:bg-primary/90 px-8 rounded-full font-semibold"
                    data-ocid="hero.primary_button"
                  >
                    {isLoggingIn
                      ? "Signing in…"
                      : "Create Your First Digital ID"}
                  </Button>
                )}
                <a href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 rounded-full border-primary text-primary hover:bg-primary/5 font-semibold"
                    data-ocid="hero.secondary_button"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Right column — illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                {/* Background mint blob */}
                <div className="absolute inset-0 -z-10 bg-teal-light rounded-[3rem] opacity-60 scale-110" />
                <img
                  src="/assets/uploads/image-019d1fed-ee1d-770d-9936-19fbb9f174b8-1.png"
                  alt="Object with QR sticker and person scanning with phone"
                  className="w-full max-w-md rounded-3xl shadow-card"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-5 py-2 shadow-card text-sm font-semibold text-navy whitespace-nowrap">
                  📱 Scan &amp; Message, No Account Needed
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary/8 border-y border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "100%", label: "On-Chain" },
              { value: "0", label: "App Downloads Required" },
              { value: "🔒", label: "Secured by Advanced Cryptography" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6"
        data-ocid="how_it_works.section"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-navy mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Three simple steps to give any physical object a Digital Identity.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-white rounded-2xl p-8 shadow-card border border-border relative overflow-hidden group"
              >
                <div className="absolute top-4 right-4 text-5xl font-black text-primary/8">
                  {step.number}
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-light flex items-center justify-center mb-5">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-16 px-4 sm:px-6 bg-teal-light/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-navy mb-3">
              Works for every situation
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From parking disputes to lost pets — ScanLink handles it all.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarios.map((s, i) => (
              <motion.div
                key={s.text}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 shadow-card border border-border"
              >
                <div className="text-3xl mb-3">{s.emoji}</div>
                <p className="text-sm text-navy font-medium leading-relaxed">
                  {s.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 bg-navy"
        data-ocid="features.section"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why ScanLink?
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Private. Simple. Works for everything.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 flex gap-5 hover:bg-white/8 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-4 sm:px-6 text-center"
        data-ocid="cta.section"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-12 shadow-card">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to give your stuff a Digital Identity?
            </h2>
            <p className="text-white/80 mb-8">
              Join ScanLink — it&apos;s free to start.
            </p>
            <Button
              size="lg"
              onClick={isAuthenticated ? undefined : login}
              asChild={isAuthenticated}
              disabled={isLoggingIn}
              className="bg-white text-primary hover:bg-white/90 px-10 rounded-full font-bold text-base shadow-lg"
              data-ocid="cta.primary_button"
            >
              {isAuthenticated ? (
                <Link to="/dashboard">Open Dashboard</Link>
              ) : (
                <span>
                  {isLoggingIn ? "Signing in…" : "Get Your Free Digital ID"}
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
