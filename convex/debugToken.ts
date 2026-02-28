import { query } from "./_generated/server";

// Debug query to decode and inspect the JWT token
export const inspectToken = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return {
        error: "No identity found - user not authenticated",
        hasIdentity: false,
      };
    }

    // Log all identity fields
    const identityInfo = {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
      picture: identity.picture,
      // Get all fields from identity
      allFields: Object.keys(identity),
      // Try to access token if available
      token: (identity as any).token,
    };

    console.log("[inspectToken] Full identity object:", JSON.stringify(identity, null, 2));
    
    return {
      hasIdentity: true,
      identity: identityInfo,
      note: "Check Convex Dashboard logs for full token details",
    };
  },
});
