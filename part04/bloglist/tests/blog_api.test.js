const supertest = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");
const Blog = require("../models/blog");
const helper = require("./test_helper");

const api = supertest(app);

jest.setTimeout(15000);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

describe("When blogs are fetched", () => {
  test("There are right amount of blogs", async () => {
    const initialBlogs = await helper.getAllBlogs();

    expect(initialBlogs).toHaveLength(helper.initialBlogs.length);
  });

  test("Any one contains the id property", async () => {
    const [initialBlog] = await helper.getAllBlogs();

    expect(initialBlog.id).toBeDefined();
  });
});

describe("When blogs are created", () => {
  test("Correct data creates a valid blog", async () => {
    const newBlogData = {
      title: "This is a new blog",
      author: "spuggle",
      url: "some/url",
      likes: 10
    };

    await api
      .post("/api/blogs")
      .send(newBlogData)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const receivedBlogs = await helper.getAllBlogs();
    const blogTitles = receivedBlogs.map(blog => blog.title);

    expect(receivedBlogs).toHaveLength(helper.initialBlogs.length + 1);
    expect(blogTitles).toContain(newBlogData.title);
  });

  test("When no likes provided, defaults to 0", async () => {
    const newBlogData = {
      title: "This is a different blog",
      author: "spuggle",
      url: "some/other/url"
    };

    const response = await api
      .post("/api/blogs")
      .send(newBlogData)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const createdBlog = response.body;

    expect(createdBlog.likes).toBe(0);
  });

  test("Missing data errors with code 400", async () => {
    const newBlogData = {};

    await api
      .post("/api/blogs")
      .send(newBlogData)
      .expect(400);
  });
});

describe("When blogs are updated", () => {
  test("Valid likes updates the blog", async () => {
    const [initialBlog] = await helper.getAllBlogs();
    const updatedData = {
      likes: 10
    };

    const response = await api
      .put(`/api/blogs/${initialBlog.id}`)
      .send(updatedData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const finalBlog = response.body;
    expect(finalBlog.likes).toBe(updatedData.likes);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const processedInitialBlog = JSON.parse(JSON.stringify(finalBlogs[0]));
    expect(processedInitialBlog).toEqual(finalBlog);
  });

  test("Invalid data errors with code 400", async () => {
    const [initialBlog] = await helper.getAllBlogs();

    await api
      .put(`/api/blogs/${initialBlog.id}`)
      .send({})
      .expect(400);
  });

  test("To a non-existent valid ID errors with code 400", async () => {
    const validNonExistingID = await helper.generateValidNonExistingID();

    await api
      .put(`/api/blogs/${validNonExistingID}`)
      .send({})
      .expect(400);
  });

  test("To a malformed ID errors with code 400", async () => {
    await api
      .put(`/api/blogs/${helper.malformedID}`)
      .send({})
      .expect(400);
  });
});

describe("When blogs are deleted", () => {
  test("Deletes with valid existing ID", async () => {
    const [initialBlog] = await helper.getAllBlogs();

    await api
      .delete(`/api/blogs/${initialBlog.id}`)
      .expect(204);

    const finalBlogs = await helper.getAllBlogs();

    expect(finalBlogs).toHaveLength(helper.initialBlogs.length - 1);
    expect(finalBlogs).not.toContainEqual(initialBlog);
  });

  test("Errors with status code 400 with valid non-existing ID", async () => {
    const [initialBlog] = await helper.generateValidNonExistingID();

    await api
      .delete(`/api/blogs/${initialBlog.id}`)
      .expect(400);
  });

  test("Error with status code 400 with malformed ID", async () => {
    await api
      .delete(`/api/blogs/${helper.malformedID}`)
      .expect(400);
  });
});


afterAll(async () => {
  await mongoose.connection.close();
});