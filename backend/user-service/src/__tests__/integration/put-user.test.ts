import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import {
  createUserForTest,
  deleteTestUser,
  login,
  logout,
} from "../utils/setup";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import db from "../../models/db";

const app = createIntegrationTestServer();

// global jwtCookie
let jwtCookie: string;

// env variables
process.env.NODE_ENV = "test";

describe("PUT /user/api/users/:userId", () => {
  beforeAll(async () => {
    jwtCookie = await login();
    await createUserForTest(true);
  });

  afterAll(async () => {
    jwtCookie = await logout();

    await deleteTestUser(true);
  });

  describe("Given a valid request body", () => {
    it("should return 204 and update the user information", async () => {
      // Assign
      const userId = "test-update-user-id";
      const requestBody = {
        name: "New Name",
        bio: "Updated bio",
        gender: "male",
      };

      // Act
      const response = await supertest(app)
        .put(`/user/api/users/${userId}`)
        .set("Cookie", jwtCookie)
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.NO_CONTENT);

      // Further verify the user has been updated
      const getUserResponse = await supertest(app)
        .get(`/user/api/users/${userId}`)
        .set("Cookie", jwtCookie);

      expect(getUserResponse.status).toBe(HttpStatusCode.OK);
      expect(getUserResponse.body.name).toBe(requestBody.name);
      expect(getUserResponse.body.bio).toBe(requestBody.bio);
      expect(getUserResponse.body.gender).toBe(
        requestBody.gender.toUpperCase()
      );
    });
  });

  describe("Given a non-existent userId", () => {
    it("should return 404 with an error message in json", async () => {
      // Assign
      const userId = "non-existent-user-id";
      const requestBody = {
        bio: "Updated bio",
      };

      // Act
      const response = await supertest(app)
        .put(`/user/api/users/${userId}`)
        .send(requestBody)
        .set("Cookie", jwtCookie);

      // Assert
      expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
      expect(response.body).toEqual({
        error: "NOT FOUND",
        message: `User with id ${userId} cannot be found.`,
      });
    });
  });

  describe("Given the updated email already exists", () => {
    it("should return 409 with an error message in json", async () => {
      // Assign
      const userId = process.env.TEST_USER_SERVICE_USER_ID!;
      const requestBody = {
        email: process.env.TEST_ADMIN_EMAIL!,
      };

      // Act
      const response = await supertest(app)
        .put(`/user/api/users/${userId}`)
        .set("Cookie", jwtCookie)
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.CONFLICT);
      expect(response.body).toEqual({
        error: "CONFLICT",
        message: `User with email ${requestBody.email} already exists.`,
      });
    });
  });

  describe("Given the request is not authenticated", () => {
    it("should return 401 with an error message in json", async () => {
      // Assign
      const userId = process.env.TEST_USER_SERVICE_USER_ID!;
      const requestBody = {
        bio: "Updated bio",
      };

      // Act
      const response = await supertest(app)
        .put(`/user/api/users/${userId}`)
        .send(requestBody);

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
      const userId = process.env.TEST_USER_SERVICE_USER_ID!;
      const requestBody = {
        bio: "Updated bio",
      };

      // Act
      const response = await supertest(app)
        .put(`/user/api/users/${userId}`)
        .send(requestBody)
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
