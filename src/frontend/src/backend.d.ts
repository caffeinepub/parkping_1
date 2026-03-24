import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type VehicleId = bigint;
export type Time = bigint;
export interface StickerRequest {
    id: bigint;
    status: string;
    trackingNote?: string;
    postcode: string;
    country: string;
    owner: Principal;
    city: string;
    name: string;
    stateProvince: string;
    addressLine1: string;
    addressLine2: string;
    requestedAt: Time;
    vehicleId: VehicleId;
}
export interface UserSummary {
    principal: Principal;
    name?: string;
    vehicleCount: bigint;
}
export type MessageId = bigint;
export interface StickerRequestInput {
    postcode: string;
    country: string;
    city: string;
    name: string;
    stateProvince: string;
    addressLine1: string;
    addressLine2: string;
    vehicleId: VehicleId;
}
export interface Message {
    id: MessageId;
    isRead: boolean;
    sender?: Principal;
    message: string;
    timestamp: Time;
    senderName?: string;
    vehicleId: VehicleId;
}
export interface MessageRequest {
    message: string;
    senderName?: string;
    vehicleId: VehicleId;
}
export interface AdminStats {
    totalVehicles: bigint;
    totalStickerRequests: bigint;
    totalMessages: bigint;
    totalUsers: bigint;
}
export interface Vehicle {
    id: VehicleId;
    licensePlate: string;
    owner: Principal;
    name: string;
    description: string;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMessage(input: MessageRequest): Promise<MessageId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMessage(messageId: MessageId): Promise<void>;
    deleteVehicle(vehicleId: VehicleId): Promise<void>;
    getAdminStats(): Promise<AdminStats>;
    getAllMessagesForVehicle(vehicleId: VehicleId): Promise<Array<Message>>;
    getAllStickerRequests(): Promise<Array<StickerRequest>>;
    getAllUsers(): Promise<Array<UserSummary>>;
    getAllVehicles(): Promise<Array<Vehicle>>;
    getAllVehiclesForUser(user: Principal): Promise<Array<Vehicle>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyStickerRequests(): Promise<Array<StickerRequest>>;
    getMyVehicles(): Promise<Array<Vehicle>>;
    getUnreadMessages(): Promise<Array<Message>>;
    getUnreadMessagesForOwner(owner: Principal): Promise<Array<Message>>;
    getUnreadMessagesForVehicle(vehicleId: VehicleId): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVehicle(vehicleId: VehicleId): Promise<Vehicle | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessageAsRead(messageId: MessageId): Promise<void>;
    registerVehicle(name: string, description: string, licensePlate: string): Promise<VehicleId>;
    requestSticker(input: StickerRequestInput): Promise<bigint>;
    saveCallerUserProfile(name: string, email: string): Promise<void>;
    updateStickerStatus(stickerRequestId: bigint, newStatus: string, trackingNote: string | null): Promise<void>;
}
