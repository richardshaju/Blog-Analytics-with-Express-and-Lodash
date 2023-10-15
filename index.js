import express from "express";
import fetch from "node-fetch";
import _ from "lodash";
const app = express();
const port = 3000;


async function fetchAndAnalyzeBlogData() {
  const url = 'https://intent-kit-16.hasura.app/api/rest/blogs';
  const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-hasura-admin-secret': adminSecret,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const data = await response.json();

  // Calculate the total number of blogs fetched
  const totalBlogs = data.blogs.length;

  // Find the blog with the longest title
  const blogWithLongestTitle = _.maxBy(data.blogs, 'title.length');

  // Determine the number of blogs with titles containing the word "privacy"
  const blogsWithPrivacyInTitle = _.filter(data.blogs, (blog) =>
    _.includes(_.toLower(blog.title), 'privacy')
  );

  // Create an array of unique blog titles (no duplicates)
  const uniqueBlogTitles = _.uniqBy(data.blogs, 'title');

  return {
    totalBlogs,
    blogWithLongestTitle,
    numberOfBlogsWithPrivacyInTitle: blogsWithPrivacyInTitle.length,
    uniqueBlogTitles,
  };
}

// Memoize the fetchAndAnalyzeBlogData function with a cache duration of 1 hour (in milliseconds)
const memoizedFetchAndAnalyzeBlogData = _.memoize(fetchAndAnalyzeBlogData, () => Date.now() - 3600000);



app.get("/api/blog-stats", async (req, res) => {
  try {
    const analyticsResults = await memoizedFetchAndAnalyzeBlogData();
    res.json(analyticsResults);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


async function queryBlogData(query) {
  const url = 'https://intent-kit-16.hasura.app/api/rest/blogs';
  const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';
  if (!query) {
    return 'Query parameter is missing' 
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-hasura-admin-secret': adminSecret,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const data = await response.json();

  const searchResults = _.filter(data.blogs, (blog) =>
        _.includes(_.toLower(blog.title), _.toLower(query))
      );

  return {
    searchResults

  };
}

// Memoize the fetchAndAnalyzeBlogData function with a cache duration of 1 hour (in milliseconds)
const queryBlog = (query) => _.memoize(queryBlogData(query), () => Date.now() - 3600000);



app.get('/api/blog-search', async (req, res) => {
  const query = req.query.query; 

  try {
    const analyticsResults = await queryBlog(query);
    res.json(analyticsResults);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
