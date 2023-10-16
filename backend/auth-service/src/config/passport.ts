import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { getJWTSecret } from "../lib/utils";
import { getUserById } from "../lib/user_api_helpers";
import HttpStatusCode from "../common/HttpStatusCode";
import { UserProfile } from "../common/types";
import { Request } from "express";
import passport from "passport";

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

const options: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: getJWTSecret(),
};

interface JwtPayload {
  sub: string;
  iat: number;
}

const authenticateWithJWT = async (
  jwt_payload: JwtPayload
): Promise<UserProfile | undefined> => {
  const response = await getUserById(jwt_payload.sub);

  if (response.status !== HttpStatusCode.OK) {
    return undefined;
  }
  const user = (await response.json()) as UserProfile;

  return user;
};

const jwtStrategy = new JwtStrategy(options, async (jwt_payload, done) => {
  // if code is here, JWT is authenticated and valid
  // now, check if user exists
  const result = await authenticateWithJWT(jwt_payload);
  if (!result) {
    return done(null, false);
  }

  return done(null, result);
});

passport.use("jwt", jwtStrategy);
