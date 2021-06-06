const supertest = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

jest.setTimeout(60000);

const helper = require("./test_helper");

jest.setTimeout(15000);

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Blog.deleteMany({})
  ]);

  await helper.prepareDatabases();
});

describe("Fetching blogs", () => {
  test("There are a right amount of blogs", async () => {
    const initialBlogs = await helper.getAllBlogs();
    expect(initialBlogs).toHaveLength(helper.initialBlogs.length);
  });

  test("All blogs contain the `id` property", async () => {
    const allBlogs = await helper.getAllBlogs();

    for (const blog of allBlogs) {
      expect(blog.id).toBeDefined();
    }
  });
});

describe("Creating blogs", () => {
  test("Valid data, valid token: Creates valid blog with status 201", async () => {
    const token = await helper.getRandomValidToken();
    const newBlogData = {
      title: "This is a new blog",
      author: "spuggle",
      url: "some/url",
      likes: 42000
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlogData)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const receivedBlogs = await helper.getAllBlogs();
    expect(receivedBlogs).toHaveLength(helper.initialBlogs.length + 1);

    const blogTitles = receivedBlogs.map(blog => blog.title);
    expect(blogTitles).toContain(newBlogData.title);
  });

  test("No likes, valid token: Creates with `likes` defaulted to `0`", async () => {
    const token = await helper.getRandomValidToken();
    const newBlogData = {
      title: "This is a different blog",
      author: "spuggle",
      url: "some/other/url"
    };

    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlogData)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const createdBlog = response.body;
    expect(createdBlog.likes).toBe(0);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length + 1);
  });

  test("Valid data, malformatted token: Status 404", async () => {
    const token = await helper.getRandomValidToken();
    const newBlogData = {
      title: "This is a new blog",
      author: "spuggle",
      url: "some/url",
      likes: 42000
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `${token}`)
      .send(newBlogData)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);
  });

  test("Valid data, invalid token: Status 401", async () => {
    const newBlogData = {
      title: "This is a new blog",
      author: "spuggle",
      url: "some/url",
      likes: 42000
    };

    await api
      .post("/api/blogs")
      .set("Authorization", "Bearer saotuhsacurcdusrs")
      .send(newBlogData)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);
  });

  test("Valid data, missing token: Status 401", async () => {
    const newBlogData = {
      title: "This is a new blog",
      author: "spuggle",
      url: "some/url",
      likes: 42000
    };

    await api
      .post("/api/blogs")
      .send(newBlogData)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);
  });

  test("Valid data, expired token: Status 401", async () => {
    const expiredToken = await helper.getRandomExpiredToken();
    const newBlogData = {
      title: "This is a new blog",
      author: "spuggle",
      url: "some/url",
      likes: 42000
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${expiredToken}`)
      .send(newBlogData)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);
  });

  test("Missing data, valid token: Status 400", async () => {
    const token = await helper.getRandomValidToken();
    const newBlogData = {};

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlogData)
      .expect(400);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);
  });
});

describe("Updating blogs", () => {
  test("Valid likes, valid token of author: Updates likes with status 200", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const authorToken = helper.createToken(executorAuthor);
    const updatedData = {
      likes: 42000
    };

    const response = await api
      .put(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send(updatedData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const finalBlog = response.body;
    expect(finalBlog.likes).toBe(updatedData.likes);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const processedInitialBlog = JSON.parse(JSON.stringify(
      finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString())
    ));
    expect(processedInitialBlog).toEqual(finalBlog);
  });

  test("Valid likes, malformed token of author: Status 401", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const authorToken = helper.createToken(executorAuthor);
    const updatedData = {
      likes: 42000
    };

    await api
      .put(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", `${authorToken}`)
      .send(updatedData)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const finalBlog = JSON.parse(JSON.stringify(
      finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString())
    ));
    expect(finalBlog.likes).not.toBe(updatedData.likes);
  });

  test("Valid likes, invalid token: Status 401", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const updatedData = {
      likes: 42000
    };

    await api
      .put(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", "Bearer suasouhodusa")
      .send(updatedData)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const finalBlog = JSON.parse(JSON.stringify(
      finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString())
    ));
    expect(finalBlog.likes).not.toBe(updatedData.likes);
  });

  test("Valid likes, expired token of author: Status 401", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const expiredAuthorToken = await helper.getRandomExpiredToken(executorAuthor);
    const updatedData = {
      likes: 42000
    };

    await api
      .put(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", `Bearer ${expiredAuthorToken}`)
      .send(updatedData)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const finalBlog = JSON.parse(JSON.stringify(
      finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString())
    ));
    expect(finalBlog.likes).not.toBe(updatedData.likes);
  });

  test("Valid likes, someone else's token: Status 401", async () => {
    const [executingAuthor, differentAuthor] = await helper.getAllUsers();
    const [initialBlogID] = executingAuthor.blogs;
    const differentAuthorToken = await helper.createToken(differentAuthor);
    const updatedData = {
      likes: 42000
    };

    await api
      .put(`/api/blogs/${initialBlogID.toString()}`)
      .set("Authorization", `Bearer ${differentAuthorToken}`)
      .send(updatedData)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const finalBlog = JSON.parse(JSON.stringify(
      finalBlogs.find(blog => blog.id.toString() === initialBlogID.toString())
    ));
    expect(finalBlog.likes).not.toBe(updatedData.likes);
  });

  test("Invalid data, valid token of author: Status 400", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const authorToken = helper.createToken(executorAuthor);

    await api
      .put(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send({})
      .expect(400);
  });

  test("Invalid data, non-existent valid ID, valid token of author: Status 400", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const authorToken = helper.createToken(executorAuthor);
    const validNonExistingID = await helper.generateValidNonExistingID();

    await api
      .put(`/api/blogs/${validNonExistingID}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send({})
      .expect(400);
  });

  test("Malformed ID,valid token of author: Status 400", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const authorToken = helper.createToken(executorAuthor);

    await api
      .put(`/api/blogs/${helper.malformedID}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send({})
      .expect(400);
  });
});

describe("Deleting blogs", () => {
  test("Valid existing ID, valid token of author: Deletes blog with status 204", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const authorToken = helper.createToken(executorAuthor);

    await api
      .delete(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .expect(204);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length - 1);

    const finalBlog = finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString());
    expect(finalBlog).not.toBeDefined();
  });

  test("Valid existing ID, malformatted token of author: Status 401", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const authorToken = helper.createToken(executorAuthor);

    await api
      .delete(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", `${authorToken}`)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const finalBlog = finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString());
    expect(finalBlog).toBeDefined();
  });

  test("Valid existing ID, expired token of author: Status 401", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const expiredAuthorToken = helper.getRandomExpiredToken(executorAuthor);

    await api
      .delete(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", `Bearer ${expiredAuthorToken}`)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const finalBlog = finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString());
    expect(finalBlog).toBeDefined();
  });

  test("Valid existing ID, invalid token: Status 401", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;

    await api
      .delete(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", "Bearer atoshusaduucruaso")
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const finalBlog = finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString());
    expect(finalBlog).toBeDefined();
  });

  test("Valid existing ID, someone else's token: Status 401", async () => {
    const [executorAuthor, differentAuthor] = await helper.getAllUsers();
    const [selectedBlogID] = executorAuthor.blogs;
    const differentAuthorToken = helper.createToken(differentAuthor);

    await api
      .delete(`/api/blogs/${selectedBlogID.toString()}`)
      .set("Authorization", `${differentAuthorToken}`)
      .expect(401);

    const finalBlogs = await helper.getAllBlogs();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);

    const finalBlog = finalBlogs.find(blog => blog.id.toString() === selectedBlogID.toString());
    expect(finalBlog).toBeDefined();
  });

  test("Valid non-existing ID, valid token of author: Status 400", async () => {
    const [initialBlog] = await helper.generateValidNonExistingID();
    const [executorAuthor] = await helper.getAllUsers();
    const authorToken = helper.createToken(executorAuthor);

    await api
      .delete(`/api/blogs/${initialBlog.id}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .expect(400);
  });

  test("Malformed ID, valid token of author: Status 400", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const authorToken = helper.createToken(executorAuthor);

    await api
      .delete(`/api/blogs/${helper.malformedID}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .expect(400);
  });

  test("No ID, valid token of author: Status 404", async () => {
    const [executorAuthor] = await helper.getAllUsers();
    const authorToken = helper.createToken(executorAuthor);

    await api
      .delete("/api/blogs")
      .set("Authorization", `Bearer ${authorToken}`)
      .expect(404);
  });
});


afterAll(async () => {
  await mongoose.connection.close();
});