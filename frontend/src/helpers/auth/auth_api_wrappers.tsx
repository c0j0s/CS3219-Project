import HttpStatusCode from "@/types/HttpStatusCode";
import { getLogger } from "@/helpers/logger";
import { HTTP_METHODS, DOMAIN } from "@/types/enums";
import { throwAndLogError } from "@/utils/errorUtils";
import api from "../endpoint";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";
import User from "@/types/user";

const logger = getLogger("auth_api_wrappers");

const domain = DOMAIN.AUTH;
const scope = [DOMAIN.AUTH];

const logInByEmail = async (
  email: string,
  password: string,
  cache: RequestCache = "default"
): Promise<User | undefined> => {
  // call POST /api/auth/loginByEmail from auth domain
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: domain,
    path: "loginByEmail",
    body: { email, password },
    tags: scope,
    cache: cache,
  });

  if (response.status === HttpStatusCode.OK) {
    const user = (await response.data.user) as User;

    return user;
  }

  return throwAndLogError(
    "logInByEmail",
    response.message,
    getError(response.status)
  );
};

const registerByEmail = async (user: User, cache: RequestCache = "default") => {
  // call POST /api/auth/registerbyEmail from auth domain
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: domain,
    path: "registerByEmail",
    body: user,
    tags: scope,
    cache: cache,
  });

  // successful response should return 201 and userid
  if (response.status === HttpStatusCode.CREATED) {
    const res = response.data as { id: string; message: string };
    return res;
  }

  return throwAndLogError(
    "registerByEmail",
    response.message,
    getError(response.status)
  );
};

const validateUser = async (cache: RequestCache = "no-cache") => {
  // call POST /api/auth/validate from auth domain
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: domain,
    path: "validate",
    tags: scope,
    cache: cache,
  });

  if (response.status === HttpStatusCode.OK) {
    const user = response.data as User;
    return user;
  }

  return throwAndLogError(
    "validateUser",
    "User is not authenticated",
    getError(response.status)
  );
};

const logOut = async () => {
  // call POST /api/auth/logout from auth domain, which will also handle the routing
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: domain,
    path: "logout",
    tags: scope,
    deleteJWTCookie: true,
  });
  return response;
};

const verifyEmail = async (email: string, token: string) => {
  // call PUT /api/auth/verifyEmail/:email/:token from auth domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `verifyEmail/${email}/${token}`,
    tags: scope,
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "verifyEmail",
    response.message,
    getError(response.status)
  );
};

const sendPasswordResetEmail = async (email: string) => {
  // call PUT /api/auth/sendPasswordResetEmail from auth domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `sendPasswordResetEmail/${email}`,
    tags: scope,
  });
  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "sendPasswordResetEmail",
    response.message,
    getError(response.status)
  );
};

const changePassword = async (
  id: string,
  token: string,
  hashedPassword: string
) => {
  // call PUT /api/auth/changePassword/:id from auth domain
  const response = await api({
    method: HTTP_METHODS.PUT,
    domain: domain,
    path: `changePassword/${id}`,
    body: { token: token, hashedPassword: hashedPassword },
    tags: scope,
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "sendPasswordResetEmail",
    response.message,
    getError(response.status)
  );
};

function getError(status: HttpStatusCode, error?: string) {
  switch (status) {
    case HttpStatusCode.BAD_REQUEST:
      return PeerPrepErrors.BadRequestError;
    case HttpStatusCode.NOT_FOUND:
      return PeerPrepErrors.NotFoundError;
    case HttpStatusCode.CONFLICT:
      return PeerPrepErrors.ConflictError;
    case HttpStatusCode.UNAUTHORIZED:
      return PeerPrepErrors.UnauthorisedError;
    case HttpStatusCode.FORBIDDEN:
      return PeerPrepErrors.ForbiddenError;
    default:
      return PeerPrepErrors.InternalServerError;
  }
}

export const AuthService = {
  logInByEmail,
  registerByEmail,
  validateUser,
  logOut,
  verifyEmail,
  sendPasswordResetEmail,
  changePassword,
};
