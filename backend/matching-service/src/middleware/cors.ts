import cors from "cors";

/**
 * CORS will be handled by AWS Api Gateway instead, 
 * since instances are in a private VPC,
 *  cors here does not matter anymore.
 */
export const corsOptions = {
  // credentials: true, // We need to allow this when we have the authentication functionality
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

export default cors(corsOptions);
