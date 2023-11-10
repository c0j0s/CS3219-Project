import Topic from "../../../lib/enums/Topic";

const getQuestionResponseBody = () => {
  return {
    id: "questionId1",
    title: "Question Title",
    topics: [Topic.DP],
    complexity: "HARD",
    description: "Question description",
    url: "https://www.leetcode.com/problems/question-title",
    author: "author1",
    examples: [
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
    constraints: ["constraint1", "constraint2"],
  };
};

const getCreateQuestionRequestBody = () => {
  return {
    title: "Post Question Title",
    topics: [Topic.GREEDY],
    description: "Post Question Description",
    url: "https://www.leetcode.com/problems/post-question-title",
    complexity: "HARD",
    examples: [
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
    constraints: ["constraint1", "constraint2"],
    author: "author1",
  };
};

export const IntegrationPayloads = {
  getQuestionResponseBody,
  getCreateQuestionRequestBody,
};
