import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Authorize "authorization/access-control";

module {
  // Types
  type MigrationProfile = {
    name : Text;
  };
  type VehicleId = Nat;
  type MessageId = Nat;
  type Vehicle = {
    id : VehicleId;
    owner : Principal;
    name : Text;
    description : Text;
    licensePlate : Text;
  };
  type OldCore = {
    vehicles : Map.Map<VehicleId, Vehicle>;
    messages : Map.Map<MessageId, OldMessage>;
    nextVehicleId : Nat;
    nextMessageId : Nat;
    accessControlState : Authorize.AccessControlState;
  };

  // Old message transformation
  type OldMessage = {
    id : MessageId;
    vehicleId : VehicleId;
    senderName : ?Text;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  // New message transformation
  type NewMessage = {
    id : MessageId;
    vehicleId : VehicleId;
    senderName : ?Text;
    sender : ?Principal;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  // New core transformation
  type NewCore = {
    vehicles : Map.Map<VehicleId, Vehicle>;
    messages : Map.Map<MessageId, NewMessage>;
    nextVehicleId : Nat;
    nextMessageId : Nat;
    userProfiles : Map.Map<Principal, MigrationProfile>;
    accessControlState : Authorize.AccessControlState;
  };

  // Migration function
  public func run(old : OldCore) : NewCore {
    {
      old with
      vehicles = old.vehicles;
      messages = old.messages.map<MessageId, OldMessage, NewMessage>(
        func(_k, v) {
          { v with sender = null };
        }
      );
      userProfiles = Map.empty<Principal, MigrationProfile>();
    };
  };
};
