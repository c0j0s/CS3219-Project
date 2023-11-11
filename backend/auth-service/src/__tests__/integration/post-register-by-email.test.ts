import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import HttpStatusCode from "../../common/HttpStatusCode";
import { removeCreatedUser } from "../utils/setup";
import { VerificationMail } from "../../lib/email/verificationMail";

const app = createIntegrationTestServer();

// global envs
process.env.NODE_ENV = "test";

describe("POST /auth/api/registerByEmail", () => {
  describe("Given a valid request body", () => {
    it("should return 201 with a success flag", async () => {
      // Arrange
      const requestBody = {
        name: "New Test User",
        email: "peerpreptest@email.com",
        password: "peerpreptest-password",
        role: "USER",
      };
      // mock the mailer
      const mailerMock = VerificationMail as jest.Mocked<
        typeof VerificationMail
      >;

      mailerMock.prototype.send = jest.fn().mockResolvedValue(true);
      // Act
      const response = await supertest(app)
        .post("/auth/api/registerByEmail")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.CREATED);
      expect(response.body).toEqual({
        success: true,
        userId: expect.any(String),
      });

      // clean up
      await removeCreatedUser(requestBody.email);
    });
  });
});
