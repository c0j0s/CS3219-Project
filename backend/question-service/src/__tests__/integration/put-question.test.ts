import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import {
  logOutAndCleanUp,
  login,
  loginAndInsertSingleQuestion,
} from "../utils/setup";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import Topic from "../../lib/enums/Topic";

const app = createIntegrationTestServer();

// global variable cookie
let jwtCookie: string;

// ensure the NODE_ENV is test
process.env.NODE_ENV = "test";

describe("PUT /question/api/questions/:questionId", () => {
  describe("Given there is modification to the database", () => {
    beforeAll(async () => {
      jwtCookie = await loginAndInsertSingleQuestion(
        "update-question-id",
        "Put Question Title"
      );
    });

    afterAll(async () => {
      jwtCookie = await logOutAndCleanUp("Put Question Title");
    });

    describe("Given a valid request body with admin role", () => {
      it("should return 204 and update the question", async () => {
        // Assign
        const requestBody = {
          topics: [Topic.MATH],
          complexity: "HARD",
          description: "Updated Question description",
          url: "https://www.leetcode.com/problems/put-question-title",
        };

        // Act
        const response = await supertest(app)
          .put("/question/api/questions/update-question-id")
          .set("Cookie", jwtCookie)
          .send(requestBody);

        // Assert
        expect(response.status).toBe(HttpStatusCode.NO_CONTENT);

        const question = await supertest(app)
          .get("/question/api/questions/update-question-id")
          .set("Cookie", jwtCookie);

        expect(question.body.topics).toEqual([Topic.MATH]);
      });
    });

    describe("Given the new title is already taken", () => {
      it("should return 409 with an error message", async () => {
        // Assign
        await loginAndInsertSingleQuestion(
          "duplicate-question-id",
          "Duplicate Question Title"
        );

        const requestBody = {
          title: "Duplicate Question Title",
        };

        // Act
        const response = await supertest(app)
          .put("/question/api/questions/update-question-id")
          .set("Cookie", jwtCookie)
          .send(requestBody);

        // Assert
        expect(response.status).toBe(HttpStatusCode.CONFLICT);
        expect(response.body).toEqual({
          error: "CONFLICT",
          message: "Question title already exists",
        });

        // clean up
        await logOutAndCleanUp("Duplicate Question Title");
      });
    });

    describe("Given the question id does not exist", () => {
      it("should return 404 with an error message", async () => {
        // Assign
        const requestBody = {
          title: "Put Question Title",
        };

        // Act
        const response = await supertest(app)
          .put("/question/api/questions/invalid-question-id")
          .set("Cookie", jwtCookie)
          .send(requestBody);

        // Assert
        expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
        expect(response.body).toEqual({
          error: "NOT FOUND",
          message: "Question with id invalid-question-id not found.",
        });
      });
    });
  });

  describe("Given the request is not authenticated", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const requestBody = {
        title: "Put Question Title",
      };

      // Act
      const response = await supertest(app)
        .put("/question/api/questions/invalid-question-id")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });

  describe("Given the request is authenticated but the user is not an admin", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const userRoleCookie = await login("USER");
      const requestBody = {
        title: "Put Question Title",
      };

      // Act
      const response = await supertest(app)
        .put("/question/api/questions/invalid-question-id")
        .set("Cookie", userRoleCookie)
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        error: "FORBIDDEN",
        message: "You are not authorized to access this resource.",
      });
    });
  });
});
