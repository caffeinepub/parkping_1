import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type MessageId = Nat;

  type Vehicle = {
    id : Nat;
    owner : Principal.Principal;
    name : Text;
    description : Text;
    licensePlate : Text;
  };

  type Message = {
    id : MessageId;
    vehicleId : Nat;
    senderName : ?Text;
    sender : ?Principal.Principal;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  type UserProfile = {
    name : Text;
    email : Text;
  };

  type OldStickerRequest = {
    id : Nat;
    vehicleId : Nat;
    owner : Principal.Principal;
    name : Text;
    addressLine1 : Text;
    addressLine2 : Text;
    city : Text;
    stateProvince : Text;
    postcode : Text;
    country : Text;
    status : Text;
    requestedAt : Time.Time;
  };

  type OldActor = {
    vehicles : Map.Map<Nat, Vehicle>;
    messages : Map.Map<MessageId, Message>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    stickerRequests : Map.Map<Nat, OldStickerRequest>;
  };

  type NewStickerRequest = {
    id : Nat;
    vehicleId : Nat;
    owner : Principal.Principal;
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

  type NewActor = {
    vehicles : Map.Map<Nat, Vehicle>;
    messages : Map.Map<MessageId, Message>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    stickerRequests : Map.Map<Nat, NewStickerRequest>;
  };

  public func run(old : OldActor) : NewActor {
    let updatedStickerRequests = old.stickerRequests.map<Nat, OldStickerRequest, NewStickerRequest>(
      func(_id, oldSticker) {
        {
          id = oldSticker.id;
          vehicleId = oldSticker.vehicleId;
          owner = oldSticker.owner;
          name = oldSticker.name;
          addressLine1 = oldSticker.addressLine1;
          addressLine2 = oldSticker.addressLine2;
          city = oldSticker.city;
          stateProvince = oldSticker.stateProvince;
          postcode = oldSticker.postcode;
          country = oldSticker.country;
          status = oldSticker.status;
          requestedAt = oldSticker.requestedAt;
          trackingNote = null;
        };
      }
    );
    { old with stickerRequests = updatedStickerRequests : Map.Map<Nat, NewStickerRequest> };
  };
};
