import db from "../../models/db";

export const login = async (role: string = "user") => {
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

export const getQuestionId = (purpose: string) => {
  switch (purpose.toLowerCase()) {
    case "get":
      return "cl01234567890123456789012";
    case "post":
      return "clabcdefabcdefabcdefabcde";
    case "put":
      return "cl98765432109876543210987";
    case "delete":
      return "clfe1d2c3b4a5fe1d2c3b4a5d";
    default:
      return "";
  }
};

export const loginAndCreateHistory = async (purpose: string) => {
  const jwtCookie = await login();

  let questionId = getQuestionId(purpose);

  await db.history.create({
    data: {
      id: "test-" + purpose + "-history-id",
      userId: process.env.TEST_USER_ID!,
      questionId: questionId,
      languages: ["PYTHON"],
    },
  });

  await db.codeSubmission.create({
    data: {
      id: "test-" + purpose + "-code-submission-id",
      historyId: "test-" + purpose + "-history-id",
      language: "PYTHON",
      code: "print('hello world')",
    },
  });

  return jwtCookie;
};

export const logout = async () => {
  await fetch("http://localhost:5050/auth/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return "";
};

export const logoutAndDeleteHistory = async (purpose: string) => {
  const jwtCookie = await logout();

  // delete history, code submission will also be deleted as the relation is on delete cascade
  try {
    await db.history.delete({
      where: {
        id: "test-" + purpose + "-history-id",
      },
    });
  } catch (error) {
    // the question has been deleted, so no further action needed
    return jwtCookie;
  }

  return jwtCookie;
};
