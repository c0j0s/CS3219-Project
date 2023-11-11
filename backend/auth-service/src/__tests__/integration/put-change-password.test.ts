import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";
import { createIntegrationTestServer } from "../utils/server";
import {
  getOriginalPassword,
  rollbackPassword,
  setUserToUnverified,
  setUserToVerified,
  updatePasswordResetToken,
} from "../utils/setup";
import { VerificationMail } from "../../lib/email/verificationMail";
import jwt from "jsonwebtoken";

const app = createIntegrationTestServer();

// global env vars
process.env.NODE_ENV = "test";

describe("PUT /changePassword/:id", () => {
  describe("Given a valid change password request due to forget password", () => {
    it("should return 204 and change the password", async () => {
      // Arrange
      const userId = process.env.TEST_AUTH_USER_ID!;
      const email = process.env.TEST_AUTH_USER_EMAIL!;
      const token = jwt.sign({ email: email }, process.env.EMAIL_RESET_SECRET!);

      const originalPassword = (await getOriginalPassword(userId)) as string;

      await updatePasswordResetToken(token);

      // Act
      const response = await supertest(app)
        .put(`/auth/api/changePassword/${userId}`)
        .send({
          token: token,
          hashedNewPassword: "newPassword",
        });

      // Assert
      expect(response.status).toBe(HttpStatusCode.NO_CONTENT);

      // Clean up
      await rollbackPassword(userId, originalPassword);
    });
  });

  describe("Given a valid change password request that is requested by the authenticated user", () => {
    it("should return 204 and change the password", async () => {
      // Arrange
      const userId = process.env.TEST_AUTH_USER_ID!;
      const originalPassword = (await getOriginalPassword(userId)) as string;

      // Act
      const response = await supertest(app)
        .put(`/auth/api/changePassword/${userId}`)
        .send({
          oldPassword: process.env.TEST_AUTH_USER_PASSWORD!,
          hashedNewPassword: "newPassword",
        });

      // Assert
      expect(response.status).toBe(HttpStatusCode.NO_CONTENT);

      // Clean up
      await rollbackPassword(userId, originalPassword);
    });
  });

  describe("Given the user does not exist", () => {
    it("should return 403 with an error message", async () => {
      // Arrange
      const userId = "fakeUserId";

      // Act
      const response = await supertest(app)
        .put(`/auth/api/changePassword/${userId}`)
        .send({
          oldPassword: process.env.TEST_AUTH_USER_PASSWORD!,
          hashedNewPassword: "newPassword",
        });

      // Assert
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "You don't have the permission to change password.",
      });
    });
  });

  describe("Given the old password does not match", () => {
    it("should return 403 with an error message", async () => {
      // Arrange
      const userId = process.env.TEST_AUTH_USER_ID!;

      // Act
      const response = await supertest(app)
        .put(`/auth/api/changePassword/${userId}`)
        .send({
          oldPassword: "fakeOldPassword",
          hashedNewPassword: "newPassword",
        });

      // Assert
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "You don't have the permission to change password.",
      });
    });
  });

  describe("Given the token is invalid", () => {
    it("should return 403 with an error message", async () => {
      // Arrange
      const userId = process.env.TEST_AUTH_USER_ID!;
      const token = "fakeToken";

      // Act
      const response = await supertest(app)
        .put(`/auth/api/changePassword/${userId}`)
        .send({
          token: token,
          hashedNewPassword: "newPassword",
        });

      // Assert
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "This reset password link is invalid.",
      });
    });
  });
});
