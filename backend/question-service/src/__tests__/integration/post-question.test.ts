import supertest from "supertest";
import { IntegrationPayloads } from "../utils/payloads/integration.payload";
import { createIntegrationTestServer } from "../utils/server";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { logOutAndCleanUp, login } from "../utils/setup";

const app = createIntegrationTestServer();

// global variable cookie
let jwtCookie: string;

// ensure the NODE_ENV is test
process.env.NODE_ENV = "test";

describe("POST /question/api/questions", () => {
  describe("Given there is insertion to the database", () => {
    beforeEach(async () => {
      jwtCookie = await login();
    });

    afterEach(async () => {
      jwtCookie = await logOutAndCleanUp("Post Question Title");
    });

    describe("Given a valid request body with admin role", () => {
      it("should return 201 with a success message", async () => {
        // Assign
        const requestBody = IntegrationPayloads.getCreateQuestionRequestBody();

        // Act
        const response = await supertest(app)
          .post("/question/api/questions")
          .set("Cookie", jwtCookie)
          .send(requestBody);

        // Assert
        expect(response.status).toBe(HttpStatusCode.CREATED);
        expect(response.body).toEqual({
          id: expect.any(String),
          message: "Question created.",
        });
      });
    });

    describe("Given the question title already exists", () => {
      it("should return 409 with an error message", async () => {
        // Assign
        const requestBody = IntegrationPayloads.getCreateQuestionRequestBody();

        // Act
        const firstResponse = await supertest(app)
          .post("/question/api/questions")
          .set("Cookie", jwtCookie)
          .send(requestBody);

        expect(firstResponse.status).toBe(HttpStatusCode.CREATED);

        const response = await supertest(app)
          .post("/question/api/questions")
          .set("Cookie", jwtCookie)
          .send(requestBody);

        // Assert
        expect(response.status).toBe(HttpStatusCode.CONFLICT);
        expect(response.body).toEqual({
          error: "CONFLICT",
          message: "Question title already exists",
        });
      });
    });
  });

  describe("Given the request is not authorized", () => {
    it("should return 401 with an error message", async () => {
      // Assign
      const requestBody = IntegrationPayloads.getCreateQuestionRequestBody();

      // Act
      const response = await supertest(app)
        .post("/question/api/questions")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });

  describe("Given the request is not form an admin role user", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const userRoleCookie = await login("USER");
      const requestBody = IntegrationPayloads.getCreateQuestionRequestBody();

      // Act
      const response = await supertest(app)
        .post("/question/api/questions")
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
