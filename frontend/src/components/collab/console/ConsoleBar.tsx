import { useCollabContext } from "@/contexts/collab";
import { useConsoleContext } from "@/contexts/console";
import { Button, Link, Spacer, Tooltip } from "@nextui-org/react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { AiFillExclamationCircle } from "react-icons/ai";

interface IConsoleBarProps {
  code: string;
  isConsoleOpen: boolean;
  setIsConsoleOpen: (isConsoleOpen: boolean) => void;
  setSelectedConsoleTab: React.Dispatch<React.SetStateAction<string>>;
}

const ConsoleBar = ({
  code,
  isConsoleOpen,
  setIsConsoleOpen,
  setSelectedConsoleTab,
}: IConsoleBarProps) => {
  const { runTestCases, shouldProcessInputs } = useConsoleContext();
  const { matchedLanguage } = useCollabContext();
  const handleConsoleToggle = () => {
    setIsConsoleOpen(!isConsoleOpen);
  };

  const handleRunCode = async () => {
    setSelectedConsoleTab("result");
    setIsConsoleOpen(true);
    runTestCases(code, matchedLanguage);
  };

  return (
    <div className="flex flex-row justify-start px-5 py-2">
      <Link
        href="#"
        color="foreground"
        showAnchorIcon
        anchorIcon={isConsoleOpen ? <FiChevronDown /> : <FiChevronUp />}
        onClick={handleConsoleToggle}
        className="text-sm"
      >
        Console
      </Link>
      <Spacer x={8} />
      <Button size="sm" onPress={handleRunCode}>
        Run
      </Button>
      <Spacer x={4} />
      {!shouldProcessInputs && (
        <>
          <Tooltip
            style={{
              display: ["java", "cpp"].includes(matchedLanguage.toLowerCase())
                ? "inline-block"
                : "none",
            }}
            content="Note that test case automation is only supported for Python and
        Javascript."
            placement="top-start"
          >
            <div className="flex h-full items-center">
              <AiFillExclamationCircle size="17px" color="white" />
            </div>
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default ConsoleBar;
