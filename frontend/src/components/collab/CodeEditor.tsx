import { useCollabContext } from "@/contexts/collab";
import { Editor } from "@monaco-editor/react";
import { FC } from "react";

interface CodeEditorProps {
  currentCode: string;
  handleEditorChange?: (value: any, event: any) => void;
  handleEditorDidMount?: (editor: any, monaco: any) => void;
}

const CodeEditor: FC<CodeEditorProps> = ({
  currentCode,
  handleEditorChange,
  handleEditorDidMount,
}) => {
  const { matchedLanguage } = useCollabContext();
  const language = matchedLanguage || "";

  return (
    <div className="mt-1 p-2">
      <Editor
        width="100%"
        height="84vh"
        theme="vs-dark"
        defaultLanguage={language}
        value={currentCode}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          glyphMargin: false,
          scrollbar: {
            horizontal: "hidden", // Hide horizontal scrollbar
            vertical: "hidden", // Hide vertical scrollbar
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
