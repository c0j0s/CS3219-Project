"use client";

import Workspace from "@/components/collab/Workspace";
import { FC, useEffect } from "react";
import { useCollabContext } from "@/contexts/collab";
import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import ChatSpaceToggle from "@/components/collab/chat/ChatSpaceToggle";
import { notFound, useSearchParams } from "next/navigation";

interface pageProps {
  params: {
    roomId: string;
  };
}

const page = ({ params: { roomId } }: pageProps) => {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get("partnerId")!;
  const questionId = searchParams.get("questionId")!;
  const language = searchParams.get("language")!;

  const {
    socketService,
    handleConnectToRoom,
    handleDisconnectFromRoom,
    isLoading,
    isNotFoundError,
  } = useCollabContext();

  useEffect(() => {
    if (!socketService) {
      handleConnectToRoom(roomId, questionId, partnerId, language);
    }

    if (isNotFoundError) {
      console.log("EROR");
      return notFound();
    }

    return () => {
      console.log("Running handleDisconnectFromRoom");
      if (socketService) {
        handleDisconnectFromRoom();
      }
    };
  }, [socketService]);

  return (
    <div>
      {isLoading && !socketService ? (
        <LogoLoadingComponent />
      ) : (
        <>
          <Workspace />
          <ChatSpaceToggle />
        </>
      )}
    </div>
  );
};

export default page;
