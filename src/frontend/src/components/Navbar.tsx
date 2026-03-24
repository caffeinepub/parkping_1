import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

interface NavbarProps {
  transparent?: boolean;
}

function ParkPingLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="parkping-logo-title"
    >
      <title id="parkping-logo-title">ParkPing logo</title>
      {/* Background rounded square */}
      <rect width="36" height="36" rx="10" fill="var(--primary, #2AAEA7)" />

      {/* 3 ping signal arcs radiating from top-right of car */}
      <path
        d="M22 9 A8 8 0 0 1 29 16"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M22 6 A11 11 0 0 1 32 16"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M22 3 A14 14 0 0 1 35 16"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Car body */}
      <path d="M7 22 L7 19 L10 15 L20 15 L23 19 L23 22 Z" fill="white" />
      {/* Car roof */}
      <path d="M11 15 L13 12 L19 12 L21 15" fill="white" />
      {/* Wheels */}
      <circle
        cx="11"
        cy="22.5"
        r="2"
        fill="var(--primary, #2AAEA7)"
        stroke="white"
        strokeWidth="1"
      />
      <circle
        cx="19"
        cy="22.5"
        r="2"
        fill="var(--primary, #2AAEA7)"
        stroke="white"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        transparent ? "bg-transparent" : "bg-white shadow-nav"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
          <ParkPingLogo />
          <span className="font-bold text-xl text-navy">ParkPing</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="/#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            data-ocid="nav.link"
          >
            How It Works
          </a>
          <a
            href="/#features"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            data-ocid="nav.link"
          >
            Features
          </a>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuth}
              className="border-primary text-primary hover:bg-primary hover:text-white"
              data-ocid="nav.button"
            >
              Sign Out
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="bg-primary text-white hover:bg-primary/90"
              data-ocid="nav.button"
            >
              {isLoggingIn ? "Signing in…" : "Get Started"}
            </Button>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-navy"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-4">
          <a
            href="/#how-it-works"
            className="text-sm font-medium text-muted-foreground"
            data-ocid="nav.link"
          >
            How It Works
          </a>
          <a
            href="/#features"
            className="text-sm font-medium text-muted-foreground"
            data-ocid="nav.link"
          >
            Features
          </a>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground"
              onClick={closeMobileMenu}
              data-ocid="nav.link"
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground"
              onClick={closeMobileMenu}
              data-ocid="nav.link"
            >
              Admin
            </Link>
          )}
          <Button
            onClick={() => {
              handleAuth();
              closeMobileMenu();
            }}
            disabled={isLoggingIn}
            className="bg-primary text-white w-full"
            data-ocid="nav.button"
          >
            {isAuthenticated
              ? "Sign Out"
              : isLoggingIn
                ? "Signing in…"
                : "Get Started"}
          </Button>
        </div>
      )}
    </header>
  );
}
