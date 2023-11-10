import { useConsoleContext } from "@/contexts/console";
import { Chip, Spinner } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { GoDotFill } from "react-icons/go";
import { BsQuestion } from "react-icons/bs";
import { Judge0Status } from "@/types/judge0";
import { cn } from "@/utils/classNameUtils";

const Results = () => {
  const { testCaseArray, isResultsLoading, shouldProcessInputs } =
    useConsoleContext();
  const [selectedCase, setSelectedCase] = useState<number>(0);

  useEffect(() => {}, [isResultsLoading, testCaseArray]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex flex-wrap first-letter:justify-start items-center gap-x-2">
        {shouldProcessInputs &&
          testCaseArray?.map((testCase: any, index: number) => (
            <Chip
              key={index}
              radius="sm"
              startContent={
                testCase.statusId !== Judge0Status.ACCEPTED ||
                testCase.description === "Wrong Answer" ? (
                  <GoDotFill color="red" />
                ) : testCase.description === "Code Executed Successfully" ? (
                  <BsQuestion color="white" />
                ) : testCase.description === "Correct Answer" ? (
                  <GoDotFill color="green" />
                ) : (
                  <GoDotFill color="red" />
                )
              }
              style={{
                backgroundColor:
                  index === selectedCase ? "#27272A" : "transparent",
              }}
              className="my-2 px-2 py-4"
              size="sm"
              onClick={() => setSelectedCase(index)}
            >
              Case {index + 1}
            </Chip>
          ))}
      </div>

      <div
        className={cn("text-m font-semibold py-1", {
          "text-red-500":
            testCaseArray[selectedCase].statusId !== Judge0Status.ACCEPTED ||
            (testCaseArray[selectedCase].isDefaultTestCase &&
              !testCaseArray[selectedCase].isCorrect),
          "text-green-500":
            testCaseArray[selectedCase].statusId === Judge0Status.ACCEPTED &&
            testCaseArray[selectedCase].isDefaultTestCase &&
            testCaseArray[selectedCase].isCorrect,
          "text-white":
            testCaseArray[selectedCase].statusId === Judge0Status.ACCEPTED &&
            !testCaseArray[selectedCase].isDefaultTestCase,
        })}
      >
        {testCaseArray[selectedCase].description}
      </div>

      {testCaseArray[selectedCase].stderr && (
        <pre className="bg-red-500 bg-opacity-20 px-4 py-3 rounded-lg text-white text-xs whitespace-pre-wrap">
          {testCaseArray[selectedCase].stderr}
        </pre>
      )}

      {testCaseArray[selectedCase].compile_output && (
        <pre className="bg-red-500 bg-opacity-20 px-4 py-3 rounded-lg text-white text-xs whitespace-pre-wrap">
          {testCaseArray[selectedCase].compile_output}
        </pre>
      )}

      {Object.entries(testCaseArray[selectedCase].input).map(
        ([variableName, variableValue]: [string, any]) => (
          <div key={variableName}>
            <div className="text-white text-xs py-1"> {variableName} = </div>
            <pre className="bg-gray-600 bg-opacity-50 px-4 py-3 rounded-lg text-white text-xs whitespace-pre-wrap">
              {variableValue}
            </pre>
          </div>
        )
      )}
      {shouldProcessInputs && (
        <>
          <div className="text-white text-xs py-1">Expected output: </div>
          {testCaseArray[selectedCase].isDefaultTestCase ? (
            <pre className="bg-gray-600 bg-opacity-50 px-4 py-3 rounded-lg text-white text-xs whitespace-pre-wrap">
              {testCaseArray[selectedCase].output}
            </pre>
          ) : (
            <pre className="bg-gray-600 bg-opacity-50 px-4 py-3 rounded-lg text-gray-400 text-xs whitespace-pre-wrap">
              Not available for custom inputs
            </pre>
          )}
        </>
      )}
      <div className="text-white text-xs">Execution output: </div>
      <pre className="bg-gray-600 bg-opacity-50 px-4 py-3 rounded-lg text-xs whitespace-pre-wrap">
        <div
          style={{
            color: testCaseArray[selectedCase].isDefaultTestCase
              ? testCaseArray[selectedCase].isCorrect
                ? "lime"
                : "red"
              : "white",
          }}
        >
          {testCaseArray[selectedCase].stdout || "No output"}
        </div>
      </pre>
    </div>
  );
};

export default Results;
