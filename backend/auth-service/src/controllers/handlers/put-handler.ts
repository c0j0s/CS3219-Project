import { Request, Response } from "express";
import HttpStatusCode from "../../common/HttpStatusCode";
import {
  updateVerfication,
  updatePasswordResetToken,
  updatePassword,
  getUserById,
} from "../../lib/user_api_helpers";
import { ResetPasswordMail } from "../../lib/email/resetPasswordMail";
import jwt from "jsonwebtoken";

const verifyUserEmail = async (request: Request, response: Response) => {
  try {
    const email = request.params.email;
    const token = request.params.token;

    // verify if token is valid
    const secretKey = process.env.EMAIL_VERIFICATION_SECRET!

    const decoded = jwt.verify(token, secretKey) as {email: string};

    console.log(decoded)

    if (decoded.email != email) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Email verification failed."
      })
      return;
    }

    const res = await updateVerfication(email, token);

    if (res.status !== HttpStatusCode.NO_CONTENT) {
      const data = await res.json();
      response.status(res.status).json({
        error: data.error,
        message: data.message,
      });
      return;
    }
    response.status(HttpStatusCode.NO_CONTENT).json({
      success: true,
    });
  } catch(error) {
      response.status(HttpStatusCode.BAD_REQUEST).json({
        error: "BAD REQUEST",
        message: "Email verification failed."
      })
  }
};

const sendPasswordResetEmail = async (request: Request, response: Response) => {
  try {
    const email = request.params.email;
  // generate verification token for email verification
  const secretKey = process.env.EMAIL_RESET_SECRET!

  const passwordResetToken = jwt.sign( {email: email} , secretKey)

  const res = await updatePasswordResetToken(email, {passwordResetToken : passwordResetToken});

  if (res.status !== HttpStatusCode.OK) {
    const data = await res.json();
    response.status(res.status).json({
      error: data.error,
      message: data.message,
    });
    return;
  }

  const user = await res.json();

  const mail = new ResetPasswordMail(
    user.id,
    user.email,
    user.passwordResetToken
  );
  await mail.send();

  response.status(HttpStatusCode.NO_CONTENT).json({
    success: true,
  });
  }
  catch(error) {
    response.status(HttpStatusCode.BAD_REQUEST).json({
      error: "BAD REQUEST",
      message: "Send reset password failed."
    })
  }
  
};

const changePassword = async (request: Request, response: Response) => {
  try{
    const userId = request.params.id;
  const token = request.body.token;

  const user = await (await getUserById(userId)).json();

  // verify if token is valid
  const secretKey = process.env.EMAIL_RESET_SECRET!


  const decoded = jwt.verify(token, secretKey) as { email: string };

  if (decoded.email != user.email) {
    //return error
    response
      .status(HttpStatusCode.BAD_REQUEST)
      .json({ messsage: "Token is wrong." });
    return;
  }

  const updateBody = {
    password: request.body.hashedPassword,
    passwordResetToken: "",
  };

  const res = await updatePassword(userId, updateBody);

  if (res.status !== HttpStatusCode.NO_CONTENT) {
    const data = await res.json();
    response.status(res.status).json({
      error: data.error,
      message: data.message,
    });
    return;
  }

  response.status(HttpStatusCode.NO_CONTENT).json({
    success: true,
  });
  }
  catch(error) { 
    response.status(HttpStatusCode.BAD_REQUEST).json({
      error: "BAD REQUEST",
      message: "Change password failed."
    })
  }

  
};

export { verifyUserEmail, sendPasswordResetEmail, changePassword };
