import AccessControl "./access-control";
import Prim "mo:prim";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Initialize auth (first caller with matching token becomes admin, others become users).
  // If CAFFEINE_ADMIN_TOKEN is not set, all non-anonymous callers become regular users.
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) {
        // Env var not set — register caller as user so app remains functional
        if (not caller.isAnonymous()) {
          AccessControl.ensureRegistered(accessControlState, caller);
        };
      };
      case (?adminToken) {
        AccessControl.initialize(accessControlState, caller, adminToken, userSecret);
      };
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
