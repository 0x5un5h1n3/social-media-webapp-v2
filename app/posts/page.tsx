"use client"; // Add this line at the top of the file

import React, { useEffect, useState } from "react";
import PostForm from "../../components/PostForm";
import PostsList from "../../components/PostsList";
import axios from "axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);

  // Define the fetchPosts function
  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("/api/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(response.data);
  };

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Manage Your Posts</h1>
      <PostForm fetchPosts={fetchPosts} /> {/* Pass fetchPosts as a prop */}
      <PostsList posts={posts} /> {/* Pass posts to PostsList */}
    </div>
  );
};

export default Posts;
