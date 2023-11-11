import supertest from "supertest";
import HttpStatusCode from "../../common/HttpStatusCode";
import { createIntegrationTestServer } from "../utils/server";

const app = createIntegrationTestServer();

// env variables
process.env.NODE_ENV = "test";

describe("POST /auth/api/loginByEmail", () => {
  describe("Given a valid request body", () => {
    it("should return 200 with a success flag", async () => {
      // Assign
      const requestBody = {
        email: process.env.TEST_AUTH_USER_EMAIL,
        password: process.env.TEST_AUTH_USER_PASSWORD,
      };

      // Act
      const response = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          user: expect.any(Object),
        })
      );
    });
  });

  describe("Given a non-existing user email", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const requestBody = {
        email: "non-existing-user-email",
        password: "non-existing-user-password",
      };

      // Act
      const response = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORIZED",
        message: "The user credentials are incorrect.",
      });
    });
  });

  describe("Given an incorrect password", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const requestBody = {
        email: process.env.TEST_AUTH_USER_EMAIL,
        password: "incorrect-password",
      };

      // Act
      const response = await supertest(app)
        .post("/auth/api/loginByEmail")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORIZED",
        message: "The user credentials are incorrect.",
      });
    });
  });
});
