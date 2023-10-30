import { useEffect, useRef, useState } from "react";
import CodeEditorNavbar from "./CodeEditorNavbar";
import { Divider } from "@nextui-org/react";
import CodeEditor from "./CodeEditor";
import { getCodeTemplate } from "@/utils/defaultCodeUtils";
import { useCollabContext } from "@/contexts/collab";
import { notFound } from "next/navigation";

const CodeEditorPanel = ({}) => {
  const [error, setError] = useState(false);
  const { matchedLanguage, question, socketService } = useCollabContext();

  if (!socketService) setError(true);

  const questionTitle = question?.title || setError(true);
  const editorRef = useRef(null);
  const [hasSessionTimerEnded, setHasSessionTimerEnded] =
    useState<boolean>(false);

  const [currentCode, setCurrentCode] = useState<string>(
    getCodeTemplate(matchedLanguage, questionTitle!)
  );
  const [isUserNotValid, setIsUserNotValid] = useState<boolean>(false);

  useEffect(() => {
    socketService?.receiveCodeUpdate(setCurrentCode);
    socketService?.receiveUserNotValid(setIsUserNotValid);
  }, [socketService]);

  useEffect(() => {
    if (isUserNotValid) {
      notFound();
    }
  }, [isUserNotValid]);

  const handleEditorChange = (currentContent: string | undefined) => {
    if (!currentContent) setError(true);
    setCurrentCode(currentContent!);
    socketService!.sendCodeChange(currentContent!);
  };

  const handleEditorDidMount = async (editor: any, monaco: any) => {
    editorRef.current = editor;
  };

  const handleResetToDefaultCode = () => {
    setCurrentCode(getCodeTemplate(matchedLanguage, questionTitle!));
    socketService!.sendCodeChange(
      getCodeTemplate(matchedLanguage, questionTitle!)
    );
  };

  if (error) {
    return <></>;
  }

  return (
    <div className="h-[calc(100vh-60px)]">
      <CodeEditorNavbar handleResetToDefaultCode={handleResetToDefaultCode} />
      <Divider className="space-y-2" />
      <CodeEditor
        currentCode={currentCode}
        handleEditorChange={handleEditorChange}
        handleEditorDidMount={handleEditorDidMount}
      />
    </div>
  );
};

export default CodeEditorPanel;
