"use client";
import { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import { BsSendFill } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import { Button, Divider } from "@nextui-org/react";
import ProfilePictureAvatar from "@/components/common/ProfilePictureAvatar";
import { useCollabContext } from "@/contexts/collab";
import ChatMessage from "@/types/chat_message";

interface IChatSpaceProps {
  onClose: () => void;
}

const ChatSpace = ({ onClose }: IChatSpaceProps) => {
  const { partner, user, socketService } = useCollabContext();

  if (!socketService || !partner || !user) return null;

  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [newMessage, setNewMessages] = useState<ChatMessage>({
    content: "",
    senderId: "",
  });

  const scrollToNewestMessage = () => {
    setTimeout(() => {
      scrollTargetRef!.current!.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    socketService.updateChatMessages(setNewMessages);
  }, []);

  useEffect(() => {
    if (newMessage.content !== "" && newMessage.senderId !== user.id) {
      setMessages([...messages, newMessage]);
      setNewMessages({ content: "", senderId: "" });
      scrollToNewestMessage();
    }
  }, [newMessage]);

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const messageContent = e.currentTarget.message.value;
    if (!messageContent) {
      return;
    }

    const message = {
      content: messageContent,
      senderId: user.id!,
    };

    setMessages([...messages, message]);
    socketService.sendChatMessage(message);

    e.currentTarget.message.value = "";
    scrollToNewestMessage();
  };
  return (
    <div className={`bg-black rounded-xl w-[400px] p-2`}>
      <div className="flex w-full justify-between mb-2">
        <div className="flex items-center gap-2">
          <ProfilePictureAvatar profileUrl={partner.image!} size="8" />

          <span className="font-semibold text-sm"> {partner.name} </span>
        </div>
        <Button isIconOnly variant="light" onPress={onClose}>
          <RxCross2 />
        </Button>
      </div>
      <Divider />

      <div className="py-8 text-base leading-7 text-gray-600 h-[400px] overflow-y-auto">
        <div style={{ display: messages.length === 0 ? "block" : "none" }}>
          <div className="text-center text-gray-400 text-sm">
            No messages yet, send one now!
          </div>
        </div>
        {
          <ul className="space-y-3 px-4">
            {messages.map((item) => (
              <ChatBubble
                key={crypto.randomUUID()}
                message={item}
                isSelf={item.senderId === user.id!}
              />
            ))}
          </ul>
        }
        <div ref={scrollTargetRef}></div>
      </div>
      <form
        onSubmit={handleSubmitMessage}
        className="p-4 flex gap-2 text-base font-semibold leading-7"
      >
        <input
          id="message"
          placeholder="Message"
          autoComplete="off"
          className="px-2 py-2  rounded-md flex-1 font-light text-sm focus:outline-none focus:bg-zinc-800"
        />
        <button className="bg-yellow px-2.5 rounded-md text-black hover:bg-amber-200  active:bg-white">
          <BsSendFill />
        </button>
      </form>
    </div>
  );
};

export default ChatSpace;
