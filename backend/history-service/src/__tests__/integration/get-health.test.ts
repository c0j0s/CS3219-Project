import supertest from "supertest";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import createUnitTestServer from "../utils/server";

const app = createUnitTestServer();

// env variables
process.env.NODE_ENV = "test";

describe("GET /history/api/health", () => {
  it("should return 200 with a message in json", async () => {
    // Act
    const response = await supertest(app).get("/history/api/health");

    // Assert
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body).toEqual({
      message: "healthy",
    });
  });
});
