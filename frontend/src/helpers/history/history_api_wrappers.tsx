/* -------------------------------------------------------------------------- */
/*                      mock backend for history service                      */
/* -------------------------------------------------------------------------- */

import { DOMAIN, HTTP_METHODS } from "@/types/enums";
import api from "../endpoint";
import { getLogger } from "../logger";
import HttpStatusCode from "@/types/HttpStatusCode";
import History, { DataItem } from "@/types/history";
import { getError, throwAndLogError } from "@/utils/errorUtils";
import ComplexityChip from "@/components/question/ComplexityChip";
import { formatDistanceToNow } from "date-fns";
import { StringUtils } from "../../utils/stringUtils";
import { Chip, Link, Tooltip } from "@nextui-org/react";
import { CLIENT_ROUTES } from "@/common/constants";

const logger = getLogger("history_api_wrappers");

const historyService = DOMAIN.HISTORY;

const getAttemptedQuestionsHistory = async (userId: string) => {
  // temporary hardcode solution
  const history: History[] = [
    {
      id: "historyCuId1",
      userId: "currentUserId",
      questionId: "clnbayqw500007kzkd75u50ad",
      title: "Question 1",
      topics: [
        "DEPTH-FIRST SEARCH",
        "BINARY SEARCH",
        "BREADTH-FIRST SEARCH",
        "HASH TABLE",
        "BIT MANIPULATION",
        "SLIDING WINDOW",
        "DIVIDE AND CONQUER",
        "TWO POINTERS",
        "STACK",
        "STRING",
        "GREEDY",
      ],
      language: "Python",
      complexity: "Easy",
      createdAt: "2023-08-01T00:00:00.000Z",
      updatedAt: "2023-08-01T00:00:00.000Z",
    },
    {
      id: "historyCuId2",
      userId: "currentUserId",
      questionId: "clnbazbu400037kzkh3ghgxi3",
      title: "Question 2",
      topics: ["Dynammic Programming", "Hash tabe", "Memoization"],
      language: "C++",
      complexity: "Medium",
      createdAt: "2023-10-01T00:00:00.000Z",
      updatedAt: "2023-10-01T00:00:00.000Z",
    },
    {
      id: "historyCuId3",
      userId: "currentUserId",
      questionId: "clnbazw2a000b7kzk53ql7xbw",
      title: "Question 3",
      topics: ["Graph"],
      language: "Java",
      complexity: "Hard",
      createdAt: "2023-09-01T00:00:00.000Z",
      updatedAt: "2023-09-01T00:00:00.000Z",
    },
    {
      id: "historyCuId4",
      userId: "currentUserId",
      questionId: "clnbbl2py000z7kzkfw4e3sem",
      title: "Question 4",
      topics: ["Graph"],
      language: "Javascript",
      complexity: "Hard",
      createdAt: "2023-09-24T00:00:00.000Z",
      updatedAt: "2023-09-24T00:00:00.000Z",
    },
    {
      id: "historyCuId5",
      userId: "currentUserId",
      questionId: "clniza3lj00057k6weh0fmjgw",
      title: "A very long long long long long long long name Question 5",
      topics: ["Graph", "String"],
      language: "Javascript",
      complexity: "Hard",
      createdAt: "2023-07-24T23:40:11.289Z",
      updatedAt: "2023-07-24T23:40:11.289Z",
    },
  ];

  const promise = new Promise<History[]>((resolve) => {
    setTimeout(() => {
      resolve(history);
    }, 1000);
  });

  const historyData = await promise;

  return historyData;

  // const queryParam = `?userId=${userId}`;
  // const response = await api({
  //   method: HTTP_METHODS.GET,
  //   service: historyService,
  //   path: queryParam,
  // });

  // if (response.status === HttpStatusCode.OK) {
  //   const data = response.data as History[];
  //   return data;
  // }

  // return throwAndLogError(
  //   "getAttemptedQuestions",
  //   response.message,
  //   getError(response.status)
  // );
};

const getNumberOfAttemptedQuestionsByComplexity = (
  history: History[]
): DataItem[] => {
  const data: DataItem[] = [
    { name: "Easy", value: 0 },
    { name: "Medium", value: 0 },
    { name: "Hard", value: 0 },
  ];

  history.forEach((question) => {
    switch (question.complexity.toUpperCase()) {
      case "EASY":
        data[0].value++;
        break;
      case "MEDIUM":
        data[1].value++;
        break;
      case "HARD":
        data[2].value++;
        break;
      default:
        throw new Error("Invalid complexity");
    }
  });

  return data;
};

const getSortedNumberOfAttemptedQuestionsByTopic = (
  history: History[]
): DataItem[] => {
  const topicCountMap = new Map<string, number>();

  history.forEach((question) => {
    const topics = question.topics.map((topic) =>
      StringUtils.convertStringToTitleCase(topic)
    );
    topics.forEach((topic) => {
      if (topicCountMap.has(topic)) {
        const count = topicCountMap.get(topic)!;
        topicCountMap.set(topic, count + 1);
      } else {
        topicCountMap.set(topic, 1);
      }
    });
  });

  const data: DataItem[] = [];
  topicCountMap.forEach((value, key) => {
    data.push({ name: key, value: value });
  });

  data.sort((a, b) => {
    return b.value - a.value;
  });

  return data;
};

const getNumberOfAttemptedQuestionsByLanguage = (
  history: History[]
): DataItem[] => {
  const languageCountMap = new Map<string, number>();

  history.forEach((question) => {
    const language = question.language;
    if (languageCountMap.has(language)) {
      const count = languageCountMap.get(language)!;
      languageCountMap.set(language, count + 1);
    } else {
      languageCountMap.set(language, 1);
    }
  });

  const data: DataItem[] = [];
  languageCountMap.forEach((value, key) => {
    data.push({ name: key, value: value });
  });
  return data;
};

const getNumberOfAttemptedQuestionsByDate = (history: History[]) => {
  const dateCountMap = new Map<number, number>();

  history.forEach((question) => {
    const date: number = new Date(question.updatedAt).getTime();

    if (dateCountMap.has(date)) {
      const count = dateCountMap.get(date)!;
      dateCountMap.set(date, count + 1);
    } else {
      dateCountMap.set(date, 1);
    }
  });

  const data: { date: number; value: number }[] = [];
  dateCountMap.forEach((value, key) => {
    data.push({ date: key, value: value });
  });
  return data;
};

const getQuestionCodeSubmission = async (
  userId: string,
  questionId: string,
  language: string
) => {
  const temporaryCodeData = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        for i in range(len(nums)):
            for j in range(i+1, len(nums)):
                if nums[i]+nums[j] == target:
                    return [i, j]
        return [-1, -1]`;
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({ language: language, code: temporaryCodeData });
    }, 1500);
  });
  return promise;
  // const response = await api({
  //   method: HTTP_METHODS.GET,
  //   service: historyService,
  //   path: `/user/${userId}/questionId/${questionId}/code?language=${encodeURIComponent(language)}`,
  // });

  // if (response.status === HttpStatusCode.OK) {
  //   const data = response.data as { language: string, code: string };
  //   return data;
  // }

  // return throwAndLogError(
  //   "getQuestionCodeSubmission",
  //   response.message,
  //   getError(response.status)
  // );
};

const createHistory = async (userId: string | string[], questionId: string) => {
  const response = await api({
    method: HTTP_METHODS.POST,
    domain: historyService,
    body: {
      userId: userId,
      questionId: questionId,
    },
  });

  if (response.status === HttpStatusCode.CREATED) {
    const data = response.data;
    return data;
  }

  return throwAndLogError(
    "createHistory",
    response.message,
    getError(response.status)
  );
};

const deleteHistory = async (userId: string, questionId: string) => {
  const response = await api({
    method: HTTP_METHODS.DELETE,
    domain: historyService,
    path: `/user/${userId}/questionId/${questionId}`,
  });

  if (response.status === HttpStatusCode.NO_CONTENT) {
    return true;
  }

  return throwAndLogError(
    "deleteHistory",
    response.message,
    getError(response.status)
  );
};

export const HistoryService = {
  getAttemptedQuestionsHistory,
  getNumberOfAttemptedQuestionsByComplexity,
  getNumberOfAttemptedQuestionsByTopic:
    getSortedNumberOfAttemptedQuestionsByTopic,
  getNumberOfAttemptedQuestionsByLanguage,
  getNumberOfAttemptedQuestionsByDate,
  getQuestionCodeSubmission,
  createHistory,
  deleteHistory,
};
