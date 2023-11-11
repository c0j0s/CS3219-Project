import supertest from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import HttpStatusCode from "../../common/HttpStatusCode";

const app = createIntegrationTestServer();

// env variables
process.env.NODE_ENV = "test";

describe("GET /auth/api/health", () => {
  it("should return 200 and a health check message", async () => {
    // Act
    const response = await supertest(app).get("/auth/api/health");

    // Assert
    expect(response.status).toEqual(HttpStatusCode.OK);
    expect(response.body).toEqual({
      message: "healthy",
    });
  });
});
