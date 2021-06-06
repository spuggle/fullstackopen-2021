const config = require("../utils/config");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Blog = require("../models/blog");
const User = require("../models/user");

const malformedID = "5a3d5da59070081a82a3445";

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
];

const initialUsers = [
  {
    name: "Robert C. Martin",
    username: "robert",
    password: "cleancoder"
  },
  {
    name: "Edsger W. Dijkstra",
    username: "edsger",
    password: "codedesign"
  },
  {
    name: "Michael Chan",
    username: "michael",
    password: "reactpatterns"
  }
];

const prepareDatabases = async () => {
  const registeredUsers = {};

  const usersBeingRegistered = initialUsers.map(async userData => {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    const user = new User({
      ...userData,
      passwordHash
    });
    const savedUser = await user.save();

    registeredUsers[userData.name] = savedUser;
    userData._id = registeredUsers[userData.name]._id;
    userData.blogs = registeredUsers[userData.name].blogs;
  });

  await Promise.all(usersBeingRegistered);

  const blogsBeingSaved = initialBlogs.map(async initialBlog => {
    const registeredUser = registeredUsers[initialBlog.author];
    initialBlog.user = registeredUser._id;

    const blog = new Blog(initialBlog);
    await blog.save();

    registeredUser.blogs.push(blog);

    if (!initialBlog.user) initialBlog.user = registeredUser._id;
  });

  await Promise.all(blogsBeingSaved);

  const blogsBeingAssigned = Object.values(registeredUsers).map(async user => user.save());

  await Promise.all(blogsBeingAssigned);
};

const getAllBlogs = async () => Blog.find({});

const getAllUsers = async () => User.find({});

const generateValidNonExistingID = async () => {
  const newBlog = new Blog({
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  });
  await newBlog.save();
  await newBlog.delete();

  return newBlog._id.toString();
};

const createToken = (userData, expiresIn = 60 * 60) => {
  const tokenData = {
    username: userData.username,
    id: userData._id
  };
  return jwt.sign(tokenData, config.SECRET, { expiresIn });
};

const getRandomValidToken = () => {
  const [initialUser] = initialUsers;
  return createToken(initialUser);
};

const getRandomExpiredToken = async (givenUser = initialUsers[0]) => {
  const token = createToken(givenUser, 1);
  return new Promise(res => setTimeout(() => res(token), 1000));
};

module.exports = {
  initialBlogs, malformedID, initialUsers,
  prepareDatabases, getAllBlogs, getAllUsers,
  generateValidNonExistingID, createToken, getRandomValidToken, getRandomExpiredToken
};