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
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface MessageRequest {
    message: string;
    senderName?: string;
    vehicleId: VehicleId;
}
export interface PrintableQRCode {
    id: PrintableQRCodeId;
    status: string;
    assignedAt?: Time;
    generatedBy: Principal;
    createdAt: Time;
    uniqueIdentifier: string;
    assignedVehicleId?: VehicleId;
    qrData: string;
}
export interface Vehicle {
    id: VehicleId;
    licensePlate: string;
    owner: Principal;
    name: string;
    description: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type StickerRequestId = bigint;
export interface StickerRequest {
    id: StickerRequestId;
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
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type MessageId = bigint;
export interface UserSummary {
    principal: Principal;
    name?: string;
    vehicleCount: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
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
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type PrintableQRCodeId = bigint;
export interface UserProfileFull {
    postcode?: string;
    country?: string;
    city?: string;
    name: string;
    stateProvince?: string;
    email: string;
    addressLine1?: string;
    addressLine2?: string;
    phone?: string;
}
export interface AdminStats {
    totalVehicles: bigint;
    totalStickerRequests: bigint;
    totalPrintableQRCodes: bigint;
    totalMessages: bigint;
    totalUsers: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMessage(input: MessageRequest): Promise<MessageId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignPrintableQRCode(uniqueIdentifier: string, vehicleId: VehicleId): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteMessage(messageId: MessageId): Promise<void>;
    deleteVehicle(vehicleId: VehicleId): Promise<void>;
    generatePrintableQRCodes(quantity: bigint, prefix: string): Promise<Array<PrintableQRCode>>;
    getAdminStats(): Promise<AdminStats>;
    getAllMessagesForVehicle(vehicleId: VehicleId): Promise<Array<Message>>;
    getAllPrintableQRCodes(): Promise<Array<PrintableQRCode>>;
    getAllStickerRequests(): Promise<Array<StickerRequest>>;
    getAllUsers(): Promise<Array<UserSummary>>;
    getAllVehicles(): Promise<Array<Vehicle>>;
    getAllVehiclesForUser(user: Principal): Promise<Array<Vehicle>>;
    getAssignedQRForVehicle(vehicleId: VehicleId): Promise<PrintableQRCode | null>;
    getCallerUserProfile(): Promise<UserProfileFull | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyStickerRequests(): Promise<Array<StickerRequest>>;
    getMyVehicles(): Promise<Array<Vehicle>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUnreadMessages(): Promise<Array<Message>>;
    getUnreadMessagesForOwner(owner: Principal): Promise<Array<Message>>;
    getUnreadMessagesForVehicle(vehicleId: VehicleId): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfileFull | null>;
    getVehicle(vehicleId: VehicleId): Promise<Vehicle | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markMessageAsRead(messageId: MessageId): Promise<void>;
    registerVehicle(name: string, description: string, licensePlate: string): Promise<VehicleId>;
    requestSticker(input: StickerRequestInput): Promise<StickerRequestId>;
    revokePrintableQRCode(id: PrintableQRCodeId): Promise<void>;
    saveCallerUserProfile(name: string, email: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCallerUserProfile(name: string, email: string, phone: string | null, addressLine1: string | null, addressLine2: string | null, city: string | null, stateProvince: string | null, postcode: string | null, country: string | null): Promise<void>;
    updateStickerStatus(stickerRequestId: StickerRequestId, newStatus: string, trackingNote: string | null): Promise<void>;
}
