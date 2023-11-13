import { Judge0Language, Judge0Status } from "@/types/judge0";
import { input } from "@nextui-org/react";

/* -------------------------------------------------------------------------- */
/*                               Code Execution                               */
/* -------------------------------------------------------------------------- */
const prepareCodeForExecution = (
  inputDict: { [variableName: string]: string },
  code: string,
  language: string
) => {
  const formattedInputStrings = getFormattedInputVariables(inputDict, language);

  const formattedCode = `${formattedInputStrings}\n${code}`;

  return formattedCode;
};

const checkCorrectnessOfOutput = (
  actualOutput: string,
  expectedOutput: string
) => {
  if (expectedOutput === "") {
    return false;
  }

  if (actualOutput === "" && expectedOutput !== "") {
    return false;
  }

  //standardise "" to '
  actualOutput = actualOutput.replace(/"/g, "'");
  expectedOutput = expectedOutput.replace(/"/g, "'");

  //remove leading and trailing whitespace
  actualOutput = actualOutput.trim();
  expectedOutput = expectedOutput.trim();

  if (getVariableType(expectedOutput) === VariableType.STRING) {
    return (
      actualOutput === expectedOutput.substring(1, expectedOutput.length - 1)
    );
  }
  if (getVariableType(expectedOutput) === VariableType.INTEGER) {
    return parseInt(actualOutput) === parseInt(expectedOutput);
  }
  if (getVariableType(expectedOutput) === VariableType.DOUBLE) {
    return parseFloat(actualOutput) === parseFloat(expectedOutput);
  }
  if (getVariableType(expectedOutput) === VariableType.BOOLEAN) {
    return actualOutput.toLowerCase() === expectedOutput.toLowerCase();
  }
  if (getVariableType(expectedOutput) === VariableType.ARRAY) {
    // Remove whitespace from both strings
    const actualOutputWithoutWhitespace = actualOutput
      .replace(/\s/g, "")
      .trim();
    const expectedOutputWithoutWhitespace = expectedOutput
      .replace(/\s/g, "")
      .trim();
    return actualOutputWithoutWhitespace === expectedOutputWithoutWhitespace;
  }

  return actualOutput === expectedOutput;
};

const getOutputMessage = (
  statusId: number,
  description: string,
  isCorrect: boolean,
  isDefaultTestCase: boolean
) => {
  if (statusId === Judge0Status.ACCEPTED && isDefaultTestCase && isCorrect) {
    return "Correct Answer";
  }
  if (statusId === Judge0Status.ACCEPTED && isDefaultTestCase && !isCorrect) {
    return "Wrong Answer";
  }
  if (statusId === Judge0Status.ACCEPTED && !isDefaultTestCase) {
    return "Code Executed Successfully";
  }

  return description;
};

const getJudge0LanguageId = (language: string) => {
  switch (language) {
    case "python":
      return Judge0Language.PYTHON;
    case "java":
      return Judge0Language.JAVA;
    case "cpp":
      return Judge0Language.CPP;
    case "javascript":
      return Judge0Language.JAVASCRIPT;
    default:
      throw new Error("Language not supported");
  }
};

/* -------------------------------------------------------------------------- */
/*                       Extracting User Input Variables                      */
/* -------------------------------------------------------------------------- */
const extractInputStringToInputDict = (
  inputString: string,
  language: string
) => {
  const inputDict: { [key: string]: string } = {};

  // remove all whitespace after "," if they are inside a bracket []
  inputString = inputString.replace(/\[(.*?)\]/g, (match) => {
    return match.replace(/,\s/g, ",");
  });

  switch (language.toLowerCase()) {
    case "python":
      inputString = inputString
        .replace(/null/g, "None")
        .replace(/true/g, "True")
        .replace(/false/g, "False");
      break;
    case "javascript":
      inputString = inputString
        .replace(/None/g, "null")
        .replace(/True/g, "true")
        .replace(/False/g, "false");
      break;
  }

  const splitInputString = inputString.split(", ");

  if (splitInputString.length === 1) {
    const splitByEqualInputString = inputString.split("=");
    if (splitByEqualInputString.length === 1) {
      // Case 1.1
      // Input: "123"
      // Output: {input: 123}
      inputDict["input"] = splitInputString[0].trim();
    } else {
      // Case 1.2
      // Input: "a=1"
      // Output: {a: 1}
      inputDict[splitByEqualInputString[0].trim()] =
        splitByEqualInputString[1].trim();
    }
  } else {
    // Case 2
    // Input: "a=1, b=2, c=3"
    // Output: {a: 1, b: 2, c: 3}
    splitInputString.map((inputVariable) => {
      const [variableName, variableValue] = inputVariable
        .split("=")
        .map((x) => x.trim());
      inputDict[variableName] = variableValue;
    });
  }

  return inputDict;
};

/* -------------------------------------------------------------------------- */
/*                         Determining Input Variables                        */
/* -------------------------------------------------------------------------- */
const getFormattedInputVariables = (
  inputDict: { [variableName: string]: string },
  language: string
) => {
  let formattedInputVariables = "";
  // iterate through the inputDict and return the input variable formatted as string
  Object.entries(inputDict).forEach(([variableName, variableValue]) => {
    try {
      formattedInputVariables += formatGeneralType(
        variableName,
        variableValue,
        language
      );
    } catch {
      if (language.toLowerCase() === "python") {
        return "#ERROR: Could not process input variables \n";
      } else {
        return "//ERROR: Could not process input variables \n";
      }
    }
  });
  return formattedInputVariables;
};

/* -------------------------------------------------------------------------- */
/*                     Determine the type of the variable                     */
/* -------------------------------------------------------------------------- */
const enum VariableType {
  ARRAY = "array",
  STRING = "string",
  INTEGER = "integer",
  DOUBLE = "double",
  BOOLEAN = "boolean",
}

const getVariableType = (variable: string) => {
  try {
    if (!variable) {
      return VariableType.STRING;
    }

    if (variable.startsWith("[") && variable.endsWith("]")) {
      return VariableType.ARRAY;
    }

    if (variable.startsWith('"') && variable.endsWith('"')) {
      return VariableType.STRING;
    }

    if (variable.includes(".")) {
      return VariableType.DOUBLE;
    }

    if (/^\d+$/.test(variable)) {
      return VariableType.INTEGER;
    }

    if (
      variable.toLowerCase() === "true" ||
      variable.toLowerCase() === "false"
    ) {
      return VariableType.BOOLEAN;
    }
    return VariableType.STRING;
  } catch {
    return VariableType.STRING;
  }
};

/* -------------------------------------------------------------------------- */
/*            Format the input variables based on type and language           */
/* -------------------------------------------------------------------------- */
const formatGeneralType = (
  variableName: string,
  value: string,
  language: string
) => {
  switch (language.toLowerCase()) {
    case "python":
      value = value
        .replace(/null/g, "None")
        .replace(/true/g, "True")
        .replace(/false/g, "False");
      return `${variableName} = ${value}\n`;
    case "javascript":
      value = value
        .replace(/None/g, "null")
        .replace(/True/g, "true")
        .replace(/False/g, "false");
      return `const ${variableName} = ${value};\n`;
    default:
      return "";
  }
};

export const CodeExecutorUtils = {
  prepareCodeForExecution,
  checkCorrectnessOfOutput,
  getOutputMessage,
  getJudge0LanguageId,
  extractInputStringToInputDict,
  getFormattedInputVariables,
  getVariableType,
};
