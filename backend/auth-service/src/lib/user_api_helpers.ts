/* -------------------------------------------------------------------------- */
/*                   Helpers to call User Service endpoints                   */
/* -------------------------------------------------------------------------- */

import { UserProfile } from "../common/types";
import { getServiceSecret } from "./utils";
import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const getUserServiceEndpoint = (): string => {
  return process.env.GATEWAY? `${process.env.GATEWAY}/${NODE_ENV}` : `http://localhost:5005/${NODE_ENV}`;
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
  console.debug(`[getUserByEmail] fetch ${getUserServiceEndpoint()}/user/api/users/email?email=${email}`);
  
  const res = await fetch(
    `${getUserServiceEndpoint()}/user/api/users/email?email=${email}`,
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
  console.debug(`[getUserById] fetch ${getUserServiceEndpoint()}/user/api/users/email?email=${id}`);
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  return res;
};

const updateVerfication = async(email:string, token:string) => {
  console.debug(`[updateVerfication] fetch ${getUserServiceEndpoint()}/user/api/users/updateVerification/${email}`);
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/updateVerification/${email}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      bypass: getServiceSecret(),
    },
  });
  
  return res;
}

const updatePasswordResetToken = async(email:string, updateBody: {}) => {
  console.debug(`[updatePasswordResetToken] fetch ${getUserServiceEndpoint()}/user/api/users/updatePasswordResetToken/${email}`);
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/updatePasswordResetToken/${email}`, {
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
  console.debug(`[updatePassword] fetch ${getUserServiceEndpoint()}/user/api/users/${id}`);
  const res = await fetch(`${getUserServiceEndpoint()}/user/api/users/${id}`, {
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
