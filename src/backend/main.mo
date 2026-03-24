import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";


import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration with-clause

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type VehicleId = Nat;
  type MessageId = Nat;

  type UserProfile = {
    name : Text;
    email : Text;
  };

  type Vehicle = {
    id : VehicleId;
    owner : Principal;
    name : Text;
    description : Text;
    licensePlate : Text;
  };

  type Message = {
    id : MessageId;
    vehicleId : VehicleId;
    senderName : ?Text;
    sender : ?Principal;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  type MessageRequest = {
    vehicleId : VehicleId;
    senderName : ?Text;
    message : Text;
  };

  type StickerRequest = {
    id : Nat;
    vehicleId : VehicleId;
    owner : Principal;
    name : Text;
    addressLine1 : Text;
    addressLine2 : Text;
    city : Text;
    stateProvince : Text;
    postcode : Text;
    country : Text;
    status : Text;
    requestedAt : Time.Time;
    trackingNote : ?Text;
  };

  type StickerRequestInput = {
    vehicleId : VehicleId;
    name : Text;
    addressLine1 : Text;
    addressLine2 : Text;
    city : Text;
    stateProvince : Text;
    postcode : Text;
    country : Text;
  };

  type AdminStats = {
    totalUsers : Nat;
    totalVehicles : Nat;
    totalMessages : Nat;
    totalStickerRequests : Nat;
  };

  type UserSummary = {
    principal : Principal;
    name : ?Text;
    vehicleCount : Nat;
  };

  module Message {
    public func compare(m1 : Message, m2 : Message) : Order.Order {
      Nat.compare(m1.id, m2.id);
    };
  };

  module Vehicle {
    public func compare(v1 : Vehicle, v2 : Vehicle) : Order.Order {
      Nat.compare(v1.id, v2.id);
    };
  };

  module StickerRequest {
    public func compare(s1 : StickerRequest, s2 : StickerRequest) : Order.Order {
      Nat.compare(s1.id, s2.id);
    };
  };

  // State
  var nextVehicleId : Nat = 0;
  var nextMessageId : Nat = 0;
  var nextStickerRequestId : Nat = 0;

  let vehicles = Map.empty<VehicleId, Vehicle>();
  let messages = Map.empty<MessageId, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let stickerRequests = Map.empty<Nat, StickerRequest>();

  // Vehicle registration - users only
  public shared ({ caller }) func registerVehicle(name : Text, description : Text, licensePlate : Text) : async VehicleId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add vehicles");
    };
    let vehicleId = nextVehicleId;
    let vehicle : Vehicle = {
      id = vehicleId;
      owner = caller;
      name;
      description;
      licensePlate;
    };
    vehicles.add(vehicleId, vehicle);
    nextVehicleId += 1;
    vehicleId;
  };

  // Add message to vehicle (either anonymous or with sender)
  public shared ({ caller }) func addMessage(input : MessageRequest) : async MessageId {
    let vehicle = switch (vehicles.get(input.vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found!") };
      case (?vehicle) { vehicle };
    };
    let messageId = nextMessageId;
    let message : Message = {
      id = messageId;
      vehicleId = input.vehicleId;
      senderName = input.senderName;
      sender = if (caller.isAnonymous()) { null } else { ?caller };
      message = input.message;
      timestamp = Time.now();
      isRead = false;
    };
    messages.add(messageId, message);
    nextMessageId += 1;
    messageId;
  };

  // Delete vehicle - only owner or admin
  public shared ({ caller }) func deleteVehicle(vehicleId : VehicleId) : async () {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the vehicle owner or admin can delete this vehicle");
    };
    vehicles.remove(vehicleId);
  };

  // Delete message - only vehicle owner or admin
  public shared ({ caller }) func deleteMessage(messageId : MessageId) : async () {
    let message = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found!") };
      case (?message) { message };
    };
    let vehicle = switch (vehicles.get(message.vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the vehicle owner or admin can delete messages");
    };
    messages.remove(messageId);
  };

  // Get unread messages for owner across all vehicles
  public query ({ caller }) func getUnreadMessages() : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only the vehicle owner can see unread messages");
    };
    let myVehicleIds = vehicles.values().toArray().filter(func(v) { v.owner == caller }).sort().map(func(v) { v.id });
    messages.values().toArray().filter(
      func(m) {
        myVehicleIds.any(func(id) { id == m.vehicleId });
      }
    ).filter(
      func(m) {
        not m.isRead;
      }
    ).sort();
  };

  // Get all vehicles for owner
  public query ({ caller }) func getMyVehicles() : async [Vehicle] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a user to own vehicles");
    };
    vehicles.values().toArray().filter(func(v) { v.owner == caller }).sort();
  };

  // Get specific vehicle - only owner or admin
  public query ({ caller }) func getVehicle(vehicleId : VehicleId) : async ?Vehicle {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { return null };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the vehicle owner or admin can view this vehicle");
    };
    ?vehicle;
  };

  // Get all messages for vehicle - only owner or admin
  public query ({ caller }) func getAllMessagesForVehicle(vehicleId : VehicleId) : async [Message] {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the vehicle owner or admin can view messages");
    };
    messages.values().toArray().filter(func(m) { m.vehicleId == vehicleId }).sort();
  };

  // Get unread messages for vehicle - only owner or admin
  public query ({ caller }) func getUnreadMessagesForVehicle(vehicleId : VehicleId) : async [Message] {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the vehicle owner or admin can view unread messages");
    };
    messages.values().toArray().filter(
      func(m) {
        m.vehicleId == vehicleId and not m.isRead
      }
    ).sort();
  };

  // Mark message as read - only owner or admin
  public shared ({ caller }) func markMessageAsRead(messageId : MessageId) : async () {
    let message = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found!") };
      case (?message) { message };
    };
    let vehicle = switch (vehicles.get(message.vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the vehicle owner or admin can mark messages as read");
    };
    let updatedMessage : Message = {
      id = message.id;
      vehicleId = message.vehicleId;
      senderName = message.senderName;
      sender = message.sender;
      message = message.message;
      timestamp = message.timestamp;
      isRead = true;
    };
    messages.add(messageId, updatedMessage);
  };

  // Get unread messages for all vehicles for a specific user (owners) - only owner or admin
  public query ({ caller }) func getUnreadMessagesForOwner(owner : Principal) : async [Message] {
    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own unread messages");
    };
    let ownerVehicles = vehicles.values().toArray().filter(func(v) { v.owner == owner }).sort().map(func(v) { v.id });
    messages.values().toArray().filter(
      func(m) {
        ownerVehicles.any(func(vid) { vid == m.vehicleId });
      }
    ).filter(
      func(m) {
        not m.isRead;
      }
    ).sort();
  };

  // Get all vehicles for user - only that user or admin
  public query ({ caller }) func getAllVehiclesForUser(user : Principal) : async [Vehicle] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own vehicles");
    };
    vehicles.values().toArray().filter(func(v) { v.owner == user }).sort();
  };

  // Get all vehicles - admin only
  public query ({ caller }) func getAllVehicles() : async [Vehicle] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all vehicles");
    };
    vehicles.values().toArray().sort();
  };

  // Get admin stats
  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can access stats");
    };
    {
      totalUsers = userProfiles.size();
      totalVehicles = vehicles.size();
      totalMessages = messages.size();
      totalStickerRequests = stickerRequests.size();
    };
  };

  // Get all users for admin
  public query ({ caller }) func getAllUsers() : async [UserSummary] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can access user list");
    };
    let userProfilesIter = userProfiles.entries();
    let summariesIter = userProfilesIter.map(
      func((p, profile)) {
        let vehicleCount = vehicles.values().toArray().filter(func(v) { v.owner == p }).size();
        {
          principal = p;
          name = ?profile.name;
          vehicleCount;
        };
      }
    );
    summariesIter.toArray();
  };

  // Get all sticker requests - admin only
  public query ({ caller }) func getAllStickerRequests() : async [StickerRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all sticker requests");
    };
    stickerRequests.values().toArray().sort();
  };

  // Get caller user profile - requires user authentication
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Get specific user profile - only own profile or admin
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save user profile
  public shared ({ caller }) func saveCallerUserProfile(name : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile : UserProfile = {
      name;
      email;
    };
    userProfiles.add(caller, profile);
  };

  // Sticker request
  public shared ({ caller }) func requestSticker(input : StickerRequestInput) : async Nat {
    let determinedOwner = caller;
    if (not AccessControl.hasPermission(accessControlState, determinedOwner, #user)) {
      Runtime.trap("Unauthorized: Only vehicle owners can request stickers");
    };

    let vehicle = switch (vehicles.get(input.vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != determinedOwner) {
      Runtime.trap("Unauthorized: Only vehicle owner can request sticker");
    };
    let stickerRequestId = nextStickerRequestId;
    let stickerRequest : StickerRequest = {
      id = stickerRequestId;
      vehicleId = input.vehicleId;
      owner = determinedOwner;
      name = input.name;
      addressLine1 = input.addressLine1;
      addressLine2 = input.addressLine2;
      city = input.city;
      stateProvince = input.stateProvince;
      postcode = input.postcode;
      country = input.country;
      status = "pending";
      requestedAt = Time.now();
      trackingNote = null;
    };
    stickerRequests.add(stickerRequestId, stickerRequest);
    nextStickerRequestId += 1;
    stickerRequestId;
  };

  // Admin-only function to update sticker request status and tracking note
  public shared ({ caller }) func updateStickerStatus(stickerRequestId : Nat, newStatus : Text, trackingNote : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update sticker status");
    };
    switch (stickerRequests.get(stickerRequestId)) {
      case (null) { Runtime.trap("Sticker request not found") };
      case (?existingSticker) {
        let updatedSticker : StickerRequest = {
          id = existingSticker.id;
          vehicleId = existingSticker.vehicleId;
          owner = existingSticker.owner;
          name = existingSticker.name;
          addressLine1 = existingSticker.addressLine1;
          addressLine2 = existingSticker.addressLine2;
          city = existingSticker.city;
          stateProvince = existingSticker.stateProvince;
          postcode = existingSticker.postcode;
          country = existingSticker.country;
          status = newStatus;
          requestedAt = existingSticker.requestedAt;
          trackingNote;
        };
        stickerRequests.add(stickerRequestId, updatedSticker);
      };
    };
  };

  // Get all sticker requests for a user (all their vehicles as owner)
  public query ({ caller }) func getMyStickerRequests() : async [StickerRequest] {
    let user = caller;
    if (not AccessControl.hasPermission(accessControlState, user, #user)) {
      Runtime.trap("Unauthorized: Only vehicle owners can request stickers");
    };

    stickerRequests.values().toArray().filter(func(sr) { sr.owner == user }).sort();
  };
};

