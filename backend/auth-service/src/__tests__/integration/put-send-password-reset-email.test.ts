import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";
import { createIntegrationTestServer } from "../utils/server";
import { setUserToUnverified, setUserToVerified } from "../utils/setup";
import { ResetPasswordMail } from "../../lib/email/resetPasswordMail";

const app = createIntegrationTestServer();

// global env vars
process.env.NODE_ENV = "test";

describe("PUT /auth/api/sendPasswordResetEmail/:email", () => {
  describe("Given a valid request", () => {
    it("should return 204 with no content", async () => {
      // Arrange
      const email = process.env.TEST_AUTH_USER_EMAIL!;

      // mock the mailer
      const mailerMock = ResetPasswordMail as jest.Mocked<
        typeof ResetPasswordMail
      >;
      mailerMock.prototype.send = jest.fn().mockReturnValue(true);

      // Act
      const response = await supertest(app).put(
        `/auth/api/sendPasswordResetEmail/${email}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.NO_CONTENT);
    });
  });

  describe("Given the user does not exist", () => {
    it("should return 404 with an error message", async () => {
      // Arrange
      const email = "nonexisting@email.com";

      // Act
      const response = await supertest(app).put(
        `/auth/api/sendPasswordResetEmail/${email}`
      );

      // Assert
      expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
      expect(response.body).toEqual({
        error: "NOT FOUND",
        message: `User with email ${email} cannot be found.`,
      });
    });
  });
});
