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

describe("DELETE /history/api/history/user/:userId/question/:questionId", () => {
  describe("Given the user is authenticated", () => {
    beforeAll(async () => {
      jwtCookie = await loginAndCreateHistory("delete");
    });

    afterAll(async () => {
      jwtCookie = await logoutAndDeleteHistory("delete");
    });

    describe("Given a valid and existing userId and questionId with history record", () => {
      it("should return 204 and delete the history as well as the related code submission", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("delete");

        // Act
        const response = await supertest(app)
          .delete(`/history/api/history/user/${userId}/question/${questionId}`)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NO_CONTENT);

        // check if the history and code submission has been deleted
        const getHistoryResponse = await supertest(app)
          .get(`/history/api/history`)
          .query({
            userId: userId,
            questionId: questionId,
          })
          .set("Cookie", jwtCookie);

        expect(getHistoryResponse.status).toEqual(HttpStatusCode.NOT_FOUND);

        const getCodeSubmissionResponse = await supertest(app)
          .get(
            `/history/api/history/user/${userId}/question/${questionId}/code`
          )
          .set("Cookie", jwtCookie);

        expect(getCodeSubmissionResponse.status).toEqual(
          HttpStatusCode.NOT_FOUND
        );
      });
    });

    describe("Given the user does not have history for a specific question id", () => {
      it("should return 404 with an error message", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = "non-existing-question-id";

        // Act
        const response = await supertest(app)
          .delete(`/history/api/history/user/${userId}/question/${questionId}`)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
        expect(response.body).toEqual({
          error: "NOT FOUND",
          message: "The history record does not exist",
        });
      });
    });

    describe("Given the request is not authenticated", () => {
      it("should return 401 with an error message", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("delete");

        // Act
        const response = await supertest(app).delete(
          `/history/api/history/user/${userId}/question/${questionId}`
        );

        // Assert
        expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
        expect(response.body).toEqual({
          error: "UNAUTHORISED",
          message: "Unauthorised",
        });
      });
    });

    describe("Given the request has jwt token but is not authorised", () => {
      it("should return 401 with an error message", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("delete");

        // Act
        const response = await supertest(app)
          .delete(`/history/api/history/user/${userId}/question/${questionId}`)
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
});
