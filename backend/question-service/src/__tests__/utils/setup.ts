import Topic from "../../lib/enums/Topic";
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

export const loginAndInsertSingleQuestion = async (
  questionId: string,
  questionTitle: string = "Question Title"
) => {
  // login to an admin account
  const jwtCookie = await login();

  await db.question.create({
    data: {
      id: questionId,
      title: questionTitle,
      topics: [Topic.DP],
      complexity: "HARD",
      description: "Question description",
      url: "https://www.leetcode.com/problems/question-title",
      author: "author1",
      examples: {
        create: [
          {
            input: "input1",
            output: "output1",
            explanation: "explanation1",
          },
          {
            input: "input2",
            output: "output2",
          },
        ],
      },
      constraints: ["constraint1", "constraint2"],
    },
  });

  return jwtCookie;
};

export const loginAndInsertQuestions = async () => {
  // login to an admin account
  const jwtCookie = await login();

  await db.question.createMany({
    data: [
      {
        title: "Question 1",
        topics: [Topic.ARRAY, Topic.STRING],
        complexity: "EASY",
        description: "Question 1 description",
        url: "https://www.leetcode.com/problems/question-1",
      },
      {
        title: "Question 2",
        topics: [Topic.LINKEDLIST, Topic.TWOPOINTERS, Topic.STRING],
        complexity: "MEDIUM",
        description: "Question 2 description",
        url: "https://www.leetcode.com/problems/question-2",
      },
      {
        title: "Question 3",
        topics: [Topic.GRAPH, Topic.BACKTRACKING, Topic.BFS, Topic.DFS],
        complexity: "HARD",
        description: "Question 3 description",
        url: "https://www.leetcode.com/problems/question-3",
      },
    ],
  });

  return jwtCookie;
};

export const logOutAndCleanUp = async (
  questionTitle: string | undefined = undefined
) => {
  if (questionTitle) {
    await db.question.delete({
      where: {
        title: questionTitle,
      },
    });
  } else {
    await db.question.deleteMany({
      where: {
        title: {
          in: ["Question 1", "Question 2", "Question 3"],
        },
      },
    });
  }

  await fetch("http://localhost:5050/auth/api/logout", {
    method: "POST",
  });

  return "";
};
