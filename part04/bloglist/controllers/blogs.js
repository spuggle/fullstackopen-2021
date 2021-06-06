const blogRouter = require("express").Router();

const Blog = require("../models/blog");

blogRouter.get("/", async (request, response, next) => {
  try {
    const foundBlogs = await Blog
      .find({})
      .populate("user", { name: 1, username: 1 });

    response.json(foundBlogs);
  } catch (error) {
    next(error);
  }
});

blogRouter.post("/", async (request, response, next) => {
  const providedData = request.body;

  try {
    const user = request.user;

    const blogData = {
      title: providedData.title,
      author: providedData.author,
      likes: providedData.likes || 0,
      url: providedData.url,
      user: user._id
    };

    const blog = new Blog(blogData);
    const savedBlog = await blog.save();

    user.blogs.push(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog.toJSON());
  } catch (error) {
    next(error);
  }
});

blogRouter.put("/:id", async (request, response, next) => {
  const providedID = request.params.id;
  const providedData = request.body;

  const executor = request.user;

  const updateData = {
    likes: providedData.likes
  };

  try {
    const targetedBlog = await Blog.findById(providedID);

    if (!targetedBlog) {
      return response.status(400).json({ error: `Blog by ID ${providedID} does not exist` });
    }

    if (targetedBlog.user.toString() !== executor._id.toString()) {
      return response.status(401).json({ error: `Blog does not belong to ${executor.name}` });
    }

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
    const executor = request.user;
    const targetedBlog = await Blog.findById(givenID);

    if (!targetedBlog) {
      return response.status(400).json({ error: `Blog by ID ${givenID} does not exist` });
    }

    if (targetedBlog.user.toString() !== executor._id.toString()) {
      return response.status(401).send({ error: `Blog does not belong to ${executor.name}` });
    }

    await targetedBlog.delete();

    executor.blogs = executor.blogs.filter(blogID => blogID.toString() !== targetedBlog._id.toString());
    await executor.save();

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = blogRouter;