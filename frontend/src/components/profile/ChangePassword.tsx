import { Input, Button, Link, Image } from "@nextui-org/react";
import { useEffect, useState } from "react";
import bcrypt from "bcryptjs-react";
import { useAuthContext } from "@/contexts/auth";
import displayToast from "../common/Toast";
import { ToastType } from "@/types/enums";
import { UserService } from "@/helpers/user/user_api_wrappers";
import User from "@/types/user";
interface ChangePasswordProps {
  setIsChangePassword: (isChangePassword: boolean) => void;
}

export default function ChangePassword({
  setIsChangePassword,
}: ChangePasswordProps) {
  const { user, mutate } = useAuthContext();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [arePasswordsEqual, setArePasswordsEqual] = useState(false);
  const [isPasswordWrong, setIsPasswordWrong] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCheckPasswordVisible, setIsCheckPasswordVisible] = useState(false);

  const validatePassword = async (password: string, hash: string) => {
    const correct = await bcrypt.compare(password, hash);
    setIsPasswordWrong(!correct);
  };

  useEffect(() => {
    if (oldPassword != "" && user.password) {
      validatePassword(oldPassword, user.password);
    }
    setArePasswordsEqual(newPassword === confirmNewPassword);

    if (isPasswordWrong) {
      setErrorMsg("Old password is incorrect.");
    } else if (newPassword !== "" && newPassword.length < 8) {
      setErrorMsg("Password should contain 8 characters or more.");
    } else if (!arePasswordsEqual) {
      setErrorMsg("Passwords do not match.");
    } else {
      setErrorMsg("");
    }
  }, [
    oldPassword,
    newPassword,
    confirmNewPassword,
    arePasswordsEqual,
    isPasswordWrong,
  ]);

  const toggleOldPasswordVisibility = () =>
    setIsOldPasswordVisible(!isOldPasswordVisible);
  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleCheckPasswordVisibility = () =>
    setIsCheckPasswordVisible(!isCheckPasswordVisible);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (errorMsg !== "") {
      displayToast(
        "Please address the errors before submitting.",
        ToastType.ERROR
      );
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const newUser: User = {
      name: user.name,
      email: user.email,
      role: user.role,
      password: hashedNewPassword,
    };

    try {
      await UserService.updateUser(user.id!, newUser);
      await mutate(true);
      displayToast("Password changed successfully.", ToastType.SUCCESS);
    } catch (error) {
      displayToast(
        "Something went wrong. Please refresh and try again.",
        ToastType.ERROR
      );
    }
  };

  return (
    <div>
      <form
        onSubmit={handleChangePassword}
        className="justify-center max-w-xl space-y-4"
      >
        <Input
          variant="bordered"
          type={isOldPasswordVisible ? "text" : "password"}
          label="Old password"
          onInput={(e) => {
            setOldPassword(e.currentTarget.value);
          }}
          endContent={
            <Button
              variant="light"
              className="focus:outline-none p-2"
              size="sm"
              isIconOnly
              onClick={toggleOldPasswordVisibility}
            >
              {isOldPasswordVisible ? (
                <Image src="/assets/eye-hide.svg" />
              ) : (
                <Image src="/assets/eye-show.svg" />
              )}
            </Button>
          }
        />
        <Input
          variant="bordered"
          type={isPasswordVisible ? "text" : "password"}
          label="New password"
          onInput={(e) => {
            setNewPassword(e.currentTarget.value);
          }}
          endContent={
            <Button
              variant="light"
              className="focus:outline-none p-2"
              size="sm"
              isIconOnly
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? (
                <Image src="/assets/eye-hide.svg" />
              ) : (
                <Image src="/assets/eye-show.svg" />
              )}
            </Button>
          }
        />
        <Input
          variant="bordered"
          type={isCheckPasswordVisible ? "text" : "password"}
          label="Re-enter new password"
          onInput={(e) => {
            setConfirmNewPassword(e.currentTarget.value);
          }}
          endContent={
            <Button
              variant="light"
              className="focus:outline-none p-2"
              size="sm"
              isIconOnly
              onClick={toggleCheckPasswordVisibility}
            >
              {isCheckPasswordVisible ? (
                <Image src="/assets/eye-hide.svg" />
              ) : (
                <Image src="/assets/eye-show.svg" />
              )}
            </Button>
          }
        />
        <div className="text-red-500 text-center text-xs font-bold">
          {errorMsg}
        </div>
        <div className="flex flex-row justify-between">
          <Link
            className="cursor-pointer"
            onClick={() => {
              setIsChangePassword(false);
            }}
          >
            Edit information
          </Link>
          <Button type="submit" color="primary">
            Confirm
          </Button>
        </div>
      </form>
    </div>
  );
}
