const config = require("../utils/config");

const mongoose = require("mongoose");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const api = supertest(app);

const User = require("../models/user");
const Blog = require("../models/blog");

jest.setTimeout(60000);

const helper = require("./test_helper");

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  await helper.prepareDatabases();
});

describe("Fetching a user", () => {
  test("Returns user data with blogs containing fields: `url`, `title`, `author` and `id` and nothing else", async () => {
    const response = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const users = response.body;

    expect(users).toHaveLength(helper.initialUsers.length);

    const [fetchedUser] = users;
    const [fetchedBlog] = fetchedUser.blogs;
    const blogKeys = Object.keys(fetchedBlog);

    expect(blogKeys).toEqual(expect.arrayContaining(["id", "url", "title", "author"]));
  });
});

describe("Creating a user", () => {
  test("Correct data: Creates user with status 200, returns`name` and `username` only", async () => {
    const initialUsers = await helper.getAllUsers();

    const validUserData = {
      name: "spuggle",
      username: "root",
      password: "admin"
    };

    const response = await api
      .post("/api/users")
      .send(validUserData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const finalUsers = await helper.getAllUsers();

    expect(finalUsers).toHaveLength(initialUsers.length + 1);

    const createdUser = response.body;

    expect(createdUser.name).toBe(validUserData.name);
    expect(createdUser.username).toBe(validUserData.username);
    expect(Object.keys(createdUser)).toEqual(expect.arrayContaining(["id", "name", "username"]));
  });

  test("Incomplete data: Status 400", async () => {
    const initialUsers = await helper.getAllUsers();

    await api
      .post("/api/users")
      .send({})
      .expect(400);

    const finalUsers = await helper.getAllUsers();

    expect(finalUsers).toHaveLength(initialUsers.length);
  });

  test("Password length < 3 characters: Status 400", async () => {
    const initialUsers = await helper.getAllUsers();

    const invalidUserData = {
      name: "spuggle",
      username: "admin",
      password: "ro"
    };

    await api
      .post("/api/users")
      .send(invalidUserData)
      .expect(400);

    const finalUsers = await helper.getAllUsers();

    expect(finalUsers).toHaveLength(initialUsers.length);
  });

  test("Username length < 3 characters: Status 400", async () => {
    const initialUsers = await helper.getAllUsers();

    const invalidUserData = {
      name: "spuggle",
      username: "ad",
      password: "root"
    };

    await api
      .post("/api/users")
      .send(invalidUserData)
      .expect(400);

    const finalUsers = await helper.getAllUsers();

    expect(finalUsers).toHaveLength(initialUsers.length);
  });
});

describe("Logging in a user", () => {
  test("Credentials of a valid user: Status 204 and a valid user token", async () => {
    const [initialUser] = helper.initialUsers;

    const response = await api
      .post("/api/login")
      .send(initialUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const { token } = response.body;
    const decodedToken = jwt.verify(token, config.SECRET);

    expect(decodedToken.username).toBe(initialUser.username);
    expect(decodedToken.id).toBe(initialUser._id.toString());
  });

  test("Credentials of a non-existent user: Status 401", async () => {
    const nonExistentCredentials = {
      name: "spuggle",
      username: "developer",
      password: "devlog"
    };

    await api
      .post("/api/login")
      .send(nonExistentCredentials)
      .expect(401);
  });

  test("No credentials: Status 401", async () => {
    await api
      .post("/api/login")
      .send({})
      .expect(401);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});