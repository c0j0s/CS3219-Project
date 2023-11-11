import db from "../../lib/db";

process.env.NODE_ENV = "test";

export const updatePasswordResetToken = async (token: string) => {
  await db.user.update({
    where: {
      id: process.env.TEST_AUTH_USER_ID,
    },
    data: {
      passwordResetToken: token,
    },
  });
};

export const removePasswordResetToken = async () => {
  await db.user.update({
    where: {
      id: process.env.TEST_AUTH_USER_ID,
    },
    data: {
      passwordResetToken: null,
    },
  });
};

export const updateEmailVerificationToken = async (token: string) => {
  await db.user.update({
    where: {
      id: process.env.TEST_AUTH_USER_ID,
    },
    data: {
      verificationToken: token,
    },
  });
};

export const removeCreatedUser = async (email: string) => {
  try {
    await db.user.delete({
      where: {
        email: email,
      },
    });
  } catch (error) {
    // user already deleted or not exist, no further action is needed
    return false;
  }

  return true;
};

export const setUserToUnverified = async (email: string) => {
  await db.user.update({
    where: {
      email: email,
    },
    data: {
      isVerified: false,
    },
  });
};

export const setUserToVerified = async (email: string) => {
  await db.user.update({
    where: {
      email: email,
    },
    data: {
      isVerified: true,
    },
  });
};

export const getOriginalPassword = async (userId: string) => {
  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      password: true,
    },
  });

  return user?.password;
};

export const rollbackPassword = async (
  userId: string,
  hashedPassword: string
) => {
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
};
