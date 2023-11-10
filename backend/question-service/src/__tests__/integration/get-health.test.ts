import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";

const app = createIntegrationTestServer();

// ensure the NODE_ENV is test
process.env.NODE_ENV = "test";

describe("GET /health", () => {
  describe("Given the database is connected successfully", () => {
    it("should return 200 with a json message of healthy", async () => {
      // Act
      const response = await supertest(app).get("/question/api/health");

      // Assert
      expect(response.status).toBe(HttpStatusCode.OK);
      expect(response.body).toEqual({ message: "Healthy" });
    });
  });
});
