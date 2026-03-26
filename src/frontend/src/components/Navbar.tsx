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
          <img
            src="/assets/uploads/image-019d21e8-c67a-74dd-a137-fcd8265741f1-1.png"
            alt="Scanlink logo"
            className="h-10 w-auto"
          />
          <span className="font-bold text-xl text-navy">Scanlink</span>
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
