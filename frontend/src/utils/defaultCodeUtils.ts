import Question from "@/types/question";
import { StringUtils } from "./stringUtils";
import { CodeExecutorUtils } from "./codeExecutorUtils";

export const getCodeTemplate = (
  language: string,
  question: Question
): string => {
  // transform the question title into a camel case string
  const questionTitle = question.title;

  const formattedQuestionTitle =
    StringUtils.convertStringToCamelCase(questionTitle);

  // test case automation is only supported for python and javascript
  const shouldProcessInputs = ["python", "javascript"].includes(
    language.toLowerCase()
  );

  let formattedInputVariables;
  let formattedExampleInput;
  if (shouldProcessInputs) {
    const inputVariables = question.examples?.[0]?.input;

    const inputDict = CodeExecutorUtils.extractInputStringToInputDict(
      inputVariables!,
      language
    );

    formattedInputVariables = CodeExecutorUtils.getFormattedInputVariables(
      inputDict,
      language
    );

    formattedExampleInput = formatExampleInput(
      formattedInputVariables,
      language
    );
  }

  switch (language.toLowerCase()) {
    case "cpp":
      return `#include <iostream> \n#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n\t//TODO: change the function type and arguments below if necessary\n\tvoid ${formattedQuestionTitle}(/*define your params here*/){\n\t\t\n\t};\n};\n\nint main() {\n\tSolution s;\n\t//TODO: call the necessary functions below \n\t//and print your answer using cout\n\n\treturn 0;\n} `;
    case "java":
      return `public class Main {\n\t//TODO: change the function type and arguments below if necessary\n\tpublic static void ${formattedQuestionTitle}(/*define your params here*/) {\n\t\t\n\t}\n\n\tpublic static void main(String[] args){\n\t\t//TODO: call the necessary functions below \n\t\t//and print your answer using System.out.print()\n\n\t}\n}\n\n`;
    case "python":
      return `${formattedExampleInput}\n#TODO: change the function arguments below \ndef ${formattedQuestionTitle}():\n\treturn\n\n#TODO: call the necessary functions using the reserved input variables\n#and print your answer using print()`;
    case "javascript":
      return `${formattedExampleInput}\nconst ${formattedQuestionTitle} = (/*define your params here*/) => {\n\treturn;\n}\n\n//TODO: call the necessary functions using the reserved input variables\n//and print your answer using console.log()`;
    default:
      return "";
  }
};

const formatExampleInput = (input: string, language: string) => {
  switch (language.toLowerCase()) {
    case "javascript":
      return (
        "/*\n" +
        "This is how the code executor will process the input from testcases:\n" +
        "E.G: Example 1\n" +
        `${input}` +
        "Please reserve these variables and \nuse them in your functions where necessary.\n" +
        "*/" +
        "\n"
      );
    case "python":
      return (
        '"""\n' +
        "This is how the code executor will process the input from testcases:\n" +
        "E.G: Example 1\n" +
        `${input}` +
        "Please reserve these variables and \nuse them in your functions where necessary.\n" +
        '"""' +
        "\n"
      );
    default:
      return "";
  }
};
