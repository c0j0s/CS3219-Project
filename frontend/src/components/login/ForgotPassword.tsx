"use client";
import {
    Card,
    CardBody,
    Spacer,
    Button,
    Input,
    Divider,
    CardHeader,
    Image,
} from "@nextui-org/react";
import React, { useState, useEffect, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthService } from "@/helpers/auth/auth_api_wrappers";
import { ToastType } from "@/types/enums";
import PeerPrepLogo from "@/components/common/PeerPrepLogo";
import bcrypt from "bcryptjs-react";
import displayToast from "@/components/common/Toast";
import { CLIENT_ROUTES } from "@/common/constants";
import LogoLoadingComponent from "../common/LogoLoadingComponent";

export default function ForgotPasswordComponent() {
    // States
    const [userId, setUserId] = useState("");
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [checkPassword, setCheckPassword] = useState("");
    const [arePasswordsEqual, setArePasswordsEqual] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Flags
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false); // redirected from email
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isCheckPasswordVisible, setIsCheckPasswordVisible] = useState(false);

    // Toggles
    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
    const toggleCheckPasswordVisibility = () => setIsCheckPasswordVisible(!isCheckPasswordVisible);

    const router = useRouter();
    const searchParams = useSearchParams();

    async function sendPasswordResetEmail(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (email == "") {
            displayToast("Please enter an email to reset your password.", ToastType.ERROR);
            return;
        }

        try {
            setIsLoading(true);
            const res = await AuthService.sendPasswordResetEmail(email);
            if (res) {
                setIsSubmitted(true);
            }
        } catch (error) {
            displayToast("Something went wrong. Please refresh and try again.", ToastType.ERROR);
        } finally {
            setIsLoading(false);
        }
    }

    async function changeNewPassword(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (errorMsg !== "") {
            displayToast(
                "Sign up failed. Please address the errors before submitting.",
                ToastType.ERROR
            );
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            let res = await AuthService.changePassword(userId, token, hashedPassword);
            if (res) {
                setIsSubmitted(true);
            }
        } catch {
            displayToast(
                "Something went wrong. Please retry the link from your email.",
                ToastType.ERROR
            );
        }
    }

    useEffect(() => {
        setArePasswordsEqual(
            !(password !== checkPassword && password !== "" && checkPassword !== "")
        );

        if (password !== "" && checkPassword !== "" && password.length < 8) {
            setErrorMsg("Password should contain 8 characters or more.");
        } else if (!arePasswordsEqual) {
            setErrorMsg("Passwords do not match. Please try again.");
        } else {
            setErrorMsg("");
        }
    }, [password, checkPassword, setPassword, setCheckPassword, arePasswordsEqual]);

    useEffect(() => {
        const userId = searchParams.get("id");
        const token = searchParams.get("token");

        if (userId && token) {
            setIsChangePassword(true);
            setUserId(userId);
            setToken(token);
        }
    }, []);

    useEffect(() => {
        // call api that takes in email and generates a token that
        console.log("test");
    }, [isSubmitted]);

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="items-center justify-center w-96 mx-auto pt-10 pb-10">
                {!isChangePassword ? (
                    <div className="w-1/2">
                        <PeerPrepLogo />
                        <CardHeader className="justify-center font-bold">
                            Forgot Password
                        </CardHeader>
                        <CardBody className="flex flex-col">
                            <Divider />
                            <Spacer y={5} />
                            <p className="flex text-center">Enter your email address below:</p>
                            <form
                                className="flex flex-col "
                                onSubmit={(e) => {
                                    sendPasswordResetEmail(e);
                                }}
                            >
                                <Spacer y={5} />
                                <Input
                                    placeholder="Email address"
                                    onInput={(e) => {
                                        setEmail(e.currentTarget.value);
                                    }}
                                />
                                <Spacer y={5} />
                                {!isSubmitted && (
                                    <Button color="primary" type="submit" isLoading={isLoading}>
                                        {isLoading ? null : <>Reset Password</>}
                                    </Button>
                                )}
                            </form>
                            {isSubmitted ? (
                                <>
                                    <p className="text-success-500 text-sm py-5">
                                        A reset password email has been sent to your email address.
                                    </p>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            router.push(CLIENT_ROUTES.LOGIN);
                                        }}
                                    >
                                        Back to login
                                    </Button>
                                </>
                            ) : null}
                        </CardBody>
                    </div>
                ) : (
                    <>
                        <form
                            className="w-1/2"
                            onSubmit={(e) => {
                                changeNewPassword(e);
                            }}
                        >
                            <PeerPrepLogo />
                            <CardHeader className="lg font-bold justify-center">
                                PeerPrep
                            </CardHeader>
                            <Spacer y={3} />
                            <Input
                                type={isPasswordVisible ? "text" : "password"}
                                placeholder="Password"
                                isClearable
                                isRequired
                                fullWidth
                                onInput={(e) => {
                                    setPassword(e.currentTarget.value);
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
                            <div className="items-center">
                                <Spacer y={1} />
                                <Input
                                    type={isCheckPasswordVisible ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    isClearable
                                    isRequired
                                    fullWidth
                                    onInput={(e) => {
                                        setCheckPassword(e.currentTarget.value);
                                    }}
                                    endContent={
                                        <Button
                                            variant="light"
                                            className="focus:outline-none p-2"
                                            size="sm"
                                            isIconOnly
                                            onClick={() => toggleCheckPasswordVisibility()}
                                        >
                                            {isCheckPasswordVisible ? (
                                                <Image src="/assets/eye-hide.svg" />
                                            ) : (
                                                <Image src="/assets/eye-show.svg" />
                                            )}
                                        </Button>
                                    }
                                />
                                <Spacer y={1} />
                                <div className="text-red-500 text-center text-xs font-bold">
                                    {errorMsg}
                                </div>
                                {!isSubmitted && (
                                    <div className="flex flex-col items-center pt-5 space-y-5">
                                        <Button type="submit" color="primary" className="w-1/2">
                                            Change
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </form>
                        {isSubmitted ? (
                            <>
                                <p className="text-success-500 text-sm py-5">
                                    Successfully changed
                                </p>
                                <Button
                                    color="primary"
                                    className="w-1/2"
                                    onClick={() => {
                                        router.push(CLIENT_ROUTES.LOGIN);
                                    }}
                                >
                                    Back to login
                                </Button>
                            </>
                        ) : null}
                    </>
                )}
            </Card>
        </div>
    );
}
