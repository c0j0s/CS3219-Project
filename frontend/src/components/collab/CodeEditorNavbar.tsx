"use client";

import { FC, useEffect, useState } from "react";
import { Icons } from "../common/Icons";
import { Button, Code, Spacer, useDisclosure } from "@nextui-org/react";
import CodeEditorNavBarTooltip from "./CodeEditorNavBarTooltip";
import ProfilePictureAvatar from "../common/ProfilePictureAvatar";
import Timer from "./Timer";
import EndSessionModal from "./EndSessionModal";
import { useCollabContext } from "@/contexts/collab";

interface CodeEditorNavbarProps {
  handleResetToDefaultCode: () => void;
}

const CodeEditorNavbar: FC<CodeEditorNavbarProps> = ({
  handleResetToDefaultCode,
}) => {
  const { partner, matchedLanguage, isSocketConnected } = useCollabContext();
  const language = matchedLanguage || "";
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  const handleFullScreen = () => {
    if (isFullScreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    function exitHandler(e: any) {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        return;
      }
      setIsFullScreen(true);
    }

    if (document.addEventListener) {
      document.addEventListener("fullscreenchange", exitHandler);
      document.addEventListener("webkitfullscreenchange", exitHandler);
      document.addEventListener("mozfullscreenchange", exitHandler);
      document.addEventListener("MSFullscreenChange", exitHandler);
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (partner) {
      setIsReady(true);
    }
  }, [partner]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className="flex items-center justify-between h-11 w-full">
      <div className="flex items-center m-2">
        <div className="text-lg">
          <Icons.BsFileEarmarkCode />
        </div>
        <CodeEditorNavBarTooltip content={`Code using ${language}`}>
          <Code className="text-sm bg-gray-400 bg-opacity-50 mx-2 text-opacity-80 capitalize">
            {language}
          </Code>
        </CodeEditorNavBarTooltip>
      </div>

      <Spacer />

      {isSocketConnected ? (
        <CodeEditorNavBarTooltip content="Connected">
          <div>
            <Icons.MdSignalWifiStatusbar4Bar />
          </div>
        </CodeEditorNavBarTooltip>
      ) : (
        <CodeEditorNavBarTooltip content="Disconnected">
          <div>
            <Icons.MdSignalWifiConnectedNoInternet0 />
          </div>
        </CodeEditorNavBarTooltip>
      )}

      <Spacer />

      {isReady ? (
        <CodeEditorNavBarTooltip content="Timer">
          <div>
            <Timer />
          </div>
        </CodeEditorNavBarTooltip>
      ) : (
        <></>
      )}

      {/* Show partner avatar */}
      {partner?.name ? (
        <div className="flex items-center justify-end m-2">
          <CodeEditorNavBarTooltip content={partner.name}>
            <div>
              <ProfilePictureAvatar profileUrl={partner.image!} size="8" />
            </div>
          </CodeEditorNavBarTooltip>
        </div>
      ) : (
        <></>
      )}

      {/* Buttons for some interaction */}
      <div className="flex items-center m-2">
        <div className="mx-1">
          <CodeEditorNavBarTooltip content="Reset to default code definition">
            <Button
              size="sm"
              isIconOnly={true}
              onClick={handleResetToDefaultCode}
            >
              <Icons.RxReset color="white" />
            </Button>
          </CodeEditorNavBarTooltip>
        </div>

        <div className="mx-1">
          <CodeEditorNavBarTooltip content="Full Screen">
            <Button size="sm" isIconOnly={true} onClick={handleFullScreen}>
              {!isFullScreen ? (
                <Icons.BiFullscreen />
              ) : (
                <Icons.BiExitFullscreen />
              )}
            </Button>
          </CodeEditorNavBarTooltip>
        </div>

        <div className="mx-1">
          <CodeEditorNavBarTooltip content="End the session">
            <Button
              size="sm"
              radius="sm"
              onClick={onOpen}
              className="bg-red-600 font-medium"
            >
              End Session
            </Button>
          </CodeEditorNavBarTooltip>
          <EndSessionModal onClose={onClose} isOpen={isOpen} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorNavbar;
