module.exports = (role = "admin") => {
  return async (context) => {
    if (context.type != "before") {
      throw new Error("restrictToRole must be a `before` hook.");
    }
    // Skip if no provider (internal call)
    if (!context.params.provider) {
      return context;
    }

    const { authentication } = context.params;

    // Do not allow unauthenticated
    if (!authentication) {
      throw new Error("Not authenticated");
    }
    // Allow if coming from CLI
    if (authentication.payload.cli) {
      return context;
    }
    // Disallow if no sub
    if (!authentication.payload.sub) {
      throw new Error("Invalid authentication token");
    }
    // Get user and restrict to role
    const user = await context.app
      .service("users")
      .get(authentication.payload.sub);

    if (user.role != role) {
      throw new Error("Not allowed");
    }

    return context;
  };
};
