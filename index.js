import express from "express";
import _ from "lodash";
import dotenv from "dotenv";
import { memoizedFetchAndAnalyzeBlogData, searchBlogs } from "./Helper.js";

// Configurations
dotenv.config();
const app = express();

// function for /api/blog-stats
app.get("/api/blog-stats", async (req, res) => {
  try {
    const analyticsResults = await memoizedFetchAndAnalyzeBlogData();
    res.json(analyticsResults);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// function for /api/blog-search?query=privacy
app.get("/api/blog-search", async (req, res) => {
  const query = req.query.query; // Get the query
  if (!query) {
    return res.status(400).json({ error: "Query parameter is missing" });
  }

  try {
    const response = await searchBlogs(query);
    if (response.length == 0) {
      // if the array is empty
      res.json("Requsted query not found");
    } else {
      res.json(response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
