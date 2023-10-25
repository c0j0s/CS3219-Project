import { HistoryService } from "@/helpers/history/history_api_wrappers";
import History, { CodeSubmission } from "@/types/history";
import User from "@/types/user";
import { createContext, useContext, useState } from "react";
import { useAuthContext } from "./auth";
import { getQuestionById } from "@/helpers/question/question_api_wrappers";
import Question from "@/types/question";

interface IHistoryContext {
  user: User | undefined;
  isLoading: boolean;
  isNotFoundError: boolean;
  history: History[];
  question: Question | undefined;
  code: string | undefined;
  language: string | undefined;
  completedAt: Date | undefined;
  handleRetrieveHistory: () => Promise<void>;
  handleRetrieveQuestionCode: (
    questionId: string,
    language: string,
    completedAt: number
  ) => Promise<void>;
}

const HistoryContext = createContext<IHistoryContext>({
  user: undefined,
  isLoading: false,
  isNotFoundError: false,
  history: [],
  question: undefined,
  code: undefined,
  language: undefined,
  completedAt: undefined,
  handleRetrieveHistory: async () => {},
  handleRetrieveQuestionCode: async () => {},
});

const useHistoryContext = () => useContext(HistoryContext);

const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFoundError, setIsNotFoundError] = useState<boolean>(false);
  const [history, setHistory] = useState<History[]>([]);

  const [question, setQuestion] = useState<Question>();
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [completedAt, setCompletedAt] = useState<Date>();

  const handleRetrieveHistory = async () => {
    setIsLoading(true);
    try {
      if (!user || !user.id) {
        setIsNotFoundError(true);
        return;
      }

      const history = await HistoryService.getAttemptedQuestionsHistory(
        user.id
      );

      if (!history || history.length === 0) {
        setIsNotFoundError(true);
        return;
      }

      setHistory(history);
    } catch (error) {
      setIsNotFoundError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrieveQuestionCode = async (
    questionId: string,
    language: string,
    completedAt: number
  ) => {
    setIsLoading(true);
    try {
      if (!user || !user.id || !questionId || !language || !completedAt) {
        setIsNotFoundError(true);
        return;
      }

      // set the language
      switch (decodeURIComponent(language).toLowerCase()) {
        case "c++":
          language = "cpp";
          break;
        case "java":
          language = "java";
          break;
        case "python":
          language = "python";
          break;
        case "javascript":
          language = "javascript";
          break;
        default:
          setIsNotFoundError(true);
          return;
      }
      setLanguage(language);

      // set the completed date
      setCompletedAt(new Date(completedAt));

      // get the question detail and the code submission
      const promises = [
        getQuestionById(questionId),
        HistoryService.getQuestionCodeSubmission(user.id, questionId, language),
      ];

      const responses = await Promise.all(promises);

      const question = responses[0] as Question;
      const codeSubmission = responses[1] as CodeSubmission;

      if (
        !question ||
        !question.title ||
        !codeSubmission ||
        !codeSubmission.code
      ) {
        setIsNotFoundError(true);
        return;
      }

      // set the question detail, and the code submission
      setQuestion(question);
      setCode(codeSubmission.code);
    } catch (error) {
      setIsNotFoundError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HistoryContext.Provider
      value={{
        user,
        isLoading,
        isNotFoundError,
        history,
        question,
        code,
        language,
        completedAt,
        handleRetrieveHistory,
        handleRetrieveQuestionCode,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export { useHistoryContext, HistoryProvider };
