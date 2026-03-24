import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentFailure() {
  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="payment_failure.page"
    >
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-10 h-10 text-destructive" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-navy mb-3"
          >
            Payment cancelled
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mb-8"
          >
            No charge was made. You can retry from your dashboard at any time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/dashboard">
              <Button
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 w-full sm:w-auto"
                data-ocid="payment_failure.primary_button"
              >
                Try Again
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant="outline"
                className="rounded-full px-8 w-full sm:w-auto"
                data-ocid="payment_failure.secondary_button"
              >
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
