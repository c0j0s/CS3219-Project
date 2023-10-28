import { Link } from "@nextui-org/react";
import ActivityHeatMap from "./heatmap/ActivityHeatMap";
import { CLIENT_ROUTES } from "@/common/constants";
import { Icons } from "../common/Icons";
import { useHistoryContext } from "@/contexts/history";
import SpinnerLoadingComponent from "../common/SpinnerLoadingComponent";

const HeatmapCard = () => {
  const { isLoading } = useHistoryContext();

  return (
    <div className="flex flex-col h-full p-4 py-2 bg-black rounded-lg">
      {isLoading ? (
        <SpinnerLoadingComponent />
      ) : (
        <div>
          <ActivityHeatMap />
          <div>
            <Link
              href={`${CLIENT_ROUTES.QUESTIONS}/history`}
              className="text-sm mx-2"
              size="md"
              color="foreground"
              showAnchorIcon
              anchorIcon={<Icons.Anchor width="20" height="20" />}
            >
              View all attempted questions
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatmapCard;
