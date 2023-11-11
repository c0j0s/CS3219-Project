import supertest from "supertest";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { createIntegrationTestServer } from "../utils/server";
import {
  createUserForTest,
  deleteTestUser,
  login,
  logout,
} from "../utils/setup";

const app = createIntegrationTestServer();

// global jwtCookie
let jwtCookie: string;

// env variables
process.env.NODE_ENV = "test";

describe("DELETE /user/api/users/:userId", () => {
  beforeAll(async () => {
    jwtCookie = await login();
    await createUserForTest(false);
  });

  afterAll(async () => {
    try {
      jwtCookie = await logout();
      await deleteTestUser(false);
    } catch (error) {
      return;
    }
  });

  describe("Given a valid userId", () => {
    it("should return 204 and delete the user", async () => {
      // Assign
      const userId = "test-delete-user-id";

      // Act
      const response = await supertest(app)
        .delete(`/user/api/users/${userId}`)
        .set("Cookie", jwtCookie);

      // Assert
      expect(response.status).toBe(HttpStatusCode.NO_CONTENT);

      // Further verify the user has been deleted
      const getUserResponse = await supertest(app)
        .get(`/user/api/users/${userId}`)
        .set("Cookie", jwtCookie);

      expect(getUserResponse.status).toBe(HttpStatusCode.NOT_FOUND);
    });
  });

  describe("Given a non-existent userId", () => {
    it("should return 404 with an error message in json", async () => {
      // Assign
      const userId = "non-existent-user-id";

      // Act
      const response = await supertest(app)
        .delete(`/user/api/users/${userId}`)
        .set("Cookie", jwtCookie);

      // Assert
      expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
      expect(response.body).toEqual({
        error: "NOT FOUND",
        message: `User with id ${userId} cannot be found.`,
      });
    });
  });

  describe("Given the request is not authenticated", () => {
    it("should return 401 with an error message in json", async () => {
      // Assign
      const userId = "test-delete-user-id";

      // Act
      const response = await supertest(app).delete(`/user/api/users/${userId}`);

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });

  describe("Given the request has jwt token but is invalid", () => {
    it("should return 401 with an error message in json", async () => {
      // Assign
      const userId = "test-delete-user-id";

      // Act
      const response = await supertest(app)
        .delete(`/user/api/users/${userId}`)
        .set("Cookie", "jwt=invalid-jwt");

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });
});
