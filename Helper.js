import dotenv from "dotenv";
import fetch from "node-fetch";
import _ from "lodash";
dotenv.config();

async function fetchAndAnalyzeBlogData() {
  const response = await fetch(process.env.URL, {
    method: "GET",
    headers: {
      "x-hasura-admin-secret": process.env.ADMIN_KEY,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  // Total number of blogs fetched
  const totalBlogs = data.blogs.length;

  // Blog with the longest title
  const blogWithLongestTitle = _.maxBy(data.blogs, "title.length");

  // Number of blogs with titles containing the word "privacy"
  const blogsWithPrivacyInTitle = _.filter(data.blogs, (blog) =>
    _.includes(_.toLower(blog.title), "privacy")
  );

  // Array of unique blog titles
  const uniqueBlogTitles = _.uniqBy(data.blogs, "title");

  return {
    totalBlogs,
    blogWithLongestTitle,
    numberOfBlogsWithPrivacyInTitle: blogsWithPrivacyInTitle.length,
    uniqueBlogTitles,
  };
}

// Memoize the fetchAndAnalyzeBlogData function with a cache duration of 1 hour (in milliseconds)
export const memoizedFetchAndAnalyzeBlogData = _.memoize(
  fetchAndAnalyzeBlogData,
  () => Date.now() - 3600000
);

// function to fetch the blogs based on the query
export const searchBlogs = async (query) => {
  try {
    const response = await fetch(process.env.URL, {
      method: "GET",
      headers: {
        "x-hasura-admin-secret": process.env.ADMIN_KEY,
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Implementation of search 
      const searchResults = _.filter(data.blogs, (blog) =>
        _.includes(_.toLower(blog.title), _.toLower(query))
      );
      return searchResults;
    } else {
      res.status(response.status).send("Failed to fetch data");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
