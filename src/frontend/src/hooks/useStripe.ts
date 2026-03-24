import { useMutation, useQuery } from "@tanstack/react-query";
import type { ShoppingItem } from "../backend.d";
import { useActor } from "./useActor";

export type CheckoutSession = {
  id: string;
  url: string;
};

// The Stripe methods are declared in backend.d.ts but may not yet be generated
// into the auto-generated backend.ts, so we cast for safe access.
type StripeActor = {
  createCheckoutSession(
    items: ShoppingItem[],
    successUrl: string,
    cancelUrl: string,
  ): Promise<string>;
  isStripeConfigured(): Promise<boolean>;
  setStripeConfiguration(
    secretKey: string,
    allowedCountries: string[],
  ): Promise<void>;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error("Actor not available");
      const stripeActor = actor as unknown as StripeActor;
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await stripeActor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error("Stripe session missing url");
      }
      return session;
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      const stripeActor = actor as unknown as StripeActor;
      return stripeActor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      secretKey,
      allowedCountries,
    }: {
      secretKey: string;
      allowedCountries: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      const stripeActor = actor as unknown as StripeActor;
      return stripeActor.setStripeConfiguration(secretKey, allowedCountries);
    },
  });
}
