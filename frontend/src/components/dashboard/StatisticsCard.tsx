import { HistoryService } from "@/helpers/history/history_api_wrappers";
import ComplexityDonutChart from "./donut-chart/ComplexityDonutChart";
import LanguageDonutChart from "./donut-chart/LanguageDonutChart";
import { useHistoryContext } from "@/contexts/history";
import { Spinner } from "@nextui-org/react";

const StatisticsCard = () => {
  const { history, isLoading } = useHistoryContext();

  const complexityData =
    HistoryService.getNumberOfAttemptedQuestionsByComplexity(history);
  const languageData =
    HistoryService.getNumberOfAttemptedQuestionsByLanguage(history);

  return (
    <div className="flex flex-col h-full justify-start bg-black rounded-lg px-6 py-1 text-sm overflow-y-auto">
      <p className="mt-2">Solved Problems</p>
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
          <ComplexityDonutChart
            data={complexityData}
            width={135}
            height={135}
          />
          <LanguageDonutChart data={languageData} width={135} height={135} />
        </>
      )}
    </div>
  );
};

export default StatisticsCard;
