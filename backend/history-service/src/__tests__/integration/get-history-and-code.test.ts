import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import {
  getQuestionId,
  loginAndCreateHistory,
  logoutAndDeleteHistory,
} from "../utils/setup";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { generateCUID } from "../utils/payloads/unit.payloads";

const app = createIntegrationTestServer();

// global jwtCookie
let jwtCookie: string;

// env variables
process.env.NODE_ENV = "test";

describe("Given the user has history", () => {
  beforeAll(async () => {
    jwtCookie = await loginAndCreateHistory("get");
  });

  afterAll(async () => {
    jwtCookie = await logoutAndDeleteHistory("get");
  });

  describe("GET /history/api/history", () => {
    describe("Given a request with valid userId and questionId query params", () => {
      it("should return 200 with the history", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app)
          .get("/history/api/history")
          .query({
            userId: userId,
            questionId: questionId,
          })
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.OK);
        expect(response.body.count).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "test-get-history-id",
              userId: userId,
              questionId: questionId,
              languages: ["PYTHON"],
            }),
          ])
        );
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: "test-get-history-id",
              userId: userId,
              questionId: questionId,
              question: expect.objectContaining({
                title: expect.any(String),
                topics: expect.any(Array),
                complexity: expect.any(String),
              }),
              languages: ["PYTHON"],
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          ])
        );
      });
    });

    describe("Given a request with non-existing userId or questionId query params", () => {
      it("should return 404 with an error message", async () => {
        // Assign
        const userId = generateCUID();
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app)
          .get(`/history/api/history`)
          .query({
            userId: userId,
            questionId: questionId,
          })
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
        expect(response.body).toEqual({
          error: "NOT FOUND",
          message: "No history found",
        });
      });
    });

    describe("Given a request is not authenticated", () => {
      it("should return 401 with an error message", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app)
          .get(`/history/api/history`)
          .query({
            userId: userId,
            questionId: questionId,
          });

        // Assert
        expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
        expect(response.body).toEqual({
          error: "UNAUTHORISED",
          message: "Unauthorised",
        });
      });
    });

    describe("Given a request has jwt token but is not authorised", () => {
      it("should return 401 with an error message", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app)
          .get(`/history/api/history`)
          .query({
            userId: userId,
            questionId: questionId,
          })
          .set("Cookie", "invalid-jwt-cookie");

        // Assert
        expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
        expect(response.body).toEqual({
          error: "UNAUTHORISED",
          message: "Unauthorised",
        });
      });
    });
  });

  describe("GEt /history/user/:userId/question/:questionId/code", () => {
    describe("Given a request with valid userId and questionId params and the code exists", () => {
      it("should return 200 with the code", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app)
          .get(
            `/history/api/history/user/${userId}/question/${questionId}/code`
          )
          .query({ language: "pYtHOn" }) //should be case insensitive
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.OK);
        expect(response.body).toEqual({
          code: "print('hello world')",
          language: "PYTHON",
        });
      });
    });

    describe("Given a request with no language query param and the code exists", () => {
      it("should return 200 with an array of language and code instances", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app)
          .get(
            `/history/api/history/user/${userId}/question/${questionId}/code`
          )
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.OK);
        expect(response.body).toHaveProperty("count");
        expect(response.body).toHaveProperty("data");
        expect(response.body.count).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "print('hello world')",
              language: "PYTHON",
            }),
          ])
        );
      });
    });

    describe("Given a request with non-existing userId", () => {
      it("should return 404 with an error message", async () => {
        // Assign
        const userId = generateCUID();
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app)
          .get(
            `/history/api/history/user/${userId}/question/${questionId}/code`
          )
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
        expect(response.body).toEqual({
          error: "NOT FOUND",
          message: "No code submission found",
        });
      });
    });

    describe("Given a request with no code submission", () => {
      it("should return 404 with an error message", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app)
          .get(
            `/history/api/history/user/${userId}/question/${questionId}/code`
          )
          .query({ language: "JAVA" })
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
        expect(response.body).toEqual({
          error: "NOT FOUND",
          message: "No code submission found",
        });
      });
    });

    describe("Given a request is not authenticated", () => {
      it("should return 401 with an error message", async () => {
        // Assign
        const userId = process.env.TEST_USER_ID!;
        const questionId = getQuestionId("get");

        // Act
        const response = await supertest(app).get(
          `/history/api/history/user/${userId}/question/${questionId}/code`
        );

        // Assert
        expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
        expect(response.body).toEqual({
          error: "UNAUTHORISED",
          message: "Unauthorised",
        });
      });
    });
  });

  describe("Given a request has jwt token but is not authorised", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const userId = process.env.TEST_USER_ID!;
      const questionId = getQuestionId("get");

      // Act
      const response = await supertest(app)
        .get(`/history/api/history/user/${userId}/question/${questionId}/code`)
        .set("Cookie", "invalid-jwt-cookie");

      // Assert
      expect(response.status).toEqual(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });
});
