/* -------------------------------------------------------------------------- */
/*                   Helpers to call User Service endpoints                   */
/* -------------------------------------------------------------------------- */

import { UserProfile } from "../common/types";
import { getServiceSecret } from "./utils";
import dotenv from "dotenv";

dotenv.config();

const getUserServiceEndpoint = (): string => {
  return process.env.USER_GATEWAY || `http://localhost:5005`;
};

const createUser = async (user: UserProfile) => {
  console.debug(`[createUser] fetch ${getUserServiceEndpoint()}/user/api/users/`);
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/`, {
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
    `${getUserServiceEndpoint()}/user/api/users/email?email=${email}`,
    {
      headers: {
        "Content-Type": "application/json",
        bypass: getServiceSecret(),
      },
    }
    );
    console.debug(`[getUserByEmail][${res.status}] fetch ${getUserServiceEndpoint()}/user/api/users/email?email=${email}`);
    return res;
  };
  
const getUserById = async (id: string) => {
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  console.debug(`[getUserById][${res.status}] fetch ${getUserServiceEndpoint()}/user/api/users/${id}`);
  return res;
};

const updateVerfication = async(email:string, token:string) => {
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/updateVerification/${email}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  
  console.debug(`[updateVerfication][${res.status}] fetch ${getUserServiceEndpoint()}/user/api/users/updateVerification/${email}`);
  return res;
};

const updatePasswordResetToken = async(email:string, updateBody: {}) => {
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/updatePasswordResetToken/${email}`, {
    method: "PUT",
    body: JSON.stringify(updateBody),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  console.debug(`[updatePasswordResetToken][${res.status}] fetch ${getUserServiceEndpoint()}/user/api/users/updatePasswordResetToken/${email}`);
  return res;
};

const updatePassword = async (id: string, updateBody: {}) => {
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateBody),
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  console.debug(`[updatePassword][${res.status}] fetch ${getUserServiceEndpoint()}/user/api/users/${id}`);
  return res;
};

export {
  createUser,
  getUserServiceEndpoint,
  getUserById,
  getUserByEmail,
  updateVerfication,
  updatePasswordResetToken,
  updatePassword,
};
