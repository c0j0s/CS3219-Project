import { createIntegrationTestServer } from "../utils/server";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { logOutAndCleanUp, loginAndInsertSingleQuestion } from "../utils/setup";
import supertest from "supertest";
import { IntegrationPayloads } from "../utils/payloads/integration.payload";

const app = createIntegrationTestServer();

// global variable cookie
let jwtCookie: string;

// ensure the NODE_ENV is test
process.env.NODE_ENV = "test";

describe("GET /question/api/questions/:questionId", () => {
  beforeAll(async () => {
    jwtCookie = await loginAndInsertSingleQuestion("questionId1");
  });

  afterAll(async () => {
    jwtCookie = await logOutAndCleanUp("Question Title");
  });

  describe("Given a valid questionId", () => {
    it("should return 200 with a json object of the question", async () => {
      // Act
      const response = await supertest(app)
        .get("/question/api/questions/questionId1")
        .set("Cookie", jwtCookie);

      // Assert
      expect(response.status).toBe(HttpStatusCode.OK);
      expect(response.body).toEqual({
        ...IntegrationPayloads.getQuestionResponseBody(),
        createdOn: expect.any(String),
        updatedOn: expect.any(String),
      });
    });
  });

  describe("Given a non-existent questionId", () => {
    it("should return 404 with an error message", async () => {
      // Act
      const response = await supertest(app)
        .get("/question/api/questions/non-existent-questionId")
        .set("Cookie", jwtCookie);

      // Assert
      expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
      expect(response.body).toEqual({
        error: "NOT FOUND",
        message: "Question not found.",
      });
    });
  });

  describe("Given the request is unauthorised", () => {
    it("should return 401 with an error message", async () => {
      // Act
      const response = await supertest(app).get(
        "/question/api/questions/questionId1"
      );

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });
});
