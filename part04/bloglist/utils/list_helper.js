const dummy = blogs => {
  return 1;
};

const totalLikes = blogs => {
  return blogs.reduce((sum, { likes }) => sum + likes, 0);
};

const favoriteBlog = blogs => {
  if (!blogs.length) return {};

  const [{ title, author, likes }] = blogs.sort((blogA, blogB) => blogB.likes - blogA.likes);

  return { title, author, likes };
};

const mostBlogs = blogs => {
  if (!blogs.length) return {};

  const articlesByAuthors = {};

  for (const { author } of blogs) {
    if (!articlesByAuthors[author]) {
      articlesByAuthors[author] = 1;
    } else {
      ++articlesByAuthors[author];
    }
  }

  const blogCounts = Object.entries(articlesByAuthors);
  const mostBlogs = Math.max(...blogCounts.map(([, blogCount]) => blogCount));
  const mostBlogsIndex = blogCounts.findIndex(([, blogCount]) => blogCount === mostBlogs);
  const [mostBlogsByAuthor] = blogCounts[mostBlogsIndex];

  return { author: mostBlogsByAuthor, blogs: mostBlogs };
};

const mostLikes = blogs => {
  if (!blogs.length) return {};

  const likesByAuthors = {};

  for (const { author, likes } of blogs) {
    if (!likesByAuthors[author]) {
      likesByAuthors[author] = likes;
    } else {
      likesByAuthors[author] += likes;
    }
  }

  const likesCounts = Object.entries(likesByAuthors);
  const mostLikes = Math.max(...likesCounts.map(([, likesCount]) => likesCount));
  const mostLikesIndex = likesCounts.findIndex(([, likesCount]) => likesCount === mostLikes);
  const [mostLikesByAuthor] = likesCounts[mostLikesIndex];

  return { author: mostLikesByAuthor, likes: mostLikes };
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };