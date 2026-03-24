import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  // Old Types
  type OldActor = {
    vehicles : Map.Map<Nat, {
      id : Nat;
      owner : Principal;
      name : Text;
      description : Text;
      licensePlate : Text;
    }>;
    messages : Map.Map<Nat, {
      id : Nat;
      vehicleId : Nat;
      senderName : ?Text;
      sender : ?Principal;
      message : Text;
      timestamp : Time.Time;
      isRead : Bool;
    }>;
    userProfiles : Map.Map<Principal, {
      name : Text;
      email : Text;
    }>;
    stickerRequests : Map.Map<Nat, {
      id : Nat;
      vehicleId : Nat;
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
    }>;
    nextVehicleId : Nat;
    nextMessageId : Nat;
    nextStickerRequestId : Nat;
  };

  // New Types
  type NewActor = OldActor and {
    qrPrintRequests : Map.Map<Nat, {
      id : Nat;
      vehicleId : Nat;
      owner : Principal;
      isReplacement : Bool;
      status : Text;
      requestedAt : Time.Time;
      completedAt : ?Time.Time;
    }>;
    freeQrPrintUsed : Map.Map<Nat, Bool>;
    nextQrRequestId : Nat;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    {
      qrPrintRequests = Map.empty<Nat, {
        id : Nat;
        vehicleId : Nat;
        owner : Principal;
        isReplacement : Bool;
        status : Text;
        requestedAt : Time.Time;
        completedAt : ?Time.Time;
      }>();
      freeQrPrintUsed = Map.empty<Nat, Bool>();
      nextQrRequestId = 0;
      vehicles = old.vehicles;
      messages = old.messages;
      userProfiles = old.userProfiles;
      stickerRequests = old.stickerRequests;
      nextVehicleId = old.nextVehicleId;
      nextMessageId = old.nextMessageId;
      nextStickerRequestId = old.nextStickerRequestId;
    };
  };
};
