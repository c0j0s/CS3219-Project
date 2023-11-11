import supertest, { Response } from "supertest";
import { createIntegrationTestServer } from "../utils/server";
import { generateRandomPassword, login, logout } from "../utils/setup";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";

jest.setTimeout(10000);

const app = createIntegrationTestServer();

// global jwtCookie
let jwtCookie: string;

// env variables
process.env.NODE_ENV = "test";

describe("POST /user/api/users", () => {
  beforeAll(async () => {
    jwtCookie = await login();
  });

  afterAll(async () => {
    jwtCookie = await logout();
  });

  describe("Given a valid request body", () => {
    it("should return 201 with a user object in json", async () => {
      // Assign
      const requestBody = {
        name: "Create User",
        email: "createUser@email.com",
        password: generateRandomPassword(),
        role: "USER",
        image: "http://www.createuser.com/image",
        bio: "Create user bio",
        gender: "MALE",
        verificationToken: "createUserVerificationToken",
      };

      // Act
      const response = await supertest(app)
        .post("/user/api/users")
        .set("Cookie", jwtCookie)
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.CREATED);
      expect(response.body).toEqual({
        id: expect.any(String),
        email: requestBody.email,
        message: "User created.",
      });

      // Further verify the user has been created
      const getUserResponse = await supertest(app)
        .get("/user/api/users/email")
        .query({ email: requestBody.email })
        .set("Cookie", jwtCookie);

      expect(getUserResponse.status).toBe(HttpStatusCode.OK);
      isCorrectUser(getUserResponse);

      // Clean up
      await supertest(app)
        .delete(`/user/api/users/${response.body.id}`)
        .set("Cookie", jwtCookie);
    });
  });

  describe("Given the user email already exists", () => {
    it("should return 409 with an error message in json", async () => {
      // Assign
      const requestBody = {
        name: "Create User",
        email: "createUser@email.com",
        password: generateRandomPassword(),
        role: "USER",
        verificationToken: "createUserVerificationToken",
      };
      const createUserResponse = await supertest(app)
        .post("/user/api/users")
        .set("Cookie", jwtCookie)
        .send(requestBody);

      // Act
      const response = await supertest(app)
        .post("/user/api/users")
        .set("Cookie", jwtCookie)
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.CONFLICT);
      expect(response.body).toEqual({
        error: "CONFLICT",
        message: `User with email ${requestBody.email} already exists.`,
      });

      // Clean up
      await supertest(app)
        .delete(`/user/api/users/${createUserResponse.body.id}`)
        .set("Cookie", jwtCookie);
    });
  });

  describe("Given the request is not authenticated", () => {
    it("should return 401 with an error message in json", async () => {
      // Assign
      const requestBody = {
        name: "Create User",
        email: "createUser@email.com",
        password: generateRandomPassword(),
        role: "USER",
        verificationToken: "createUserVerificationToken",
      };

      // Act
      const response = await supertest(app)
        .post("/user/api/users")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });

  describe("Given the request has jwt token but is invalid", () => {
    it("should return 401 with an error message in json", async () => {
      // Assign
      const requestBody = {
        name: "Create User",
        email: "createUser@email.com",
        password: generateRandomPassword(),
        role: "USER",
        verificationToken: "createUserVerificationToken",
      };

      // Act
      const response = await supertest(app)
        .post("/user/api/users")
        .set("Cookie", "jwt=invalid-jwt")
        .send(requestBody);

      // Assert
      expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        error: "UNAUTHORISED",
        message: "Unauthorised",
      });
    });
  });
});

const isCorrectUser = (response: Response) => {
  const expectedProperties = [
    "id",
    "name",
    "email",
    "role",
    "image",
    "bio",
    "gender",
    "preferences",
    "createdOn",
    "updatedOn",
  ];
  expectedProperties.forEach((property) => {
    expect(response.body).toHaveProperty(property);
  });
  expect(response.body.name).toEqual("Create User");
  expect(response.body.email).toEqual("createUser@email.com");
  expect(response.body.image).toEqual("http://www.createuser.com/image");
  expect(response.body.bio).toEqual("Create user bio");
  expect(response.body.gender).toEqual("MALE"),
    expect(response.body.preferences).toEqual({
      languages: ["PYTHON"],
      topics: ["STRING"],
      difficulties: ["EASY"],
    });
  expect(response.body.role).toEqual("USER");
  expect(response.body).not.toHaveProperty("password");
  expect(response.body).not.toHaveProperty("verificationToken");
};
