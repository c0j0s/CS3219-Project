import ComplexityDonutChart from "./donut-chart/ComplexityDonutChart";
import LanguageDonutChart from "./donut-chart/LanguageDonutChart";
import { useHistoryContext } from "@/contexts/history";
import SpinnerLoadingComponent from "../common/SpinnerLoadingComponent";

const StatisticsCard = () => {
  const { isLoading } = useHistoryContext();

  return (
    <div className="flex flex-col h-full justify-start bg-black rounded-lg px-6 py-1 text-sm overflow-y-auto">
      <p className="mt-2">Solved Problems</p>
      {isLoading ? (
        <SpinnerLoadingComponent />
      ) : (
        <div>
          <ComplexityDonutChart width={135} height={135} />
          <LanguageDonutChart width={135} height={135} />
        </div>
      )}
    </div>
  );
};

export default StatisticsCard;
