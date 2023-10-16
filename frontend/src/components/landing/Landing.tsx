"use client";
import { useRouter } from "next/navigation";
import PeerPrepLogo from "@/components/common/PeerPrepLogo";
import { Button } from "@nextui-org/react";
import { CLIENT_ROUTES } from "@/common/constants";

const Landing = () => {
  const router = useRouter();
  const handleLogInButtonPress = () => {
    router.push(CLIENT_ROUTES.LOGIN);
  };

  return (
    <div className="grid grid-cols-2 gap-5 h-screen">
      <div className="grid-col-1 relative self-center -left-1/4">
        <PeerPrepLogo width="100%" />
      </div>
      <div className="grid-col-2 self-center">
        <p className="text-[500%] font-semibold"> PeerPrep </p>
        <div className="flex flex-row justify-left gap-4">
          <Button
            className="bg-yellow text-black w-[150px]"
            onPress={handleLogInButtonPress}
          >
            Start Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
