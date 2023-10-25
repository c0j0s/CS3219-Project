import { useMemo } from "react";
import * as d3 from "d3";
import { DataItem } from "@/types/history";
import { Tooltip } from "@nextui-org/react";

const MARGIN = 30;

const colors = ["#112F45", "#EC8B33", "#4D9CB9"];

interface DonutChartProps {
  width?: number;
  height?: number;
  data: DataItem[];
}

const ComplexityDonutChart = ({
  width = 160,
  height = 160,
  data,
}: DonutChartProps) => {
  const radius = Math.min(width, height) / 2 - MARGIN;

  const pie = useMemo(() => {
    const pieGenerator = d3.pie<any, DataItem>().value((d) => d.value);
    return pieGenerator(data);
  }, [data]);

  const arcs = useMemo(() => {
    const arcPathGenerator = d3.arc();
    return pie.map((p) =>
      arcPathGenerator({
        innerRadius: radius * 0.7,
        outerRadius: radius,
        startAngle: p.startAngle,
        endAngle: p.endAngle,
      })
    );
  }, [radius, pie]);

  const totalNum = data.reduce((count, curr) => count + curr.value, 0);
  return (
    <div className="flex flex-row">
      <div className="relative">
        <svg width={width} height={height} style={{ display: "inline-block" }}>
          <g transform={`translate(${width / 2}, ${height / 2})`}>
            {arcs.map((arc, i) => {
              return (
                <Tooltip content={data[i].value} placement="bottom" key={i}>
                  <path d={arc as string} fill={colors[i]} />
                </Tooltip>
              );
            })}
          </g>
        </svg>
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-medium">
          {totalNum}
        </span>
      </div>
      <div className="flex flex-col justify-center gap-2 text-[10px]">
        <div className="flex flex-row items-center gap-3">
          <div className="w-8 h-3 rounded-lg bg-dark-blue" />
          <p>Easy</p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="w-8 h-3 rounded-lg bg-orange" />
          <p>Medium</p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="w-8 h-3 rounded-lg bg-blue" />
          <p>Hard</p>
        </div>
      </div>
    </div>
  );
};

export default ComplexityDonutChart;
