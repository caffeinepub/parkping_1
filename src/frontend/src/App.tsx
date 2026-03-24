import { Toaster } from "@/components/ui/sonner";
import AdminPortal from "@/pages/AdminPortal";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/pages/LandingPage";
import PaymentFailure from "@/pages/PaymentFailure";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import PublicMessagePage from "@/pages/PublicMessagePage";
import TermsOfService from "@/pages/TermsOfService";
import VehicleMessages from "@/pages/VehicleMessages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});

const vehicleMessagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/vehicle/$id",
  component: VehicleMessages,
});

const publicMessageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/message/$vehicleId",
  component: PublicMessagePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPortal,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPolicy,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsOfService,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  dashboardRoute,
  vehicleMessagesRoute,
  publicMessageRoute,
  adminRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  privacyRoute,
  termsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
