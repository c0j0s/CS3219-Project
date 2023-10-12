"use client";

import Workspace from "@/components/collab/Workspace";
import { FC, useEffect, useState } from "react";
import { useCollabContext } from "@/contexts/collab";
import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import ChatSpaceToggle from "@/components/collab/chat/ChatSpaceToggle";
import { notFound, useSearchParams } from "next/navigation";
import { getLogger } from "@/helpers/logger";

interface pageProps {
  params: {
    roomId: string;
  };
}

const page: FC<pageProps> = ({ params: { roomId } }) => {
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
    handleConnectToRoom(roomId, questionId, partnerId, language);

    if (isNotFoundError) {
      return notFound();
    }

    return () => {
      console.log("Running handleDisconnectFromRoom");
      handleDisconnectFromRoom();
    };
  }, []);

  return (
    <div>
      {isLoading ? (
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
