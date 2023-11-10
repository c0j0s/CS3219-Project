import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import Topic from "../../lib/enums/Topic";
import { logOutAndCleanUp, loginAndInsertQuestions } from "../utils/setup";

const app = createIntegrationTestServer();

// global variable cookie
let jwtCookie: string;

// ensure the NODE_ENV is test
process.env.NODE_ENV = "test";

describe("GET /question/api/questions", () => {
  describe("Given there are questions in the database", () => {
    beforeAll(async () => {
      jwtCookie = await loginAndInsertQuestions();
    });

    afterAll(async () => {
      jwtCookie = await logOutAndCleanUp();
    });

    describe("When no query params are provided", () => {
      it("should return 200 with a json array of questions", async () => {
        // Act
        const response = await supertest(app)
          .get("/question/api/questions")
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toBe(HttpStatusCode.OK);
        expect(response.body).toBeTruthy();
        expect(response.body.count).toBeGreaterThanOrEqual(3);
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            {
              id: expect.any(String),
              title: expect.any(String),
              topics: expect.arrayContaining([expect.any(String)]),
              complexity: expect.any(String),
            },
          ])
        );
      });
    });

    describe("When only the topic query param is provided", () => {
      it("should return 200 with a json array of questions", async () => {
        // Arrange
        const topicsToFind = [Topic.GRAPH, Topic.BFS];

        // Act
        const response = await supertest(app)
          .get(`/question/api/questions?topic=${topicsToFind.join("&")}`)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toBe(HttpStatusCode.OK);
        expect(response.body).toEqual({
          count: 1,
          data: [
            {
              id: expect.any(String),
              title: "Question 3",
              topics: [Topic.GRAPH, Topic.BACKTRACKING, Topic.BFS, Topic.DFS],
              complexity: "HARD",
            },
          ],
        });
      });
    });

    describe("When the complexity query param is provided", () => {
      it("should return 200 with a json array of questions", async () => {
        // Arrange
        const complexitiesToFind = ["EASY", "MEDIUM"];

        // Act
        const response = await supertest(app)
          .get(
            `/question/api/questions?complexity=${complexitiesToFind.join("&")}`
          )
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toBe(HttpStatusCode.OK);
        expect(response.body).toEqual({
          count: 1,
          data: [
            {
              id: expect.any(String),
              title: "Question 1",
              topics: [Topic.ARRAY, Topic.STRING],
              complexity: "EASY",
            },
          ],
        });
      });
    });

    describe("When the topic filter spans across multiple questions", () => {
      it("should return 200 with a json array of questions", async () => {
        // Arrange
        const topicsToFind = [Topic.STRING];

        // Act
        const response = await supertest(app)
          .get(`/question/api/questions?topic=${topicsToFind.join("&")}`)
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toBe(HttpStatusCode.OK);
        expect(response.body).toEqual({
          count: 2,
          data: [
            {
              id: expect.any(String),
              title: "Question 1",
              topics: [Topic.ARRAY, Topic.STRING],
              complexity: "EASY",
            },
            {
              id: expect.any(String),
              title: "Question 2",
              topics: [Topic.LINKEDLIST, Topic.TWOPOINTERS, Topic.STRING],
              complexity: "MEDIUM",
            },
          ],
        });
      });
    });

    describe("When both the topic and complexity query params are provided", () => {
      it("should return 200 with a json array of questions", async () => {
        // Arrange
        const topicToFind = Topic.STRING;
        const complexityToFind = "MEDIUM";

        // Act
        const response = await supertest(app)
          .get(
            `/question/api/questions?topic=${topicToFind}&complexity=${complexityToFind}`
          )
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toBe(HttpStatusCode.OK);
        expect(response.body).toEqual({
          count: 1,
          data: [
            {
              id: expect.any(String),
              title: "Question 2",
              topics: [Topic.LINKEDLIST, Topic.TWOPOINTERS, Topic.STRING],
              complexity: "MEDIUM",
            },
          ],
        });
      });
    });

    describe("When the topic and complexity provided do not match any questions", () => {
      it("should return 404 with an error message", async () => {
        // Arrange
        const topicsToFind = [Topic.ARRAY, Topic.GRAPH, Topic.BFS];
        const complexitiesToFind = ["HARD"];

        // Act
        const response = await supertest(app)
          .get(
            `/question/api/questions?topic=${topicsToFind.join(
              "&"
            )}&complexity=${complexitiesToFind.join("&")}`
          )
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
        expect(response.body).toEqual({
          error: "NOT FOUND",
          message: "No questions found",
        });
      });
    });
  });

  describe("Given the request is not authenticated", () => {
    it("should return 401 with an error message", async () => {
      // Act
      const response = await supertest(app).get("/question/api/questions");

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });

  describe("Given the jwt token has correct format but is invalid", () => {
    it("should return 401 with an error message", async () => {
      // Arrange
      const invalidToken = "jwt=this.isAn.InvalidJWTToken;";

      // Act
      const response = await supertest(app)
        .get("/question/api/questions")
        .set("Cookie", invalidToken);

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });
});
