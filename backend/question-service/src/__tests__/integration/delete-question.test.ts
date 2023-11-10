import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import {
  logOutAndCleanUp,
  login,
  loginAndInsertSingleQuestion,
} from "../utils/setup";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";

const app = createIntegrationTestServer();

// global variable cookie
let jwtCookie: string;

// ensure the NODE_ENV is test
process.env.NODE_ENV = "test";

describe("DELETE /question/api/questions/:questionId", () => {
  describe("Given there is modification to the database", () => {
    beforeAll(async () => {
      jwtCookie = await loginAndInsertSingleQuestion(
        "delete-question-id",
        "Delete Question Title"
      );
    });

    afterAll(async () => {
      try {
        jwtCookie = await logOutAndCleanUp("Delete Question Title");
      } catch (error) {
        // if the question has been deleted, there is no need to do anything
        jwtCookie = "";
        return;
      }
    });

    describe("Given a valid request body with admin role", () => {
      it("should return 204 and delete the question", async () => {
        // Act
        const response = await supertest(app)
          .delete("/question/api/questions/delete-question-id")
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toBe(HttpStatusCode.NO_CONTENT);

        const question = await supertest(app)
          .get("/question/api/questions/delete-question-id")
          .set("Cookie", jwtCookie);

        expect(question.status).toEqual(HttpStatusCode.NOT_FOUND);
      });
    });

    describe("Given the question id does not exist", () => {
      it("should return 404 with an error message", async () => {
        // Act
        const response = await supertest(app)
          .delete("/question/api/questions/invalid-question-id")
          .set("Cookie", jwtCookie);

        // Assert
        expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
        expect(response.body.error).toBe("NOT FOUND");
        expect(response.body.message).toBe(
          "Question with id invalid-question-id not found."
        );
      });
    });
  });

  describe("Given the user is not authenticated", () => {
    it("should return 401 with an error message", async () => {
      // Act
      const response = await supertest(app).delete(
        "/question/api/questions/delete-question-id"
      );

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body.error).toBe("UNAUTHORISED");
      expect(response.body.message).toBe("Unauthorised");
    });
  });

  describe("Given the user is authenticated but not an admin", () => {
    it("should return 403 with an error message", async () => {
      // Assign
      const userRoleCookie = await login("USER");

      // Act
      const response = await supertest(app)
        .delete("/question/api/questions/delete-question-id")
        .set("Cookie", userRoleCookie);

      // Assert
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body.error).toBe("FORBIDDEN");
      expect(response.body.message).toBe(
        "You are not authorized to access this resource."
      );
    });
  });
});
