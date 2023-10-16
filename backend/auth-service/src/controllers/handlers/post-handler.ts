import { Request, Response } from "express";
import HttpStatusCode from "../../common/HttpStatusCode";
import { createUser, getUserByEmail } from "../../lib/user_api_helpers";
import { issueJWT, validatePassword } from "../../lib/utils";
import { UserProfile } from "../../common/types";
import { VerificationMail } from "../../lib/email/verificationMail";

const registerByEmail = async (request: Request, response: Response) => {
  const res = await createUser(request.body);
  if (res.status !== HttpStatusCode.CREATED) {
    const data = await res.json();
    response.status(res.status).json({
      error: data.error,
      message: data.message,
    });
    return;
  }

  const user = await res.json();

  const mail = new VerificationMail(user.email, user.verificationToken);
  await mail.send();

  response.status(HttpStatusCode.CREATED).json({
    success: true,
    userId: user.id,
  });
};

const logInByEmail = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  //check if user exists
  const res = await getUserByEmail(email);
  if (res.status !== HttpStatusCode.OK) {
    const data = await res.json();
    response.status(res.status).json({
      error: data.error,
      message: data.message,
    });
    return;
  }

  const user = (await res.json()) as UserProfile;

  //if user exists, check if password is correct
  if (!(await validatePassword(password, user.password))) {
    response.status(HttpStatusCode.UNAUTHORIZED).json({
      error: "UNAUTHORIZED",
      message: `Incorrect password.`,
    });
    return;
  }

  //if password is correct, check if user is verified
  if (!user.isVerified) {
    response.status(HttpStatusCode.FORBIDDEN).json({
      error: "FORBIDDEN",
      message: `User is not verified.`,
    });
    return;
  }

  //user exists + pw is correct + user is verified -> attach cookie and return user
  const tokenObject = issueJWT(user);
  response
    .cookie("jwt", tokenObject, { httpOnly: true, secure: false })
    .status(HttpStatusCode.OK)
    .json({
      success: true,
      user: user,
    });
};

const logOut = async (request: Request, response: Response) => {
  response.clearCookie("jwt");
  response.status(HttpStatusCode.OK).json({
    success: true,
  });
};

export { registerByEmail, logInByEmail, logOut };
