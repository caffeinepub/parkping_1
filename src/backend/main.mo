import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  // Stable backup for authorization state
  stable var authAdminAssigned : Bool = false;
  stable var authUserRolesEntries : [(Principal, AccessControl.UserRole)] = [];

  // Authorization — restored from stable arrays on upgrade
  let accessControlState : AccessControl.AccessControlState = {
    var adminAssigned = authAdminAssigned;
    userRoles = Map.fromArray<Principal, AccessControl.UserRole>(authUserRolesEntries);
  };
  include MixinAuthorization(accessControlState);

  // Types
  type VehicleId = Nat;
  type MessageId = Nat;
  type StickerRequestId = Nat;
  type PrintableQRCodeId = Nat;

  type UserProfile = {
    name : Text;
    email : Text;
  };

  type UserProfileDetails = {
    phone : ?Text;
    addressLine1 : ?Text;
    addressLine2 : ?Text;
    city : ?Text;
    stateProvince : ?Text;
    postcode : ?Text;
    country : ?Text;
  };

  type UserProfileFull = {
    name : Text;
    email : Text;
    phone : ?Text;
    addressLine1 : ?Text;
    addressLine2 : ?Text;
    city : ?Text;
    stateProvince : ?Text;
    postcode : ?Text;
    country : ?Text;
  };

  // Vehicle represents any physical object
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
    locationLat : ?Text;
    locationLng : ?Text;
  };

  type MessageLocation = {
    lat : Text;
    lng : Text;
  };

  type VehicleContactInfo = {
    contactName : ?Text;
    contactPhone : ?Text;
    contactPublic : Bool;
  };

  type ObjectPublicInfo = {
    name : Text;
    category : Text;
    contactName : ?Text;
    contactPhone : ?Text;
  };

  type StickerRequest = {
    id : StickerRequestId;
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
    totalPrintableQRCodes : Nat;
  };

  type UserSummary = {
    principal : Principal;
    name : ?Text;
    vehicleCount : Nat;
  };

  type PrintableQRCode = {
    id : PrintableQRCodeId;
    uniqueIdentifier : Text;
    qrData : Text;
    status : Text;
    assignedVehicleId : ?VehicleId;
    assignedAt : ?Time.Time;
    generatedBy : Principal;
    createdAt : Time.Time;
  };

  type PrintableQRCodeInput = {
    prefix : Text;
    quantity : Nat;
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

  module PrintableQRCode {
    public func compare(q1 : PrintableQRCode, q2 : PrintableQRCode) : Order.Order {
      Nat.compare(q1.id, q2.id);
    };
  };

  // Counters and config
  stable var nextVehicleId : Nat = 0;
  stable var nextMessageId : Nat = 0;
  stable var nextStickerRequestId : Nat = 0;
  stable var nextPrintableQRCodeId : Nat = 0;
  stable var stripeSecretKey : Text = "";
  stable var stripeAllowedCountries : [Text] = ["US", "CA", "GB", "AU"];

  // Stable backup arrays for data maps
  stable var vehiclesEntries : [(VehicleId, Vehicle)] = [];
  stable var messagesEntries : [(MessageId, Message)] = [];
  stable var userProfilesEntries : [(Principal, UserProfile)] = [];
  stable var stickerRequestsEntries : [(StickerRequestId, StickerRequest)] = [];
  stable var userProfileDetailsEntries : [(Principal, UserProfileDetails)] = [];
  stable var printableQRCodesEntries : [(PrintableQRCodeId, PrintableQRCode)] = [];
  stable var vehicleCategoriesEntries : [(VehicleId, Text)] = [];
  stable var vehicleContactInfoEntries : [(VehicleId, VehicleContactInfo)] = [];
  stable var messageLocationsEntries : [(MessageId, MessageLocation)] = [];

  // In-memory maps
  let vehicles = Map.fromArray<VehicleId, Vehicle>(vehiclesEntries);
  let messages = Map.fromArray<MessageId, Message>(messagesEntries);
  let userProfiles = Map.fromArray<Principal, UserProfile>(userProfilesEntries);
  let stickerRequests = Map.fromArray<StickerRequestId, StickerRequest>(stickerRequestsEntries);
  let userProfileDetails = Map.fromArray<Principal, UserProfileDetails>(userProfileDetailsEntries);
  let printableQRCodes = Map.fromArray<PrintableQRCodeId, PrintableQRCode>(printableQRCodesEntries);
  let vehicleCategories = Map.fromArray<VehicleId, Text>(vehicleCategoriesEntries);
  let vehicleContactInfoMap = Map.fromArray<VehicleId, VehicleContactInfo>(vehicleContactInfoEntries);
  let messageLocationsMap = Map.fromArray<MessageId, MessageLocation>(messageLocationsEntries);

  // HTTP transform for Stripe outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Stripe configuration
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can configure Stripe");
    };
    stripeSecretKey := config.secretKey;
    stripeAllowedCountries := config.allowedCountries;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeSecretKey != "";
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    {
      secretKey = stripeSecretKey;
      allowedCountries = stripeAllowedCountries;
    };
  };

  // Create Stripe checkout session
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (stripeSecretKey == "") {
      Runtime.trap("Stripe is not configured");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Stripe payment status
  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  // Register any object (vehicle, pet, bike, luggage, etc.)
  public shared ({ caller }) func registerVehicle(name : Text, description : Text, licensePlate : Text) : async VehicleId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can register objects");
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
    vehicleCategories.add(vehicleId, "Vehicle");
    nextVehicleId += 1;
    vehicleId;
  };

  // Register object with category
  public shared ({ caller }) func registerObject(name : Text, description : Text, identifier : Text, category : Text) : async VehicleId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can register objects");
    };
    // Enforce 10 Digital IDs per user account limit
    let existingCount = vehicles.values().toArray().filter(func(v : Vehicle) : Bool { v.owner == caller }).size();
    if (existingCount >= 10) {
      Runtime.trap("Limit reached: Your subscription allows up to 10 Digital IDs. Please contact support to upgrade.");
    };
    let vehicleId = nextVehicleId;
    let vehicle : Vehicle = {
      id = vehicleId;
      owner = caller;
      name;
      description;
      licensePlate = identifier;
    };
    vehicles.add(vehicleId, vehicle);
    vehicleCategories.add(vehicleId, category);
    nextVehicleId += 1;
    vehicleId;
  };

  // Set or update contact info for an object
  public shared ({ caller }) func setObjectContactInfo(
    vehicleId : VehicleId,
    contactName : ?Text,
    contactPhone : ?Text,
    contactPublic : Bool
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?v) { v };
    };
    if (vehicle.owner != caller) {
      Runtime.trap("Unauthorized: Only the owner can update contact info");
    };
    vehicleContactInfoMap.add(vehicleId, { contactName; contactPhone; contactPublic });
  };

  // Public info for the message page (no auth required)
  public query func getObjectPublicInfo(vehicleId : VehicleId) : async ?ObjectPublicInfo {
    switch (vehicles.get(vehicleId)) {
      case (null) { null };
      case (?vehicle) {
        let category = switch (vehicleCategories.get(vehicleId)) {
          case (null) { "Object" };
          case (?c) { c };
        };
        let contactInfo = vehicleContactInfoMap.get(vehicleId);
        let (contactName, contactPhone) = switch (contactInfo) {
          case (null) { (null, null) };
          case (?info) {
            if (info.contactPublic) { (info.contactName, info.contactPhone) }
            else { (null, null) }
          };
        };
        ?{ name = vehicle.name; category; contactName; contactPhone };
      };
    };
  };

  // Get contact info for an object (owner only)
  public query ({ caller }) func getObjectContactInfo(vehicleId : VehicleId) : async ?VehicleContactInfo {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?v) { v };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    vehicleContactInfoMap.get(vehicleId);
  };

  // Add message to object
  public shared ({ caller }) func addMessage(input : MessageRequest) : async MessageId {
    let vehicle = switch (vehicles.get(input.vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
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
    // Store location if provided
    switch (input.locationLat, input.locationLng) {
      case (?lat, ?lng) {
        messageLocationsMap.add(messageId, { lat; lng });
      };
      case _ {};
    };
    nextMessageId += 1;
    messageId;
  };

  // Get location for a message (owner only)
  public query ({ caller }) func getMessageLocation(messageId : MessageId) : async ?MessageLocation {
    let message = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found!") };
      case (?m) { m };
    };
    let vehicle = switch (vehicles.get(message.vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?v) { v };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    messageLocationsMap.get(messageId);
  };

  // Delete object
  public shared ({ caller }) func deleteVehicle(vehicleId : VehicleId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to delete own object");
    };
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or admin can delete this object");
    };
    vehicles.remove(vehicleId);
  };

  // Delete message
  public shared ({ caller }) func deleteMessage(messageId : MessageId) : async () {
    let message = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found!") };
      case (?message) { message };
    };
    let vehicle = switch (vehicles.get(message.vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or admin can delete messages");
    };
    messages.remove(messageId);
  };

  // Get unread messages for owner
  public query ({ caller }) func getUnreadMessages() : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only the owner can see unread messages");
    };
    let myVehicleIds = vehicles.values().toArray().filter(func(v) { v.owner == caller }).sort().map(func(v) { v.id });
    messages.values().toArray().filter(
      func(m) { myVehicleIds.any(func(id) { id == m.vehicleId }) }
    ).filter(func(m) { not m.isRead }).sort();
  };

  // Get all objects for owner
  public query ({ caller }) func getMyVehicles() : async [Vehicle] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a user to own objects");
    };
    vehicles.values().toArray().filter(func(v) { v.owner == caller }).sort();
  };

  // Get specific object
  public query ({ caller }) func getVehicle(vehicleId : VehicleId) : async ?Vehicle {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { return null };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or admin can view this object");
    };
    ?vehicle;
  };

  // Get all messages for object
  public query ({ caller }) func getAllMessagesForVehicle(vehicleId : VehicleId) : async [Message] {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or admin can view messages");
    };
    messages.values().toArray().filter(func(m) { m.vehicleId == vehicleId }).sort();
  };

  // Get unread messages for object
  public query ({ caller }) func getUnreadMessagesForVehicle(vehicleId : VehicleId) : async [Message] {
    let vehicle = switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or admin can view unread messages");
    };
    messages.values().toArray().filter(
      func(m) { m.vehicleId == vehicleId and not m.isRead }
    ).sort();
  };

  // Mark message as read
  public shared ({ caller }) func markMessageAsRead(messageId : MessageId) : async () {
    let message = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found!") };
      case (?message) { message };
    };
    let vehicle = switch (vehicles.get(message.vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or admin can mark messages as read");
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

  // Get unread messages for owner (by principal)
  public query ({ caller }) func getUnreadMessagesForOwner(owner : Principal) : async [Message] {
    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own unread messages");
    };
    let ownerVehicles = vehicles.values().toArray().filter(func(v) { v.owner == owner }).sort().map(func(v) { v.id });
    messages.values().toArray().filter(
      func(m) { ownerVehicles.any(func(vid) { vid == m.vehicleId }) }
    ).filter(func(m) { not m.isRead }).sort();
  };

  // Get all objects for user
  public query ({ caller }) func getAllVehiclesForUser(user : Principal) : async [Vehicle] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own objects");
    };
    vehicles.values().toArray().filter(func(v) { v.owner == user }).sort();
  };

  // Get all objects - admin only
  public query ({ caller }) func getAllVehicles() : async [Vehicle] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all objects");
    };
    vehicles.values().toArray().sort();
  };

  // Get categories for caller's objects
  public query ({ caller }) func getVehicleCategories() : async [(VehicleId, Text)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access object categories");
    };
    let myIds = vehicles.values().toArray().filter(func(v) { v.owner == caller }).map(func(v) { v.id });
    vehicleCategories.entries().toArray().filter(func((id, _)) { myIds.any(func(vid) { vid == id }) });
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
      totalPrintableQRCodes = printableQRCodes.size();
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
        { principal = p; name = ?profile.name; vehicleCount };
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

  // Helper to build full profile
  func buildFullProfile(base : UserProfile, details : ?UserProfileDetails) : UserProfileFull {
    switch (details) {
      case (null) {
        { name = base.name; email = base.email;
          phone = null; addressLine1 = null; addressLine2 = null;
          city = null; stateProvince = null; postcode = null; country = null };
      };
      case (?d) {
        { name = base.name; email = base.email;
          phone = d.phone; addressLine1 = d.addressLine1; addressLine2 = d.addressLine2;
          city = d.city; stateProvince = d.stateProvince; postcode = d.postcode; country = d.country };
      };
    };
  };

  // Get caller user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfileFull {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?base) { ?buildFullProfile(base, userProfileDetails.get(caller)) };
    };
  };

  // Get specific user profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfileFull {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?base) { ?buildFullProfile(base, userProfileDetails.get(user)) };
    };
  };

  // Save basic profile
  public shared ({ caller }) func saveCallerUserProfile(name : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, { name; email });
  };

  // Update full profile
  public shared ({ caller }) func updateCallerUserProfile(
    name : Text,
    email : Text,
    phone : ?Text,
    addressLine1 : ?Text,
    addressLine2 : ?Text,
    city : ?Text,
    stateProvince : ?Text,
    postcode : ?Text,
    country : ?Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, { name; email });
    userProfileDetails.add(caller, { phone; addressLine1; addressLine2; city; stateProvince; postcode; country });
  };

  // Sticker request
  public shared ({ caller }) func requestSticker(input : StickerRequestInput) : async StickerRequestId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only owners can request stickers");
    };
    let vehicle = switch (vehicles.get(input.vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?vehicle) { vehicle };
    };
    if (vehicle.owner != caller) {
      Runtime.trap("Unauthorized: Only object owner can request sticker");
    };
    let stickerRequestId = nextStickerRequestId;
    let stickerRequest : StickerRequest = {
      id = stickerRequestId;
      vehicleId = input.vehicleId;
      owner = caller;
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

  // Update sticker status - admin only
  public shared ({ caller }) func updateStickerStatus(stickerRequestId : StickerRequestId, newStatus : Text, trackingNote : ?Text) : async () {
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

  // Get sticker requests for current user
  public query ({ caller }) func getMyStickerRequests() : async [StickerRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only owners can request stickers");
    };
    stickerRequests.values().toArray().filter(func(sr) { sr.owner == caller }).sort();
  };

  // QR code batch generation
  public shared ({ caller }) func generatePrintableQRCodes(quantity : Nat, prefix : Text) : async [PrintableQRCode] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can generate QR codes");
    };
    if (quantity == 0 or quantity > 200) {
      Runtime.trap("Can only generate between 1 and 200 QR codes at a time");
    };
    if (prefix.size() > 5) {
      Runtime.trap("Prefix must be 5 characters or less");
    };

    let newQRCodes = Array.tabulate<PrintableQRCode>(quantity, func(i) {
      let id = nextPrintableQRCodeId + i;
      let uniqueIdentifier = generateUniqueIdentifier(id, prefix);
      {
        id;
        uniqueIdentifier = uniqueIdentifier;
        qrData = "https://scanlink.app/assign?code=" # uniqueIdentifier;
        status = "generated";
        assignedVehicleId = null;
        assignedAt = null;
        generatedBy = caller;
        createdAt = Time.now();
      };
    });

    let entries = Array.tabulate(quantity, func(i) { (nextPrintableQRCodeId + i, newQRCodes[i]) });
    for ((id, code) in entries.values()) {
      printableQRCodes.add(id, code);
    };

    nextPrintableQRCodeId += quantity;
    newQRCodes;
  };

  func generateUniqueIdentifier(id : Nat, prefix : Text) : Text {
    let charsPool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let poolSize = charsPool.size();

    let basePrefix = if (prefix == "") { "SL" } else { prefix };
    let firstPart = basePrefix # "-";
    let seed = id + (Time.now() % 100000000);

    var result = firstPart;

    for (j in Nat.range(0, 6)) {
      let index : Nat = (seed + (j * 17)).toNat() % poolSize;
      let charArray = charsPool.toArray();
      let char = charArray[index];
      result #= char.toText();
    };

    if (isUniqueIdentifier(result)) { result } else { generateUniqueIdentifier(id + 1, prefix) };
  };

  func isUniqueIdentifier(identifier : Text) : Bool {
    not printableQRCodes.values().toArray().any(func(code) { code.uniqueIdentifier == identifier });
  };

  // Assign QR code to object
  public shared ({ caller }) func assignPrintableQRCode(uniqueIdentifier : Text, vehicleId : VehicleId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can assign QR codes");
    };

    let qrCode = printableQRCodes.values().toArray().find(func(code) { code.uniqueIdentifier == uniqueIdentifier });
    switch (qrCode) {
      case (null) { Runtime.trap("Invalid QR code") };
      case (?qrCode) {
        if (qrCode.status != "generated") {
          Runtime.trap("Cannot assign QR code - status not eligible");
        };

        let assignedVehicle = vehicles.get(vehicleId);
        switch (assignedVehicle) {
          case (null) {
            Runtime.trap("Object not found!");
          };
          case (?vehicle) {
            if (vehicle.owner != caller) {
              Runtime.trap("Unauthorized: Only the object owner can assign QR codes");
            };

            let updatedQRCode : PrintableQRCode = {
              id = qrCode.id;
              uniqueIdentifier = qrCode.uniqueIdentifier;
              qrData = qrCode.qrData;
              status = "assigned";
              assignedVehicleId = ?vehicleId;
              assignedAt = ?Time.now();
              generatedBy = qrCode.generatedBy;
              createdAt = qrCode.createdAt;
            };
            printableQRCodes.add(qrCode.id, updatedQRCode);
          };
        };
      };
    };
  };

  // Revoke QR code
  public shared ({ caller }) func revokePrintableQRCode(id : PrintableQRCodeId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can revoke QR codes");
    };
    switch (printableQRCodes.get(id)) {
      case (null) { Runtime.trap("QR code not found") };
      case (?qrCode) {
        let updatedQRCode : PrintableQRCode = {
          id = qrCode.id;
          uniqueIdentifier = qrCode.uniqueIdentifier;
          qrData = qrCode.qrData;
          status = "revoked";
          assignedVehicleId = null;
          assignedAt = null;
          generatedBy = qrCode.generatedBy;
          createdAt = qrCode.createdAt;
        };
        printableQRCodes.add(id, updatedQRCode);
      };
    };
  };

  // Get all printable QR codes - admin only
  public query ({ caller }) func getAllPrintableQRCodes() : async [PrintableQRCode] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all QR codes");
    };
    printableQRCodes.values().toArray().sort();
  };

  // Get assigned QR code for object
  public query ({ caller }) func getAssignedQRForVehicle(vehicleId : VehicleId) : async ?PrintableQRCode {
    switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Object not found!") };
      case (?vehicle) {
        if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or admin can view QR codes");
        };
        printableQRCodes.values().toArray().find(func(qrCode) { qrCode.assignedVehicleId == ?vehicleId and qrCode.status == "assigned" });
      };
    };
  };

  // Persist Maps to stable arrays before upgrade
  system func preupgrade() {
    vehiclesEntries := vehicles.toArray();
    messagesEntries := messages.toArray();
    userProfilesEntries := userProfiles.toArray();
    stickerRequestsEntries := stickerRequests.toArray();
    userProfileDetailsEntries := userProfileDetails.toArray();
    printableQRCodesEntries := printableQRCodes.toArray();
    vehicleCategoriesEntries := vehicleCategories.toArray();
    vehicleContactInfoEntries := vehicleContactInfoMap.toArray();
    messageLocationsEntries := messageLocationsMap.toArray();
    authAdminAssigned := accessControlState.adminAssigned;
    authUserRolesEntries := accessControlState.userRoles.toArray();
  };

  // NOTE: Do NOT clear stable arrays in postupgrade.
  // They serve as a permanent backup. preupgrade keeps them fresh before each upgrade.
  system func postupgrade() {
    // intentionally left empty
  };
};
