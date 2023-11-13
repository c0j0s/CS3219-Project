import { Example } from "@/types/question";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { IoMdInformationCircle } from "react-icons/io";

export default function QuestionExamplesTable({
  value,
  onValueChange,
}: {
  value: Example[];
  onValueChange?: (value: Example[]) => void;
}) {
  const emptyExample = { input: "", output: "" };
  const [examples, setExamples] = useState<Example[]>([]);

  // Apply changes and pass back to parent
  const handleValue = <K extends keyof Example>(
    id: number,
    key: K,
    value: Example[K]
  ) => {
    if (id >= 0) {
      examples[id] = {
        ...examples[id],
        [key]: value,
      };

      onValueChange!(examples.filter((e) => e.input + e.output !== ""));
    }
  };

  // Handle changes from parent
  useEffect(() => {
    setExamples([...value, emptyExample]);
  }, [value]);

  return (
    <div
      onKeyDownCapture={(e) => {
        if (e.key === " ") {
          e.key = "\u00a0";
        }
      }}
    >
      <Table
        aria-label="table of examples"
        removeWrapper
        topContent={
          <div className="flex flex-row items-center">
            <p className="text-small">Examples</p>
            <Spacer x={1.5} />

            <Popover placement="top-start" offset={10} showArrow>
              <PopoverTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <IoMdInformationCircle size={"17px"} />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-1 py-2 space-y-1">
                  <div className="text-small font-bold">
                    Input Format Guidelines
                  </div>
                  <div className="text-tiny font-semibold">
                    Case 1: Singular Variable
                  </div>
                  <div className="text-tiny">&quot;input&quot;</div>
                  <div className="text-tiny font-semibold">
                    Case 2: Multiple Variables
                  </div>
                  <div className="text-tiny">
                    a = &quot;input1&quot;, b = &quot;input2&quot;
                  </div>
                  <div className="text-tiny font-semibold">Array: [a,b]</div>
                  <div className="text-tiny font-semibold">
                    String: &quot;ab&quot;
                  </div>
                  <div className="text-tiny font-semibold">Null: null</div>
                  <div className="text-tiny font-semibold">
                    Boolean: true/false
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        }
        topContentPlacement="outside"
        classNames={{
          base: "gap-1",
          td: "p-1",
        }}
      >
        <TableHeader>
          <TableColumn>{}</TableColumn>
          <TableColumn>Input</TableColumn>
          <TableColumn>Output</TableColumn>
        </TableHeader>
        <TableBody items={examples}>
          {examples.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{idx + 1}.</TableCell>
              <TableCell>
                <Input
                  type="text"
                  size="sm"
                  value={row.input}
                  onValueChange={(v) => handleValue(idx, "input", v)}
                ></Input>
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  size="sm"
                  value={row.output}
                  onValueChange={(v) => handleValue(idx, "output", v)}
                ></Input>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
