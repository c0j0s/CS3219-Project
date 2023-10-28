"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PeerPrepLogo from "@/components/common/PeerPrepLogo";
import ProfilePictureAvatar from "./ProfilePictureAvatar";
import { useAuthContext } from "@/contexts/auth";
import { CLIENT_ROUTES } from "@/common/constants";

const NavBar = () => {
  const {
    user: { image },
    isAuthenticated,
  } = useAuthContext();
  const router = useRouter();
  const handleEditProfileButtonPress = () => {
    router.push(CLIENT_ROUTES.PROFILE);
  };
  const handleLogoutButtonPress = async () => {
    router.push(CLIENT_ROUTES.LOGOUT);
  };

  if (!isAuthenticated) {
    return <></>;
  }
  return (
    <Navbar className="bg-black justify-stretch" maxWidth="full" height="50px">
      <NavbarBrand className="flex-grow-0">
        <Link href={CLIENT_ROUTES.HOME} className="flex items-center gap-1">
          <PeerPrepLogo width="30px" height="30px" />
          <p className="text-white text-2xl font-semibold"> PeerPrep </p>
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4 p-3" justify="start">
        <NavbarItem>
          <Link className="text-light-blue" href={CLIENT_ROUTES.QUESTIONS}>
            Questions
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent as="div" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="outline-none">
              <ProfilePictureAvatar profileUrl={image} />
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions">
            <DropdownSection showDivider>
              <DropdownItem
                key="profile"
                onClick={handleEditProfileButtonPress}
              >
                Edit Profile
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem key="logout" onClick={handleLogoutButtonPress}>
                Logout
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};

export default NavBar;
