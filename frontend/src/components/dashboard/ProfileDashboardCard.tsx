"use client";

import ProfilePictureAvatar from "@/components/common/ProfilePictureAvatar";
import { useRouter } from "next/navigation";
import { CLIENT_ROUTES } from "@/common/constants";
import { useAuthContext } from "@/contexts/auth";
import { Card } from "@nextui-org/react";

const ProfileDashboardCard = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  const handleEditProfileButtonPress = () => {
    router.push(CLIENT_ROUTES.PROFILE);
  };

  return (
    <Card className="flex flex-col h-full justify-center items-center bg-black rounded-lg p-6 overflow-hidden">
      <div
        onClick={handleEditProfileButtonPress}
        className="hover:pointer gap-4 flex flex-col overflow-hidden justify-center items-center"
      >
        <ProfilePictureAvatar profileUrl={user.image!} isProfileDashboard />
        <p className="break-words w-full text-white text-3l font-semibold text-center">
          {user.name}
        </p>
        <p className="break-words w-full text-white text-sm font-light text-center">
          {user.bio}
        </p>
      </div>
    </Card>
  );
};

export default ProfileDashboardCard;
