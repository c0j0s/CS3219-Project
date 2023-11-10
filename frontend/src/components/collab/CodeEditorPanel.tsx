import { useEffect, useState, FC, useRef } from "react";
import CodeEditorNavbar from "./CodeEditorNavbar";
import { Divider } from "@nextui-org/react";
import CodeEditor from "./CodeEditor";
import { getCodeTemplate } from "@/utils/defaultCodeUtils";
import { useCollabContext } from "@/contexts/collab";
import Split from "react-split";
import ConsolePanel from "./console/ConsolePanel";
import ConsoleBar from "./console/ConsoleBar";
import { ConsoleProvider } from "@/contexts/console";
import { notFound } from "next/navigation";
import type monaco from 'monaco-editor';

const CodeEditorPanel: FC = ({}) => {
  const { matchedLanguage, question, socketService } = useCollabContext();

  const isSocketEvent = useRef(false);

  const [currentCode, setCurrentCode] = useState<string>(
    getCodeTemplate(matchedLanguage, question!)
  );

  const [isUserNotValid, setIsUserNotValid] = useState<boolean>(false);

  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);

  const [selectedConsoleTab, setSelectedConsoleTab] =
    useState<string>("testcase");

  useEffect(() => {
    socketService?.receiveCodeUpdate(setCurrentCode, isSocketEvent);
    socketService?.receiveUserNotValid(setIsUserNotValid);
  }, [socketService]);

  useEffect(() => {
    if (isUserNotValid) {
      notFound();
    }
  }, [isUserNotValid]);

  const handleEditorChange = (currentContent: string | undefined) => {
    setCurrentCode(currentContent!);
    socketService?.sendCodeChange(currentContent!);
  };

  const handleResetToDefaultCode = () => {
    setCurrentCode(getCodeTemplate(matchedLanguage, question!));
    socketService!.sendCodeChange(getCodeTemplate(matchedLanguage, question!));
  };

  return (
    <ConsoleProvider>
      <div className="flex flex-col h-[calc(100vh-55px)]">
        <CodeEditorNavbar handleResetToDefaultCode={handleResetToDefaultCode} />
        <Divider className="space-y-2" />
        <Split
          className="flex flex-col h-full overflow-hidden"
          direction="vertical"
          sizes={isConsoleOpen ? [50, 50] : [100, 0]}
          minSize={isConsoleOpen ? [100, 100] : [100, 0]}
          gutterSize={isConsoleOpen ? 10 : 0}
        >
          <CodeEditor
            currentCode={currentCode}
            handleEditorChange={handleEditorChange}
            isSocketEvent={isSocketEvent}
          />
          <ConsolePanel
            isOpen={isConsoleOpen}
            selectedConsoleTab={selectedConsoleTab}
            setSelectedConsoleTab={setSelectedConsoleTab}
          />
        </Split>
        <Divider className="space-y-2" />
        <ConsoleBar
          code={currentCode}
          isConsoleOpen={isConsoleOpen}
          setIsConsoleOpen={setIsConsoleOpen}
          setSelectedConsoleTab={setSelectedConsoleTab}
        />
      </div>
    </ConsoleProvider>
  );
};

export default CodeEditorPanel;
