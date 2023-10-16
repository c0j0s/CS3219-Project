/* -------------------------------------------------------------------------- */
/*                   Helpers to call User Service endpoints                   */
/* -------------------------------------------------------------------------- */

import { UserProfile } from "../common/types";
import { getServiceSecret } from "./utils";
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

const getUserServiceEndpoint = (): string => {
  return process.env.USER_SERVICE_ENDPOINT || "http://localhost:5005";
};

const createUser = async (user: UserProfile) => {
  const res = await fetch(`${getUserServiceEndpoint()}/${NODE_ENV}/user/users/`, {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });

  return res;
};

const getUserByEmail = async (email: string) => {
  const res = await fetch(
    `${getUserServiceEndpoint()}/${NODE_ENV}/user/users/email?email=${email}`,
    {
      headers: {
        "Content-Type": "application/json",
        bypass: getServiceSecret(),
      },
    }
  );
  return res;
};

const getUserById = async (id: string) => {
  const res = await fetch(`${getUserServiceEndpoint()}/${NODE_ENV}/user/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  return res;
};

const updateVerfication = async(email:string, token:string) => {
  const res = await fetch(`${getUserServiceEndpoint()}/${NODE_ENV}/user/users/updateVerification/${email}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });

  return res;
}

const updatePasswordResetToken = async(email:string, updateBody: {}) => {
  const res = await fetch(`${getUserServiceEndpoint()}/${NODE_ENV}/user/users/updatePasswordResetToken/${email}`, {
    method: "PUT",
    body: JSON.stringify(updateBody),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  return res;
}

const updatePassword = async (id: string, updateBody: {}) => {
  const res = await fetch(`${getUserServiceEndpoint()}/${NODE_ENV}/user/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateBody),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  return res;
};


export { createUser, getUserServiceEndpoint, getUserById, getUserByEmail, updateVerfication, updatePasswordResetToken, updatePassword };
