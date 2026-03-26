import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminStats,
  Message,
  MessageId,
  PrintableQRCode,
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
    queryFn: async (): Promise<Vehicle[]> => {
      if (!actor) return [];
      return actor.getMyVehicles() as unknown as Promise<Vehicle[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVehicleCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Map<string, string>>({
    queryKey: ["vehicleCategories"],
    queryFn: async (): Promise<Map<string, string>> => {
      if (!actor) return new Map();
      const entries = await actor.getVehicleCategories();
      return new Map(entries.map(([id, cat]) => [id.toString(), cat]));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllVehicles() {
  const { actor, isFetching } = useActor();
  return useQuery<Vehicle[]>({
    queryKey: ["allVehicles"],
    queryFn: async (): Promise<Vehicle[]> => {
      if (!actor) return [];
      return actor.getAllVehicles() as unknown as Promise<Vehicle[]>;
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

export function useRegisterObject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      identifier,
      category,
    }: {
      name: string;
      description: string;
      identifier: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.registerObject(name, description, identifier, category);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myVehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicleCategories"] });
    },
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      vehicleId,
      senderName,
      messageText,
      locationLat,
      locationLng,
    }: {
      vehicleId: VehicleId;
      senderName: string | null;
      messageText: string;
      locationLat?: string | null;
      locationLng?: string | null;
    }) => {
      if (!actor) throw new Error("Not available");
      return actor.addMessage({
        vehicleId,
        senderName: senderName ?? undefined,
        message: messageText,
        locationLat: locationLat ?? null,
        locationLng: locationLng ?? null,
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

export function useDeleteMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: MessageId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteMessage(messageId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["unreadMessages"] });
    },
  });
}

export function useDeleteVehicle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.deleteVehicle(vehicleId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myVehicles"] });
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: StickerRequestInput) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.requestSticker(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myStickerRequests"] }),
  });
}

export function useGetMyStickerRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<StickerRequest[]>({
    queryKey: ["myStickerRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyStickerRequests();
    },
    enabled: !!actor && !isFetching,
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

export function useUpdateCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      stateProvince: string | null;
      postcode: string | null;
      country: string | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(data.name, data.email);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

// Generate batch of printable QR codes (admin)
export function useGeneratePrintableQRCodes() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quantity,
      prefix,
    }: { quantity: bigint; prefix: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.generatePrintableQRCodes(quantity, prefix);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPrintableQRCodes"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

// Get all printable QR codes (admin)
export function useGetAllPrintableQRCodes() {
  const { actor, isFetching } = useActor();
  return useQuery<PrintableQRCode[]>({
    queryKey: ["allPrintableQRCodes"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllPrintableQRCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

// Assign a printable QR code to a vehicle (user)
export function useAssignPrintableQRCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      uniqueIdentifier,
      vehicleId,
    }: { uniqueIdentifier: string; vehicleId: VehicleId }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.assignPrintableQRCode(uniqueIdentifier, vehicleId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPrintableQRCodes"] });
      qc.invalidateQueries({ queryKey: ["assignedQR"] });
    },
  });
}

// Revoke a printable QR code (admin)
export function useRevokePrintableQRCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.revokePrintableQRCode(id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["allPrintableQRCodes"] }),
  });
}

// Get assigned QR for a specific vehicle
export function useGetAssignedQRForVehicle(vehicleId: VehicleId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PrintableQRCode | null>({
    queryKey: ["assignedQR", vehicleId?.toString()],
    queryFn: async () => {
      if (!actor || vehicleId === null) return null;
      return actor.getAssignedQRForVehicle(vehicleId);
    },
    enabled: !!actor && !isFetching && vehicleId !== null,
  });
}

// Set contact info for an object (owner only)
export function useSetObjectContactInfo() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      vehicleId,
      contactName,
      contactPhone,
      contactPublic,
    }: {
      vehicleId: bigint;
      contactName: string | null;
      contactPhone: string | null;
      contactPublic: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.setObjectContactInfo(
        vehicleId,
        contactName,
        contactPhone,
        contactPublic,
      );
    },
  });
}

// Get contact info for an object (owner only)
export function useGetObjectContactInfo(vehicleId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["objectContactInfo", vehicleId?.toString()],
    queryFn: async () => {
      if (!actor || vehicleId === null) return null;
      const result = await actor.getObjectContactInfo(vehicleId);
      return result;
    },
    enabled: !!actor && !isFetching && vehicleId !== null,
  });
}

// Get message location (owner only)
export function useGetMessageLocation(messageId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messageLocation", messageId?.toString()],
    queryFn: async () => {
      if (!actor || messageId === null) return null;
      const result = await actor.getMessageLocation(messageId);
      return result;
    },
    enabled: !!actor && !isFetching && messageId !== null,
  });
}
