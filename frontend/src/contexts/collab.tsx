import { getCollaborationSocketConfig } from "@/helpers/collaboration/collaboration_api_wrappers";
import SocketService from "@/helpers/collaboration/socket_service";
import { getQuestionById } from "@/helpers/question/question_api_wrappers";
import { UserService } from "@/helpers/user/user_api_wrappers";
import Question from "@/types/question";
import User from "@/types/user";
import { notFound } from "next/navigation";
import { createContext, useContext, useRef, useState } from "react";
import { useAuthContext } from "./auth";
import { verifyRoomParamsIntegrity } from "@/utils/hashUtils";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";

interface ICollabContext {
  handleConnectToRoom: (
    roomId: string,
    questionId: string,
    partnerId: string,
    matchedLanguage: string
  ) => Promise<void>;
  initializeSocket: (roomId: string) => Promise<void>;
  handleDisconnectFromRoom: () => void;
  isLoading: boolean;
  socketService: SocketService | undefined;
  isSocketConnected: boolean;
  roomId: string;
  partner: User | undefined;
  user: User | undefined;
  question: Question | undefined;
  matchedLanguage: string;
  isNotFoundError: boolean;
}

interface ICollabProvider {
  children: React.ReactNode;
}

const CollabContext = createContext<ICollabContext>({
  handleConnectToRoom: async (roomId: string) => {},
  initializeSocket: async (roomId: string) => {},
  handleDisconnectFromRoom: () => {},
  isLoading: false,
  socketService: undefined,
  isSocketConnected: false,
  roomId: "",
  partner: undefined,
  user: undefined,
  question: undefined,
  matchedLanguage: "",
  isNotFoundError: false,
});

const useCollabContext = () => useContext(CollabContext);

const CollabProvider = ({ children }: ICollabProvider) => {
  const { user } = useAuthContext();
  const [socketService, setSocketService] = useState<SocketService>();
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [partner, setPartner] = useState<User>();
  const [question, setQuestion] = useState<Question>();
  const [matchedLanguage, setMatchedLanguage] = useState<string>("");
  const [isNotFoundError, setIsNotFoundError] = useState<boolean>(false);

  const initializeSocket = async (roomId: string) => {
    setRoomId(roomId);

    const config = await getCollaborationSocketConfig();
    const newSocket = new SocketService(roomId, config.endpoint, config.path);
    setSocketService(newSocket);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const isConnected = newSocket.getConnectionStatus();
      setIsSocketConnected(isConnected);
      if (!isConnected) {
        newSocket.joinRoom(); // Ensures that socket attempts to rejoin the room if it disconnects
      }
    }, 500);
  };

  const handleConnectToRoom = async (
    roomId: string,
    questionId: string,
    partnerId: string,
    matchedLanguage: string
  ) => {
    setIsLoading(true);
    try {
      console.log("Enter handleConnectToRoom");
      // check if we have an authenticated user, a not-null partnerId, questionId, matchedLanguage, and roomId
      if (!user || !partnerId || !questionId || !matchedLanguage || !roomId) {
        setIsNotFoundError(true);
        return;
      }

      // verify parameters integrity
      const isValidParams = verifyRoomParamsIntegrity(
        roomId,
        user.id!,
        partnerId,
        questionId,
        matchedLanguage
      );

      if (!isValidParams) {
        setIsNotFoundError(true);
        return;
      }

      setMatchedLanguage(matchedLanguage.toLowerCase());

      const promises = [
        UserService.getUserById(partnerId),
        getQuestionById(questionId),
      ];

      Promise.all(promises)
        .then((responses) => {
          const partner = responses[0] as User;
          const question = responses[1] as Question;

          if (!partner || !question) {
            setIsNotFoundError(true);
            return;
          }

          setPartner(partner);
          setQuestion(question);
        })
        .catch((error) => {
          setIsNotFoundError(true);
        });

      if (isNotFoundError) {
        return;
      }

      await initializeSocket(roomId);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectFromRoom = () => {
    // Leave room
    if (socketService) {
      socketService.leaveRoom();
      setSocketService(undefined);
    }
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const context = {
    handleConnectToRoom,
    initializeSocket,
    handleDisconnectFromRoom,
    isLoading,
    socketService,
    isSocketConnected,
    roomId,
    partner,
    user,
    question,
    matchedLanguage,
    isNotFoundError,
  };

  return (
    <CollabContext.Provider value={context}>{children}</CollabContext.Provider>
  );
};

export { useCollabContext, CollabProvider };
