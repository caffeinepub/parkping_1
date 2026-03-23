import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type VehicleId = Nat;
  type MessageId = Nat;

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
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  module Vehicle {
    public func compare(v1 : Vehicle, v2 : Vehicle) : Order.Order {
      Nat.compare(v1.id, v2.id);
    };
  };

  var nextVehicleId : Nat = 0;
  var nextMessageId : Nat = 0;

  let vehicles = Map.empty<VehicleId, Vehicle>();
  let messages = Map.empty<MessageId, Message>();

  // Vehicle registration
  public shared ({ caller }) func registerVehicle(name : Text, description : Text, licensePlate : Text) : async VehicleId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can register vehicles");
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

  // Add message to vehicle
  public shared ({ caller }) func addMessage(vehicleId : VehicleId, senderName : ?Text, messageText : Text) : async MessageId {
    if (not vehicles.containsKey(vehicleId)) { Runtime.trap("Vehicle not found") };
    let messageId = nextMessageId;
    let message : Message = {
      id = messageId;
      vehicleId;
      senderName;
      message = messageText;
      timestamp = Time.now();
      isRead = false;
    };
    messages.add(messageId, message);
    nextMessageId += 1;
    messageId;
  };

  // Get vehicles for owner
  public query ({ caller }) func getMyVehicles() : async [Vehicle] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a user to own vehicles");
    };
    vehicles.values().toArray().filter(func(v) { v.owner == caller }).sort();
  };

  // Get messages for vehicle
  public query ({ caller }) func getMessagesForVehicle(vehicleId : VehicleId) : async [Message] {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?v) { v };
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or vehicle.owner == caller)) {
      Runtime.trap("Unauthorized: Only the vehicle owner or an admin can view messages");
    };
    messages.values().toArray().filter(func(m) { m.vehicleId == vehicleId });
  };

  // Mark message as read
  public shared ({ caller }) func markMessageAsRead(messageId : MessageId) : async () {
    let message = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?m) { m };
    };

    let vehicle = switch (vehicles.get(message.vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?v) { v };
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or vehicle.owner == caller)) {
      Runtime.trap("Unauthorized: Only the vehicle owner or an admin can mark messages as read");
    };

    let updatedMessage : Message = {
      id = message.id;
      vehicleId = message.vehicleId;
      senderName = message.senderName;
      message = message.message;
      timestamp = message.timestamp;
      isRead = true;
    };

    messages.add(messageId, updatedMessage);
  };

  // Get unread messages for owner
  public query ({ caller }) func getUnreadMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be a user to own messages");
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
    );
  };
};
