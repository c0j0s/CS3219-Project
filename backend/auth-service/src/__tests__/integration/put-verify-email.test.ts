import { createIntegrationTestServer } from "../utils/server";
import jwt from "jsonwebtoken";
import { updateEmailVerificationToken } from "../utils/setup";
import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";

const app = createIntegrationTestServer();

// global envs
process.env.NODE_ENV = "test";

describe("PUT /auth/api/verifyEmail/:email/:token", () => {
  describe("Given a valid email and token", () => {
    it("should return 204 and verify the user", async () => {
      // Arrange
      const email = process.env.TEST_AUTH_USER_EMAIL;
      const token = jwt.sign(
        { email: email },
        process.env.EMAIL_VERIFICATION_SECRET!
      );
      await updateEmailVerificationToken(token);

      // Act
      const response = await supertest(app).put(
        `/auth/api/verifyEmail/${email}/${token}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.NO_CONTENT);
    });
  });

  describe("Given a non-existing email", () => {
    it("should return 404 with an error message", async () => {
      // Arrange
      const email = "non-existing-email@email.com";
      const token = jwt.sign(
        { email: email },
        process.env.EMAIL_VERIFICATION_SECRET!
      );

      // Act
      const response = await supertest(app).put(
        `/auth/api/verifyEmail/${email}/${token}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
      expect(response.body).toEqual({
        error: "NOT FOUND",
        message: `User with email ${email} cannot be found.`,
      });
    });
  });

  describe("Given an invalid token", () => {
    it("should return 403 with an error message", async () => {
      // Arrange
      const email = process.env.TEST_AUTH_USER_EMAIL;
      const token = "invalid-token";

      // Act
      const response = await supertest(app).put(
        `/auth/api/verifyEmail/${email}/${token}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "This verification link is invalid.",
      });
    });
  });
});
