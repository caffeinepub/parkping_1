import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminStats,
  Message,
  MessageId,
  StickerRequest,
  StickerRequestInput,
  UserSummary,
  Vehicle,
  VehicleId,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetMyVehicles() {
  const { actor, isFetching } = useActor();
  return useQuery<Vehicle[]>({
    queryKey: ["myVehicles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyVehicles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMessagesForVehicle(vehicleId: VehicleId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages", vehicleId?.toString()],
    queryFn: async () => {
      if (!actor || vehicleId === null) return [];
      return actor.getAllMessagesForVehicle(vehicleId);
    },
    enabled: !!actor && !isFetching && vehicleId !== null,
    refetchInterval: 15000,
  });
}

export function useGetUnreadMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnreadMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useRegisterVehicle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      licensePlate,
    }: {
      name: string;
      description: string;
      licensePlate: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.registerVehicle(name, description, licensePlate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myVehicles"] }),
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      vehicleId,
      senderName,
      messageText,
    }: {
      vehicleId: VehicleId;
      senderName: string | null;
      messageText: string;
    }) => {
      if (!actor) throw new Error("Not available");
      return actor.addMessage({
        vehicleId,
        senderName: senderName ?? undefined,
        message: messageText,
      });
    },
  });
}

export function useMarkMessageAsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: MessageId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.markMessageAsRead(messageId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["unreadMessages"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserSummary[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestSticker() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (input: StickerRequestInput) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.requestSticker(input);
    },
  });
}

export function useGetAllStickerRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<StickerRequest[]>({
    queryKey: ["allStickerRequests"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllStickerRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateStickerStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      trackingNote,
    }: {
      id: bigint;
      status: string;
      trackingNote: string | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateStickerStatus(id, status, trackingNote);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allStickerRequests"] }),
  });
}
