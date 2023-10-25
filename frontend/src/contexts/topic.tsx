import { getTopics } from "@/helpers/question/question_api_wrappers";
import { createContext, useContext, useState } from "react";

interface ITopicContext {
  topics: string[];
  isNotFoundError: boolean;
  fetchTopics: () => Promise<void>;
}

const TopicContext = createContext<ITopicContext>({
  topics: [],
  isNotFoundError: false,
  fetchTopics: async () => {},
});

const useTopicContext = () => useContext(TopicContext);

const TopicProvider = ({ children }: { children: React.ReactNode }) => {
  const [isNotFoundError, setIsNotFoundError] = useState<boolean>(false);
  const [topics, setTopics] = useState<string[]>([]);

  const fetchTopics = async () => {
    try {
      const topics = await getTopics();
      setTopics(topics);
    } catch (error) {
      console.log(error);
      setTopics([]);
      setIsNotFoundError(true);
    }
  };

  return (
    <TopicContext.Provider value={{ topics, isNotFoundError, fetchTopics }}>
      {children}
    </TopicContext.Provider>
  );
};

export { TopicProvider, useTopicContext };
