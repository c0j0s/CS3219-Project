import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import { getQuestionId, login, logout } from "../utils/setup";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { generateCUID } from "../utils/payloads/unit.payloads";

jest.setTimeout(10000);

const app = createIntegrationTestServer();

// global jwtCookie
let jwtCookie: string;

// env variables
process.env.NODE_ENV = "test";

describe("POST /history/api/history", () => {
  describe("Given the user is authenticated", () => {
    beforeAll(async () => {
      jwtCookie = await login();
    });

    afterAll(async () => {
      jwtCookie = await logout();
    });

    describe("Given a valid request body", () => {
      it("should return 201 and create the history", async () => {
        // Assign
        const requestBody = {
          userId: process.env.TEST_USER_ID!,
          questionId: getQuestionId("post"),
          language: "C++",
          code: 'cout << "Hello World" << endl;',
        };

        // Act
        const response = await supertest(app)
          .post(`/history/api/history`)
          .send(requestBody)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.CREATED);

        // check if the history is created
        const getHistoryResponse = await supertest(app)
          .get(`/history/api/history`)
          .query({
            userId: requestBody.userId,
            questionId: requestBody.questionId,
          })
          .set("Cookie", jwtCookie);

        expect(getHistoryResponse.status).toEqual(HttpStatusCode.OK);
        expect(getHistoryResponse.body.count).toEqual(1);
        expect(getHistoryResponse.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              userId: requestBody.userId,
              questionId: requestBody.questionId,
              question: expect.objectContaining({
                title: expect.any(String),
                topics: expect.any(Array),
                complexity: expect.any(String),
              }),
              languages: expect.arrayContaining([requestBody.language]),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          ])
        );

        // Clean up
        const deleteResponse = await supertest(app)
          .delete(
            `/history/api/history/user/${requestBody.userId}/question/${requestBody.questionId}`
          )
          .set("Cookie", jwtCookie);

        expect(deleteResponse.status).toEqual(HttpStatusCode.NO_CONTENT);
      });
    });

    describe("Given the userId and questionId for the history already exists but not the language", () => {
      it("should return 201 and update the history languages field", async () => {
        // Assign
        const firstRequestBody = {
          userId: process.env.TEST_USER_ID!,
          questionId: getQuestionId("post"),
          language: "C++",
          code: 'cout << "Hello World" << endl;',
        };
        await supertest(app)
          .post(`/history/api/history`)
          .send(firstRequestBody)
          .set("Cookie", jwtCookie);

        const requestBody = {
          userId: process.env.TEST_USER_ID!,
          questionId: getQuestionId("post"),
          language: "PYTHON",
          code: 'print("Hello World!")',
        };

        // Act
        const response = await supertest(app)
          .post(`/history/api/history`)
          .send(requestBody)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.CREATED);

        // check if the history is updated
        const getHistoryResponse = await supertest(app)
          .get(`/history/api/history`)
          .query({
            userId: requestBody.userId,
            questionId: requestBody.questionId,
          })
          .set("Cookie", jwtCookie);

        expect(getHistoryResponse.status).toEqual(HttpStatusCode.OK);
        expect(getHistoryResponse.body.count).toEqual(1);
        expect(getHistoryResponse.body.data[0].languages).toEqual([
          "C++",
          "PYTHON",
        ]);

        // Clean up
        const deleteResponse = await supertest(app)
          .delete(
            `/history/api/history/user/${requestBody.userId}/question/${requestBody.questionId}`
          )
          .set("Cookie", jwtCookie);

        expect(deleteResponse.status).toEqual(HttpStatusCode.NO_CONTENT);
      });
    });

    describe("Given the userId and questionId for the history already exists and the language also exists", () => {
      it("should return 409 with an error message", async () => {
        // Assign
        const requestBody = {
          userId: process.env.TEST_USER_ID!,
          questionId: getQuestionId("post"),
          language: "C++",
          code: 'cout << "Hello World" << endl;',
        };
        await supertest(app)
          .post(`/history/api/history`)
          .send(requestBody)
          .set("Cookie", jwtCookie);

        // Act
        const response = await supertest(app)
          .post(`/history/api/history`)
          .send(requestBody)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.CONFLICT);
        expect(response.body).toEqual({
          error: "CONFLICT",
          message: "History already exists",
        });

        // Clean up
        const deleteResponse = await supertest(app)
          .delete(
            `/history/api/history/user/${requestBody.userId}/question/${requestBody.questionId}`
          )
          .set("Cookie", jwtCookie);

        expect(deleteResponse.status).toEqual(HttpStatusCode.NO_CONTENT);
      });
    });

    describe("Given the userId does not exist in the database", () => {
      it("should return 404 with an error message", async () => {
        // Assign
        const requestBody = {
          userId: generateCUID(),
          questionId: getQuestionId("post"),
          language: "C++",
          code: 'cout << "Hello World" << endl;',
        };

        // Act
        const response = await supertest(app)
          .post(`/history/api/history`)
          .send(requestBody)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
        expect(response.body).toEqual({
          error: "NOT FOUND",
          message: "User id cannot be found",
        });
      });
    });

    describe("Given the questionId does not exist in the database", () => {
      it("should return 404 with an error message", async () => {
        // Assign
        const requestBody = {
          userId: process.env.TEST_USER_ID!,
          questionId: generateCUID(),
          language: "C++",
          code: 'cout << "Hello World" << endl;',
        };

        // Act
        const response = await supertest(app)
          .post(`/history/api/history`)
          .send(requestBody)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.NOT_FOUND);
        expect(response.body).toEqual({
          error: "NOT FOUND",
          message: "Question id cannot be found",
        });
      });
    });
  });

  describe("Given the request is not authenticated", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const requestBody = {
        userId: process.env.TEST_USER_ID!,
        questionId: getQuestionId("post"),
        language: "C++",
        code: 'cout << "Hello World" << endl;',
      };

      // Act
      const response = await supertest(app)
        .post(`/history/api/history`)
        .send(requestBody);

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
      const requestBody = {
        userId: process.env.TEST_USER_ID!,
        questionId: getQuestionId("post"),
        language: "C++",
        code: 'cout << "Hello World" << endl;',
      };

      // Act
      const response = await supertest(app)
        .post(`/history/api/history`)
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
