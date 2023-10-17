import cors from "cors";


const allowedOrigins = ["http://localhost:3000"];

const verifyOrigin = (origin: string | undefined, callback: any) => {
  //  when the call is made from the same origin
  if (!origin) {
    return callback(null, true);
  }
  // when the call is made from a different but authorized origin
  else if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  } else {
    return callback(new Error("Not allowed by CORS"), false);
  }
};

/**
 * CORS will be handled by AWS Api Gateway instead, 
 * since instances are in a private VPC,
 *  cors here does not matter anymore.
 */
export const corsOptions = {
  // credentials: true, // We need to allow this when we have the authentication functionality
  origin: ["http://localhost:3000", "https://*.d218r20arshixx.amplifyapp.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

export default cors(corsOptions);
