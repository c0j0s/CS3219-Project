import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";
import { createIntegrationTestServer } from "../utils/server";
import { setUserToUnverified, setUserToVerified } from "../utils/setup";
import { VerificationMail } from "../../lib/email/verificationMail";

const app = createIntegrationTestServer();

// global env vars
process.env.NODE_ENV = "test";

describe("PUT /auth/api/resendEmailVerification/:email", () => {
  describe("Given a successful request", () => {
    it("should return 204 with no content", async () => {
      // Arrange
      const email = process.env.TEST_AUTH_USER_EMAIL!;
      await setUserToUnverified(email);
      // mock the mailer
      const mailerMock = VerificationMail as jest.Mocked<
        typeof VerificationMail
      >;

      mailerMock.prototype.send = jest.fn().mockResolvedValue(true);

      // Act
      const response = await supertest(app).put(
        `/auth/api/resendVerificationEmail/${email}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.NO_CONTENT);

      // clean up
      await setUserToVerified(email);
    });
  });

  describe("Given the user does not exist", () => {
    it("should return 404 with error message", async () => {
      // Arrange
      const email = "nonexisting@email.com";

      // Act
      const response = await supertest(app).put(
        `/auth/api/resendVerificationEmail/${email}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
      expect(response.body).toEqual({
        error: "NOT FOUND",
        message: `User with email ${email} cannot be found.`,
      });
    });
  });

  describe("Given the user is already verified", () => {
    it("should return 409 with error message", async () => {
      // Arrange
      const email = process.env.TEST_AUTH_USER_EMAIL!;
      await setUserToVerified(email);

      // Act
      const response = await supertest(app).put(
        `/auth/api/resendVerificationEmail/${email}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.CONFLICT);
      expect(response.body).toEqual({
        error: "CONFLICT",
        message: `User with email ${email} is already verified.`,
      });
    });
  });
});
