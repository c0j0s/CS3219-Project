import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";
import { createIntegrationTestServer } from "../utils/server";
import jwt from "jsonwebtoken";
import {
  removePasswordResetToken,
  updatePasswordResetToken,
} from "../utils/setup";

const app = createIntegrationTestServer();

// global envs
process.env.NODE_ENV = "test";

describe("GET /auth/api/verifyPasswordResetLink/:id/:token", () => {
  describe("Given a valid token", () => {
    it("should return 200 with a success flag", async () => {
      // Arrange
      const userId = process.env.TEST_AUTH_USER_ID;
      const token = jwt.sign(
        { email: process.env.TEST_AUTH_USER_EMAIL },
        process.env.EMAIL_RESET_SECRET!
      );

      await updatePasswordResetToken(token);

      // Act
      const response = await supertest(app).get(
        `/auth/api/verifyResetPasswordLinkValidity/${userId}/${token}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.OK);
      expect(response.body).toEqual({ success: true });

      // clean up
      await removePasswordResetToken();
    });
  });

  describe("Given an invalid token", () => {
    it("should return 403 with an error message", async () => {
      // Arrange
      const userId = process.env.TEST_AUTH_USER_ID;
      const token = jwt.sign(
        { email: process.env.TEST_AUTH_USER_EMAIL },
        "invalid secret"
      );

      // Act
      const response = await supertest(app).get(
        `/auth/api/verifyResetPasswordLinkValidity/${userId}/${token}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "This reset password link is invalid.",
      });
    });
  });
});
