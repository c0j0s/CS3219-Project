import SocketService from "@/helpers/matching/socket_service";
import { getQuestionByPreference } from "@/helpers/question/question_api_wrappers";
import { useAuthContext } from "@/contexts/auth";
import Question from "@/types/question";
import { Button, Chip, CircularProgress, ModalBody, Tooltip, ModalHeader, Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Icons } from "../common/Icons";
import ComplexityChip from "../question/ComplexityChip";
import displayToast from "../common/Toast";
import { ToastType } from "@/types/enums";

export default function MatchingLobbyPrepCollabView({
    onClose,
    onError
}: {
    onClose: () => void;
    onError: () => void;
}) {
    const user = useAuthContext();
    const [socketService, setSocketService] = useState<SocketService | null>(null);
    const [questionOptions, setQuestionOptions] = useState<Question[]>([]);
    const [question, setQuestion] = useState<string[]>([]);
    const [isLoading, setIsloading] = useState(true);
    const [noQuestion, setNoQuestion] = useState(false);


    const handleStart = () => {
        try {
            if (question[0] === "") {
                displayToast("Please select a question.", ToastType.WARNING);
                return;
            }
            socketService?.requestStartCollaboration(Array.from(question)[0] || "");
            setIsloading(true);
        } catch (error) {
            onError();
        }
    }

    useEffect(() => {
        async function initializeSocket() {
            await SocketService.getInstance().then(async socket => {
                setSocketService(socket);
                // contact question service
                const preference = socket.getRoomPreference() ?? user.user.preferences;
                await getQuestionByPreference(preference).then(questions => {
                    if (questions.length > 1) {
                        // let user choose if options available
                        setQuestionOptions(questions);
                        setIsloading(false);
                    } else if (questions.length === 1) {
                        // redirect if no selection available
                        socket.requestStartCollaboration(questions[0].id!);
                    } else {
                        setNoQuestion(true);
                        setIsloading(false);
                    }
                }).catch(err => {
                    onError()
                })
            }).catch(err => {
                onError()
            })

        }
        initializeSocket();
    }, [])

    return (
        <>
            <ModalHeader>
                Setting up Peerprep
            </ModalHeader>
            <ModalBody className="p-4 px-6">
                <div className="flex flex-col gap-2 items-center justify-center">
                    {!isLoading && questionOptions.length > 0 &&
                        <div className="flex flex-row items-end gap-2 w-full">
                            <Select
                                label="Select a question for Peerprep"
                                labelPlacement="outside"
                                selectedKeys={question}
                                onChange={e => setQuestion([e.target.value])}
                            >
                                {questionOptions.map(question => <SelectItem key={question.id || "-1"} textValue={question.title || "-1"}>
                                    <div className="flex flex-col gap-1">
                                        <div>
                                            {question.title}
                                        </div>
                                        <Tooltip className="capitalize" content={question.topics.join(", ").toLowerCase()} isDisabled={question.topics.length < 3}>
                                            <div className="flex flex-row gap-1 overflow-x-hidden text-sm">
                                                <ComplexityChip complexity={question.complexity} size="sm"></ComplexityChip>
                                                {question.topics.map(t => (
                                                    <Chip key={t} className="capitalize" size="sm">{t.toLowerCase()}</Chip>
                                                ))}
                                            </div>
                                        </Tooltip>
                                    </div>
                                </SelectItem>)}
                            </Select>
                            <Button onPress={handleStart} color="primary" startContent={<Icons.FiPlay />}>Confirm</Button>
                        </div>
                    }
                    {isLoading &&
                        <CircularProgress
                            classNames={{
                                svg: "w-24 h-24"
                            }} aria-label="Setting up collaboration session">
                        </CircularProgress>
                    }
                    {noQuestion &&
                        <div className="flex flex-col items-center gap-2 text-center pb-4">
                            <Icons.FiX className="w-24 h-24  text-danger" />
                            <p>No questions available!</p>
                            <p>Sorry, unable to find suitable questions, please change your preference.</p>
                            <Button onPress={onClose}>Ok</Button>
                        </div>
                    }
                </div>
            </ModalBody>
        </>
    )
}
