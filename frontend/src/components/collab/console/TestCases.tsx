import { useConsoleContext } from "@/contexts/console";
import { Button, Chip, Input, Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { IoIosClose, IoIosAdd } from "react-icons/io";
import { RxReset } from "react-icons/rx";

const TestCases = () => {
  const {
    testCaseArray,
    initialTestCaseArray,
    addTestCase,
    deleteTestCase,
    modifyTestCaseArray,
  } = useConsoleContext();

  const [selectedCase, setSelectedCase] = useState<number>(0);

  const handleTestCaseClose = (index: number) => {
    if (testCaseArray.length === 1) return;
    deleteTestCase(index);
    setSelectedCase(index - 1 < 0 ? 0 : index - 1);
  };

  const handleAddTestCase = () => {
    const newTestCase = structuredClone(testCaseArray[selectedCase]);
    addTestCase(newTestCase);
    setSelectedCase(testCaseArray.length);
  };

  const handleResetToDefaultTestCases = () => {
    setSelectedCase(0);
    modifyTestCaseArray([], true);
  };

  const handleModifyTestcase = (
    index: number,
    variableName: string,
    value: string
  ) => {
    const updatedTestCaseArray = [...testCaseArray];
    updatedTestCaseArray[index].input[variableName] = value;
    updatedTestCaseArray[index].output = "";
    // check if input is equal to any existing input in initialTestCaseArray
    // if yes, update output to the corresponding output in initialTestCaseArray, else set output to ""
    initialTestCaseArray.map((testCase: any) => {
      if (
        JSON.stringify(testCase.input) ===
        JSON.stringify(updatedTestCaseArray[index].input)
      ) {
        updatedTestCaseArray[index].output = testCase.output;
      }
    });

    modifyTestCaseArray(updatedTestCaseArray);
  };

  useEffect(() => {}, [testCaseArray, selectedCase]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex flex-wrap first-letter:justify-start items-center gap-x-2">
        {testCaseArray?.map((testCase: any, index: number) => (
          <Chip
            key={index}
            radius="sm"
            style={{
              backgroundColor:
                index === selectedCase ? "#27272A" : "transparent",
            }}
            className="my-2 px-2 py-4"
            size="sm"
            onClose={() => handleTestCaseClose(index)}
            endContent={<IoIosClose />}
            onClick={() => setSelectedCase(index)}
          >
            Case {index + 1}
          </Chip>
        ))}

        <Tooltip
          color="default"
          placement="top"
          size="sm"
          content="Duplicate current test case"
        >
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onClick={() => handleAddTestCase()}
          >
            <IoIosAdd />
          </Button>
        </Tooltip>
        <div
          style={{
            display:
              JSON.stringify(testCaseArray) ===
              JSON.stringify(initialTestCaseArray)
                ? "none"
                : "block",
          }}
        >
          <Tooltip
            color="default"
            placement="top"
            size="sm"
            content="Reset to default test cases"
          >
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onClick={handleResetToDefaultTestCases}
            >
              <RxReset size="0.9em" />
            </Button>
          </Tooltip>
        </div>
      </div>
      {Object.entries(testCaseArray[selectedCase].input).map(
        ([variableName, variableValue]: [string, any]) => (
          <div key={variableName}>
            <div className="text-white text-xs py-1"> {variableName} = </div>
            <pre>
              <Input
                type="text"
                classNames={{
                  input: "text-xs text-white py-4 text-xs",
                  inputWrapper: "bg-gray-600 bg-opacity-50 p-4 rounded-lg",
                }}
                value={variableValue}
                onValueChange={(value: string) =>
                  handleModifyTestcase(selectedCase, variableName, value)
                }
              />
            </pre>
          </div>
        )
      )}
    </div>
  );
};

export default TestCases;
