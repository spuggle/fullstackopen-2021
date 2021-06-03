const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response, next) => {
  try {
    const foundBlogs = await Blog.find({});

    response.json(foundBlogs);
  } catch (error) {
    next(error);
  }
});

blogRouter.post("/", async (request, response, next) => {
  const providedData = request.body;
  const blogData = {
    title: providedData.title,
    author: providedData.author,
    likes: providedData.likes || 0,
    url: providedData.url
  };

  try {
    const blog = new Blog(blogData);
    const savedBlog = await blog.save();
    response.status(201).json(savedBlog.toJSON());
  } catch (error) {
    next(error);
  }
});

blogRouter.put("/:id", async (request, response, next) => {
  const providedID = request.params.id;
  const providedData = request.body;

  const updateData = {
    likes: providedData.likes
  };

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(providedID, updateData, {
      new: true,
      runValidators: true,
      context: "query"
    });

    response.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

blogRouter.delete("/:id", async (request, response, next) => {
  const givenID = request.params.id;

  try {
    await Blog.findByIdAndRemove(givenID);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = blogRouter;