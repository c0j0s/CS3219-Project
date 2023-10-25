import History from "@/types/history";
import QuestionFilter from "./question-statistics/QuestionFilter";
import AttemptedQuestionTable from "./question-statistics/AttemptedQuestionTable";
import { useHistoryContext } from "@/contexts/history";
import { Icons } from "../common/Icons";
import { Spinner } from "@nextui-org/react";

const QuestionStatisticsCard = () => {
  const { isLoading } = useHistoryContext();

  return (
    <div className="flex flex-col h-full gap-2 bg-black rounded-lg p-4 overflow-y-auto">
      {isLoading ? (
        <div>
          <div className="flex justify-center">
            <Spinner size="md" />
          </div>
          <div className="flex justify-center">
            <span className="text-gray-500">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <QuestionFilter />
          <AttemptedQuestionTable />
        </>
      )}
    </div>
  );
};

export default QuestionStatisticsCard;
