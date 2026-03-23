import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    id: MessageId;
    isRead: boolean;
    message: string;
    timestamp: Time;
    senderName?: string;
    vehicleId: VehicleId;
}
export type VehicleId = bigint;
export type Time = bigint;
export interface Vehicle {
    id: VehicleId;
    licensePlate: string;
    owner: Principal;
    name: string;
    description: string;
}
export type MessageId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMessage(vehicleId: VehicleId, senderName: string | null, messageText: string): Promise<MessageId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getMessagesForVehicle(vehicleId: VehicleId): Promise<Array<Message>>;
    getMyVehicles(): Promise<Array<Vehicle>>;
    getUnreadMessages(): Promise<Array<Message>>;
    isCallerAdmin(): Promise<boolean>;
    markMessageAsRead(messageId: MessageId): Promise<void>;
    registerVehicle(name: string, description: string, licensePlate: string): Promise<VehicleId>;
}
