import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import {
  getQuestionId,
  loginAndCreateHistory,
  logoutAndDeleteHistory,
} from "../utils/setup";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";

const app = createIntegrationTestServer();

// global jwtCookie
let jwtCookie: string;

// env variables
process.env.NODE_ENV = "test";

describe("PUT /history/api/history/user/:userId/question/:questionId/code", () => {
  beforeAll(async () => {
    jwtCookie = await loginAndCreateHistory("put");
  });

  afterAll(async () => {
    jwtCookie = await logoutAndDeleteHistory("put");
  });

  describe("Given a valid request body", () => {
    it("should return 204 and update the code submission", async () => {
      // Assign
      const userId = process.env.TEST_USER_ID!;
      const questionId = getQuestionId("put");
      const requestBody = {
        code: "print('hello world, this has been updated')",
        language: "PYTHON",
      };

      // Act
      const response = await supertest(app)
        .put(`/history/api/history/user/${userId}/question/${questionId}/code`)
        .send(requestBody)
        .set("Cookie", jwtCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.NO_CONTENT);
      // check if the code submission is updated
      const getCodeSubmissionResponse = await supertest(app)
        .get(`/history/api/history/user/${userId}/question/${questionId}/code`)
        .set("Cookie", jwtCookie);

      expect(getCodeSubmissionResponse.status).toEqual(HttpStatusCode.OK);
      expect(getCodeSubmissionResponse.body.count).toEqual(1);
      expect(getCodeSubmissionResponse.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            language: requestBody.language,
            code: requestBody.code,
          }),
        ])
      );
    });
  });

  describe("Given there is no existing code submission", () => {
    it("should return 404 with an error message", async () => {
      // Assign
      const userId = process.env.TEST_USER_ID!;
      const questionId = getQuestionId("put");
      const requestBody = {
        code: 'cout << "hello world" << endl;',
        language: "C++",
      };

      // Act
      const response = await supertest(app)
        .put(`/history/api/history/user/${userId}/question/${questionId}/code`)
        .send(requestBody)
        .set("Cookie", jwtCookie);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "NOT FOUND",
          message:
            "Code submission does not exist, use the POST endpoint instead",
        })
      );
    });
  });

  describe("Given the request is not authenticated", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const userId = process.env.TEST_USER_ID!;
      const questionId = getQuestionId("put");
      const requestBody = {
        code: 'cout << "hello world" << endl;',
        language: "C++",
      };

      // Act
      const response = await supertest(app)
        .put(`/history/api/history/user/${userId}/question/${questionId}/code`)
        .send(requestBody);

      // Assert
      expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });

  describe("Given the request has jwt toke but is not authorised", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const userId = process.env.TEST_USER_ID!;
      const questionId = getQuestionId("put");
      const requestBody = {
        code: 'cout << "hello world" << endl;',
        language: "C++",
      };

      // Act
      const response = await supertest(app)
        .put(`/history/api/history/user/${userId}/question/${questionId}/code`)
        .send(requestBody)
        .set("Cookie", "invalid-jwt-token");

      // Assert
      expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });
});
