import db from "../../models/db";

export const login = async (role: string = "ADMIN") => {
  const response = await fetch("http://localhost:5050/auth/api/loginByEmail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email:
        role === "ADMIN"
          ? process.env.TEST_ADMIN_EMAIL
          : process.env.TEST_USER_EMAIL,
      password:
        role === "ADMIN"
          ? process.env.TEST_ADMIN_PASSWORD
          : process.env.TEST_USER_PASSWORD,
    }),
  });

  const jwtCookie = response.headers.get("set-cookie") as string;

  return jwtCookie;
};

export const createUserForTest = async (isForUpdate: boolean = true) => {
  if (isForUpdate) {
    await db.user.create({
      data: {
        id: "test-update-user-id",
        name: "Update User",
        email: "testUpdateUser@email.com",
        password: generateRandomPassword(),
        role: "USER",
        verificationToken: "testUpdateUserVerificationToken",
      },
    });
  } else {
    await db.user.create({
      data: {
        id: "test-delete-user-id",
        name: "Delete User",
        email: "testDeleteUser@email.com",
        password: generateRandomPassword(),
        role: "USER",
        verificationToken: "testDeleteUserVerificationToken",
      },
    });
  }
};

export const deleteTestUser = async (isForUpdate: boolean = true) => {
  if (isForUpdate) {
    await db.user.delete({
      where: {
        id: "test-update-user-id",
      },
    });
  } else {
    await db.user.delete({
      where: {
        id: "test-delete-user-id",
      },
    });
  }
};

export const logout = async () => {
  await fetch("http://localhost:5050/auth/api/logout", {
    method: "POST",
  });

  return "";
};

export const generateRandomPassword = (length: number = 50) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};
