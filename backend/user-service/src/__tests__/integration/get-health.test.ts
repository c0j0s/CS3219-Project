import supertest from "supertest";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import { createIntegrationTestServer } from "../utils/server";

const app = createIntegrationTestServer();

// global jwtCookie
let jwtCookie: string;

// env variables
process.env.NODE_ENV = "test";

describe("GET /health", () => {
  it("should return 200 with a message in json", async () => {
    const response = await supertest(app).get("/user/api/health");
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body).toEqual({ message: "healthy" });
  });
});
