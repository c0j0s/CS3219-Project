"use client";
import Question from "@/types/question";
import { createContext, useContext, useState } from "react";
import parse from "html-react-parser";
import { CodeExecutorUtils } from "@/utils/codeExecutorUtils";
import { CodeExecutionService } from "@/helpers/code_execution/code_execution_api_wrappers";
import { judge0Response } from "@/types/judge0";
import displayToast from "@/components/common/Toast";
import { ToastType } from "@/types/enums";

interface IConsoleContext {
  isQuestionLoaded: boolean;
  setQuestionInConsoleContext: (
    question: Question,
    matchedLanguage: string
  ) => void;
  testCaseArray: any[];
  initialTestCaseArray: any[];
  deleteTestCase: (index: number) => void;
  addTestCase: (testCase: {}) => void;
  modifyTestCaseArray: (testCases: any[], resetToDefault?: boolean) => void;
  isResultsLoading: boolean;
  runTestCases: (code: string, language: string) => Promise<void>;
  hasCodeRun: boolean;
  shouldProcessInputs: boolean;
}

interface IConsoleProvider {
  children: React.ReactNode;
}

const ConsoleContext = createContext<IConsoleContext>({
  isQuestionLoaded: false,
  setQuestionInConsoleContext: (
    question: Question,
    matchedLanguage: string
  ) => {},
  testCaseArray: [],
  initialTestCaseArray: [],
  deleteTestCase: (index: number) => {},
  addTestCase: (testCase: {}) => {},
  modifyTestCaseArray: (testCases: any[], resetToDefault?: boolean) => {},
  isResultsLoading: false,
  runTestCases: (code: string, language: string) => Promise.resolve(),
  hasCodeRun: false,
  shouldProcessInputs: false,
});

const useConsoleContext = () => useContext(ConsoleContext);

const ConsoleProvider = ({ children }: IConsoleProvider) => {
  const [initialTestCaseArray, setInitialTestCaseArray] = useState<any[]>([]);
  const [testCaseArray, setTestCaseArray] = useState<any[]>([]);
  const [isQuestionLoaded, setIsQuestionLoaded] = useState<boolean>(false);
  const [isResultsLoading, setIsResultsLoading] = useState<boolean>(false);
  const [hasCodeRun, setHasCodeRun] = useState<boolean>(false);
  const [shouldProcessInputs, setShouldProcessInputs] =
    useState<boolean>(false);

  const setQuestionInConsoleContext = (
    question: Question,
    matchedLanguage: string
  ) => {
    if (matchedLanguage === "python" || matchedLanguage === "javascript") {
      setShouldProcessInputs(true);
      const initialTestCaseArray = question.examples?.map(
        (example: any, index: number) => ({
          input: CodeExecutorUtils.extractInputStringToInputDict(
            parse(example.input) as string,
            matchedLanguage
          ),
          output: parse(example.output),
        })
      );
      setInitialTestCaseArray(initialTestCaseArray!);
      setTestCaseArray(structuredClone(initialTestCaseArray!));
    } else {
      setTestCaseArray([{ input: "", output: "" }]);
      setShouldProcessInputs(false);
    }
    setIsQuestionLoaded(true);
  };

  const deleteTestCase = (index: number) => {
    const updatedTestCaseArray = [...testCaseArray];
    updatedTestCaseArray.splice(index, 1);
    setTestCaseArray(updatedTestCaseArray);
  };

  const addTestCase = (testCase: {}) => {
    const updatedTestCaseArray = [...testCaseArray];
    updatedTestCaseArray.push(testCase);
    setTestCaseArray(updatedTestCaseArray);
    setHasCodeRun(false);
  };

  const modifyTestCaseArray = (testCases: any[], resetToDefault?: boolean) => {
    if (resetToDefault) {
      setTestCaseArray(structuredClone(initialTestCaseArray));
    } else {
      setTestCaseArray([...testCases]);
    }
    setHasCodeRun(false);
  };

  const runTestCases = async (code: string, language: string) => {
    try {
      setHasCodeRun(true);
      setIsResultsLoading(true);
      let submissionIds = [];
      for (let i = 0; i < testCaseArray.length; i++) {
        const id = await CodeExecutionService.executeCode(
          code,
          language,
          testCaseArray[i].input
        );
        submissionIds.push(id);
      }

      for (let i = 0; i < submissionIds.length; i++) {
        let result;

        let isResultsReady = false;

        while (!isResultsReady) {
          isResultsReady =
            await CodeExecutionService.checkCodeExecutionStatusReady(
              submissionIds[i]
            );
          if (!isResultsReady) {
            // wait for 1 second to check again
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        result = (await CodeExecutionService.getCodeExecutionOutput(
          submissionIds[i]
        )) as judge0Response;

        testCaseArray[i].isDefaultTestCase = ["java", "cpp"].includes(
          language.toLowerCase()
        )
          ? false
          : testCaseArray[i].output
          ? true
          : false;
        testCaseArray[i].stdout = result.stdout;
        testCaseArray[i].statusId = result.statusId;
        testCaseArray[i].message = result.message;
        testCaseArray[i].compile_output = result.compile_output;
        testCaseArray[i].stderr = result.stderr;
        testCaseArray[i].isCorrect = CodeExecutorUtils.checkCorrectnessOfOutput(
          testCaseArray[i].stdout,
          testCaseArray[i].output
        );
        testCaseArray[i].description = CodeExecutorUtils.getOutputMessage(
          testCaseArray[i].statusId,
          result.description,
          testCaseArray[i].isCorrect,
          testCaseArray[i].isDefaultTestCase
        );
      }
    } catch (e) {
      displayToast(
        "The code execution service is down. Please try again later.",
        ToastType.ERROR
      );
      setHasCodeRun(false);
    } finally {
      setIsResultsLoading(false);
    }
  };

  const context = {
    isQuestionLoaded,
    setQuestionInConsoleContext,
    testCaseArray,
    initialTestCaseArray,
    deleteTestCase,
    addTestCase,
    modifyTestCaseArray,
    isResultsLoading,
    runTestCases,
    hasCodeRun,
    shouldProcessInputs,
  };

  return (
    <ConsoleContext.Provider value={context}>
      {children}
    </ConsoleContext.Provider>
  );
};

export { ConsoleProvider, useConsoleContext };
