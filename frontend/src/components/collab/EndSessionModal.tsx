"use client";

import { CLIENT_ROUTES } from "@/common/constants";
import { useCollabContext } from "@/contexts/collab";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EndSessionModal({
  isOpen,
  onClose,
}: EndSessionModalProps) {
  const router = useRouter();

  const { handleDisconnectFromRoom } = useCollabContext();

  const handleTerminateSession = () => {
    // assume we can exit the room by calling an endpoint provided in either collab or matching
    console.log("disconnecting from room");
    handleDisconnectFromRoom();

    onClose();

    router.push(CLIENT_ROUTES.HOME);
  };

  return (
    <>
      <Modal size="sm" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Terminate current session</ModalHeader>
              <Divider className="mb-1" />
              <ModalBody>
                <p>
                  Are you sure you want to exit the current sesion? THis action
                  is irreversible.
                </p>
              </ModalBody>
              <ModalFooter className="mt-2">
                <Button color="primary" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onClick={handleTerminateSession}>
                  Terminate
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
